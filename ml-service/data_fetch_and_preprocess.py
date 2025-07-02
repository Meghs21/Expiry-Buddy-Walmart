import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from sklearn.preprocessing import LabelEncoder

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["expirybuddy"]
collection = db["products"]  # using live products collection

# Fetch data
data = pd.DataFrame(list(collection.find()))
print("✅ Records fetched:", len(data))

# Drop MongoDB _id and any unwanted fields
data.drop(columns=["_id", "description", "imageUrl"], inplace=True, errors="ignore")

# Convert date fields to datetime
data["expiryDate"] = pd.to_datetime(data["expiryDate"], errors="coerce")
data["createdAt"] = pd.to_datetime(data["createdAt"], errors="coerce")

# Drop rows with invalid dates
data = data.dropna(subset=["expiryDate", "createdAt"])

# Calculate days till expiry
data["daysTillExpiry"] = (data["expiryDate"] - data["createdAt"]).dt.days

# Drop raw date columns
data.drop(columns=["expiryDate", "createdAt"], inplace=True)

# Fill missing numerical fields if any
data["views"] = data["views"].fillna(0)

data["wishlistCount"] = data["wishlistCount"].fillna(0)
data["clicks"] = data["clicks"].fillna(0)
data["quantity"] = data["quantity"].fillna(1)

# Encode category and sellerName
data["category"] = LabelEncoder().fit_transform(data["category"].astype(str))
data["sellerName"] = LabelEncoder().fit_transform(data["sellerName"].astype(str))

# Final output for preview
print("✅ Processed data sample:")
print(data.head())

# Optionally save for ML use
data.to_csv("live_products_processed.csv", index=False)
#print("📁 Saved to live_products_processed.csv")