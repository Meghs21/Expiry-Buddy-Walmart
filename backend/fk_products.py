from faker import Faker
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import random

load_dotenv("../backend/.env")
# MongoDB connection
client = MongoClient(os.getenv("MONGO_URI"))
db = client["expirybuddy"]
products = db["products"]

faker = Faker()

# Product categories
categories = ["Dairy", "Bakery", "Snacks", "Beverages", "Packaged Food"]

# Category image URLs
category_images = {
    "Dairy": "https://img.freepik.com/free-photo/view-allergens-commonly-found-dairy_23-2150170319.jpg",
    "Snacks": "https://i.pinimg.com/736x/76/ce/98/76ce988739f04866aad7a32c42ab8fe3.jpg",
    "Bakery": "https://i.pinimg.com/1200x/6d/17/6d/6d176d4d9273b5919ea7a00dfa23c756.jpg",
    "Packaged Food": "https://cdn.prod.website-files.com/651a8dcc505508a8b2c00a72/6828d4d2c8bbccc8ee0a07c0_ChatGPT%20Image%20May%2018%2C%202025%2C%2001_39_40%20AM.png",
    "Beverages": "https://i.pinimg.com/736x/6d/a4/13/6da413d06fc0c4884fc4a77efd4a69d9.jpg"
}

# Predefined retailer names
retailers = ["Walmart", "Target", "Costco", "Kroger", "Whole Foods", "Safeway"]

# Clear collection for fresh data
products.delete_many({})

def compute_is_perishable(category, expiry_date, created_at):
    # Retailer override not used here (faker)
    if category in ["Dairy", "Bakery"]:
        return True
    if expiry_date:
        days = (expiry_date - created_at).days
        if days <= 15:
            return True
    return False

# Generate 200 fake products
for _ in range(200):
    category = random.choice(categories)
    name = faker.word().capitalize() + " " + category
    price = round(random.uniform(20, 300), 2)
    quantity = random.randint(1, 30)
    created_at = datetime.now()

    # Decide expiry type (60% full date, 40% month-year)

    if category in ["Dairy", "Bakery"]:
            days_left = random.randint(1, 15)
            expiry_date = created_at + timedelta(days=days_left)
    else:
        if random.random() < 0.6:
            days_left = random.randint(2, 90)
            expiry_date = created_at + timedelta(days=days_left)
        else:
            months_ahead = random.randint(1, 12)
            future_date = created_at + timedelta(days=30 * months_ahead)
            expiry_date = datetime(future_date.year, future_date.month, 1)
            days_left = (expiry_date - created_at).days

    # Compute discount
    if days_left <= 2:
        discount = random.randint(50, 90)
    elif days_left <= 5:
        discount = random.randint(20, 50)
    else:
        discount = random.randint(0, 15)

    final_price = round(price - (price * discount / 100), 2)
    is_perishable = compute_is_perishable(category, expiry_date, created_at)

    product = {
        "name": name,
        "category": category,
        "price": price,
        "quantity": quantity,
        "is_perishable": is_perishable,
        "discount": discount,
        "finalPrice": final_price,
        "expiryDate": expiry_date,
        "imageUrl": category_images[category],
        "sellerName": random.choice(retailers),
        "location": faker.city(),
        "createdAt": created_at,
        "isSold": False,
        "movedToDonation": False
    }

    products.insert_one(product)

print("✅ Inserted 200 fake products with new expiry logic into MongoDB Atlas.")
