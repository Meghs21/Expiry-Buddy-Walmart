import pandas as pd
import joblib
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import os
from bson import ObjectId
from sklearn.preprocessing import LabelEncoder
import logging

def run_prediction_update():

    # Load env
    load_dotenv("../backend/.env")

    client = MongoClient(os.getenv("MONGO_URI"))
    db = client["expirybuddy"]
    products_col = db["products"]
    history_col = db["producthistories"]

    # Load trained model
    model = joblib.load("model.pkl")
    encoders = joblib.load("encoders.pkl")

    # Get unsold products
    live_products = list(products_col.find({"isSold": False}))

    if not live_products:
        print("⚠️ No live unsold products found.")
        exit()

    data = []
    product_ids = []

    for prod in live_products:
        prod_id = prod["_id"]
        product_ids.append(prod_id)
        category = prod.get("category", "")  
        seller = prod.get("sellerName", "")  
        location = prod.get("location", "")  
        price = prod.get("price", 0)  
        quantity = prod.get("quantity", 0)  
        is_perishable = int(prod.get("is_perishable", True))  
        created_at = prod.get("createdAt", datetime.now())  
        expiry = prod.get("expiryDate", datetime.now())  
        days_until_expiry = (expiry - created_at).days  


        # 2. From ProductHistory (optional)  
        history = history_col.find_one({"productId": prod_id}, sort=[("createdAt", -1)])  
        if history:  
            wishlist_count = history.get("wishlistCount", 0)  
        else:  
            wishlist_count = 0  # default fallback  

        row = {  
            "category": category,  
            "sellerName": seller,  
            "location": location,  
            "price": price,  
            "quantity": quantity,  
            "wishlistCount": wishlist_count,  
            "is_perishable": is_perishable,  
            "days_until_expiry": days_until_expiry,  
            "soldInDays": 0,     # default for unsold live product
            "wasSold": 0         # default for unsold live product
        }

        data.append(row)  

    df = pd.DataFrame(data)

    for col in ["category", "sellerName", "location"]:
        le = encoders[col]
        df[col] = le.transform(df[col])
        df[col] = df[col].apply(lambda x: x if x in le.classes_ else le.classes_[0])
        df[col] = le.transform(df[col])


    # Remove unnecessary columns
    X = df[['category', 'price', 'quantity', 'wishlistCount', 'sellerName', 'location', 'is_perishable', 'soldInDays', 'wasSold', 'days_until_expiry']]

    # Predict discounts
    predicted_discounts = model.predict(X)

    # Update MongoDB with new discount and finalPrice
    for i, prod_id in enumerate(product_ids):
        discount = float(predicted_discounts[i])
        original_price = live_products[i].get("price", 0)
        final_price = round(original_price - (original_price * discount / 100), 2)

        products_col.update_one(
            {"_id": ObjectId(prod["_id"])},
            {
                "$set": {
                    "discount": discount,
                    "finalPrice": final_price
                }
            }
        )
    logging.basicConfig(filename="ml_update.log", level=logging.INFO, format='%(asctime)s - %(message)s')
    logging.info("✅ Discounts updated for all live products.")

if __name__ == "__main__":
    run_prediction_update()
