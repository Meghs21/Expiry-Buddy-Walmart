import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error
import joblib

from utils.data_loader import load_data

from datetime import datetime

def preprocess(df):

    df["is_perishable"] = df["is_perishable"].astype(int)

    # Convert date columns to datetime if not already
    df["createdAt"] = pd.to_datetime(df["createdAt"])
    df["expiryDate"] = pd.to_datetime(df["expiryDate"])

    # Create new feature: days until expiry from creation
    df["days_until_expiry"] = (df["expiryDate"] - df["createdAt"]).dt.days

    # Drop unused or problematic columns
    df = df.drop(columns=[
        "_id", "productId", "name", "dateSold", "createdAt",
        "expiryDate", "finalPrice", "views", "clicks", "__v"
    ])

    # Encode categorical columns
    encoders = {}
    for col in ["category", "sellerName", "location"]:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        encoders[col] = le


    # Prepare X and y
    X = df.drop("discount", axis=1)
    y = df["discount"]

    return X, y, encoders



def main():
    df = load_data()
    X, y, encoders = preprocess(df)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"✅ Trained. MSE: {mse:.2f}")

    joblib.dump(model, "model.pkl")
    print("📦 Model saved to model.pkl")

    joblib.dump(encoders, "encoders.pkl")


if __name__ == "__main__":
    main()
