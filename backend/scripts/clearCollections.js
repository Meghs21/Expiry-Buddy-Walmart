const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") }); // Load backend/.env

// Corrected paths (we are in backend/scripts, so go up one level to models)
const Cart = require("../models/Cart");
const Donation = require("../models/Donation");
const Wishlist = require("../models/Wishlist");

const clearCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Cart.deleteMany({});
    console.log("🗑 Cleared Cart collection");

    await Donation.deleteMany({});
    console.log("🗑 Cleared Donation collection");

    await Wishlist.deleteMany({});
    console.log("🗑 Cleared Wishlist collection");

    console.log("🎉 All selected collections cleared!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error clearing collections:", err);
    process.exit(1);
  }
};

clearCollections();
