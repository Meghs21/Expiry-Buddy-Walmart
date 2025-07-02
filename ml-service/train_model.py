import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

# Load env
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Connect to DB
client = MongoClient(MONGO_URI)
db = client["expirybuddy"]
collection = db["producthistories"]

# Fetch data
data = pd.DataFrame(list(collection.find()))
print("✅ Records fetched:", len(data))

# Drop _id
data.drop(columns=["_id"], inplace=True, errors="ignore")

# Clean dates
data["expiryDate"] = pd.to_datetime(data["expiryDate"], errors="coerce")
data["dateSold"] = pd.to_datetime(data["dateSold"], errors="coerce")
data.dropna(subset=["expiryDate", "dateSold"], inplace=True)
data["daysTillExpiry"] = (data["expiryDate"] - data["dateSold"]).dt.days
data.drop(columns=["expiryDate", "dateSold"], inplace=True)

# # Fill missing numerical columns
# for col in ["views", "clicks", "wishlistCount", "quantity"]:
#     data[col] = data.get(col, 0).fillna(0)

# Encode categorical
for col in ["category", "sellerName", "sellerType"]:
    if col in data.columns:
        data[col] = LabelEncoder().fit_transform(data[col].astype(str))

# Ensure target exists
if "discount" not in data.columns:
    raise ValueError("❌ 'discount' column missing!")

# Feature/label split
X = data.drop(columns=["discount"])
y = data["discount"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("📊 MAE:", mean_absolute_error(y_test, y_pred))
print("📊 R²:", r2_score(y_test, y_pred))

# Save model
joblib.dump(model, "discount_model.pkl")
print("✅ Model saved as discount_model.pkl")
