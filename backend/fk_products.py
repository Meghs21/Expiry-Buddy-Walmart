from faker import Faker
from pymongo import MongoClient
from datetime import datetime, timedelta
import random

# MongoDB Atlas connection
client = MongoClient("mongodb+srv://expiryuser:test1234@expirybuddy-db.sk4fszh.mongodb.net/expirybuddy?retryWrites=true&w=majority&appName=expirybuddy-db")
db = client["expirybuddy"]
products = db["products"]

faker = Faker()

# Product categories and perishable flags
categories = {
    "Dairy": 1,
    "Bakery": 1,
    "Snacks": 0,
    "Beverages": 0,
    "Packaged Food": 0
}

# Category image URLs
category_images = {
    "Dairy": "https://img.freepik.com/free-photo/view-allergens-commonly-found-dairy_23-2150170319.jpg",
    "Snacks": "https://i.pinimg.com/736x/76/ce/98/76ce988739f04866aad7a32c42ab8fe3.jpg",
    "Bakery": "https://i.pinimg.com/1200x/6d/17/6d/6d176d4d9273b5919ea7a00dfa23c756.jpg",
    "Packaged Food": "https://cdn.prod.website-files.com/651a8dcc505508a8b2c00a72/6828d4d2c8bbccc8ee0a07c0_ChatGPT%20Image%20May%2018%2C%202025%2C%2001_39_40%20AM.png",
    "Beverages": "https://i.pinimg.com/736x/6d/a4/13/6da413d06fc0c4884fc4a77efd4a69d9.jpg"
}

# Predefined list of 6 seller names (major retailers)
retailers = [
    "Walmart",
    "Target",
    "Costco",
    "Kroger",
    "Whole Foods",
    "Safeway"
]

# Clear collection for clean insert (optional)
products.delete_many({})

# Generate 200 fake product documents
for _ in range(200):
    category = random.choice(list(categories.keys()))
    is_perishable = categories[category]
    name = faker.word().capitalize() + " " + category
    price = round(random.uniform(20, 300), 2)
    quantity = random.randint(1, 30)

    # Logical expiry dates
    if is_perishable:
        days_left = random.randint(1, 5)
    else:
        days_left = random.randint(5, 30)
    expiry_date = datetime.now() + timedelta(days=days_left)

    # Logical discount based on expiry
    if days_left <= 2:
        discount = random.randint(50, 90)
    elif days_left <= 5:
        discount = random.randint(20, 50)
    else:
        discount = random.randint(0, 15)

    final_price = round(price - (price * discount / 100), 2)


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
        "createdAt": datetime.now(),
        "isSold": False
    }

    products.insert_one(product)

print("✅ Inserted 200 logically consistent fake products into MongoDB Atlas.")
