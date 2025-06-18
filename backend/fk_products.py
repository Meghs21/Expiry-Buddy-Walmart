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
    "Dairy": "https://images.unsplash.com/photo-1589927986089-35812388d1a2",
    "Bakery": "https://images.unsplash.com/photo-1608198093002-ad4e005484b9",
    "Snacks": "https://images.unsplash.com/photo-1585238342029-3f84c61e5efb",
    "Beverages": "https://images.unsplash.com/photo-1583422409516-8fd4e0b17ed2",
    "Packaged Food": "https://images.unsplash.com/photo-1601050694283-724f4ec31342"
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

    # Views/clicks influenced by discount
    views = random.randint(50, 200) if discount >= 50 else random.randint(5, 50)
    clicks = random.randint(20, 100) if discount >= 50 else random.randint(0, 20)

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
        "views": views,
        "clicks": clicks,
        "wishlistCount": random.randint(0, 30),
        "isSold": False
    }

    products.insert_one(product)

print("✅ Inserted 200 logically consistent fake products into MongoDB Atlas.")
