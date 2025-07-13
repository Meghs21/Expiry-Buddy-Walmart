from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv("../../backend/.env")  # Adjust path if needed

# Connect to MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["expirybuddy"]
products = db["products"]

# Hardcoded image URLs by category
category_image_map = {
    "Dairy": "https://img.freepik.com/free-photo/view-allergens-commonly-found-dairy_23-2150170319.jpg",
    "Snacks": "https://i.pinimg.com/736x/76/ce/98/76ce988739f04866aad7a32c42ab8fe3.jpg",
    "Bakery": "https://i.pinimg.com/1200x/6d/17/6d/6d176d4d9273b5919ea7a00dfa23c756.jpg",
    "Packaged Food": "https://cdn.prod.website-files.com/651a8dcc505508a8b2c00a72/6828d4d2c8bbccc8ee0a07c0_ChatGPT%20Image%20May%2018%2C%202025%2C%2001_39_40%20AM.png",
    "Beverages": "https://i.pinimg.com/736x/6d/a4/13/6da413d06fc0c4884fc4a77efd4a69d9.jpg",
}

# Overwrite imageUrl for ALL products based on category
updated_count = 0
for product in products.find():
    category = product.get("category")

    if category in category_image_map:
        new_url = category_image_map[category]
        products.update_one(
            {"_id": product["_id"]},
            {"$set": {"imageUrl": new_url}}
        )
        updated_count += 1

print(f"\n✅ Done. Replaced image URLs for {updated_count} products.")
