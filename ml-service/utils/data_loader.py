from pymongo import MongoClient
import pandas as pd
import os
from dotenv import load_dotenv

def load_data():
    load_dotenv()
    MONGO_URI = os.getenv("MONGO_URI")

    client = MongoClient(MONGO_URI)

    db = client["expirybuddy"]  # replace with your actual DB name

    history_cursor = db["producthistories"].find()
    history_list = list(history_cursor)

    if not history_list:
        print("⚠️ No documents found in 'producthistories' collection.")
        return pd.DataFrame()

    history_df = pd.DataFrame(history_list)

    history_df = history_df[history_df["wasSold"] == True]
    return history_df
