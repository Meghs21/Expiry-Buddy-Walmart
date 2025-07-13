from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random
import os

# MongoDB connection
load_dotenv("../../backend/.env") 
client = MongoClient(os.getenv("MONGO_URI"))
db = client["expirybuddy"]
products = db["products"]
history = db["producthistories"]

history_products = list(history.find().limit(100))
print(f"Cloning {len(history_products)} products from history (without deleting existing ones)...")

count = 0

for hist in history_products:
    is_perishable = hist.get("is_perishable", True)
    
    if is_perishable:
        days_left = random.randint(1, 5)
    else:
        days_left = random.randint(5, 30)
    expiry_date = datetime.now() + timedelta(days=days_left)

    quantity = random.randint(5, 50)
    price = hist.get("price", 100)

    if days_left <= 2:
        discount = random.randint(50, 90)
    elif days_left <= 5:
        discount = random.randint(20, 50)
    else:
        discount = random.randint(0, 15)

    final_price = round(price - (price * discount / 100), 2)

    product = {
        "name": hist.get("name", "Unknown Product"),
        "category": hist.get("category", "General"),
        "price": price,
        "quantity": quantity,
        "is_perishable": is_perishable,
        "discount": discount,
        "finalPrice": final_price,
        "expiryDate": expiry_date,
        "imageUrl": hist.get("imageUrl", ""),
        "sellerName": hist.get("sellerName", "Default Seller"),
        "location": hist.get("location", "Unknown"),
        "createdAt": datetime.now(),
        "isSold": False
    }

    products.insert_one(product)
    count += 1

print(f"Inserted {count} new products cloned from history without touching existing data.")
