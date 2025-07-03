// 🔧 Import required modules
const mongoose = require("mongoose");
require("dotenv").config();
const { faker } = require("@faker-js/faker");

const Product = require("../models/Product");
const ProductHistory = require("../models/ProductHistory");

// 🔌 Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// 📦 Generate multiple fake sale history records for a product
const generateHistoryFromProduct = (product) => {
  const historyCount = faker.number.int({ min: 3, max: 10 });
  const histories = [];

  for (let i = 0; i < historyCount; i++) {
    const expiryDate = new Date(product.expiryDate);
    const isPerishable = product.is_perishable !== false;

    // 💡 Decide if product was sold (85% chance)
    const wasSold = Math.random() < 0.85;

    let soldInDays = null;
    let dateSold = null;
    let discount = 0;
    let finalPrice = product.price;

    if (wasSold) {
      // ⏳ Sold before expiry
      soldInDays = faker.number.int({ min: 1, max: 30 });
      dateSold = new Date(expiryDate);
      dateSold.setDate(expiryDate.getDate() - soldInDays);

      const daysLeft = Math.max(
        Math.floor((expiryDate - dateSold) / (1000 * 60 * 60 * 24)),
        0
      );

      // 🧠 Discount logic based on perishability and days left
      if (isPerishable) {
        if (daysLeft <= 2) {
          discount = faker.number.int({ min: 50, max: 90 });
        } else if (daysLeft <= 5) {
          discount = faker.number.int({ min: 20, max: 50 });
        } else {
          discount = faker.number.int({ min: 0, max: 15 });
        }
      } else {
        if (daysLeft <= 2) {
          discount = faker.number.int({ min: 20, max: 40 });
        } else if (daysLeft <= 5) {
          discount = faker.number.int({ min: 5, max: 20 });
        } else {
          discount = faker.number.int({ min: 0, max: 10 });
        }
      }

      finalPrice = parseFloat((product.price * (1 - discount / 100)).toFixed(2));
    }

    // 📄 Push one fake record into array
    histories.push({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      discount,
      finalPrice,
      quantity: faker.number.int({ min: 1, max: 20 }),
      views: faker.number.int({ min: 0, max: 200 }),
      clicks: faker.number.int({ min: 0, max: 200 }),
      wishlistCount: faker.number.int({ min: 0, max: 50 }),
      sellerName: product.sellerName,
      location: product.location,
      expiryDate: product.expiryDate,
      is_perishable: isPerishable,
      soldInDays,
      dateSold,
      wasSold
    });
  }

  return histories;
};

// 🚀 Insert all generated fake history records into MongoDB
const insertFakeHistories = async () => {
  try {
    await ProductHistory.deleteMany({});
    console.log("🗑️ Cleared old ProductHistory data");

    const products = await Product.find({});
    const allHistories = [];

    for (const product of products) {
      const histories = generateHistoryFromProduct(product);
      allHistories.push(...histories);
    }

    await ProductHistory.insertMany(allHistories);
    console.log(`✅ Inserted ${allHistories.length} new ProductHistory records.`);
    process.exit();
  } catch (err) {
    console.error("❌ Error during ProductHistory generation:", err);
    process.exit(1);
  }
};

// 🏁 Entry point
(async () => {
  await connectDB();
  await insertFakeHistories();
})();
