const mongoose = require("mongoose");
require("dotenv").config();
const { faker } = require("@faker-js/faker");

const Product = require("../models/Product");
const ProductHistory = require("../models/ProductHistory");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const generateHistoryFromProduct = (product) => {
  const historyCount = faker.number.int({ min: 3, max: 10 });
  const histories = [];

  for (let i = 0; i < historyCount; i++) {
    const discount = faker.number.int({ min: 0, max: 60 });
    const soldInDays = faker.number.int({ min: 1, max: 30 });
    const dateSold = new Date(product.createdAt || Date.now());
dateSold.setDate(dateSold.getDate() + soldInDays);


    histories.push({
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      discount,
      finalPrice: parseFloat((product.price * (1 - discount / 100)).toFixed(2)),
      quantity: faker.number.int({ min: 1, max: 20 }),
      views: faker.number.int({ min: 0, max: 200 }),
      clicks: faker.number.int({ min: 0, max: 200 }),
      wishlistCount: faker.number.int({ min: 0, max: 50 }),
      sellerName: product.sellerName,
      location: product.location,
      expiryDate: product.expiryDate,
      soldInDays,
      dateSold,
      wasSold: true,
      createdAt: dateSold
    });
  }

  return histories;
};

const insertFakeHistories = async () => {
  try {
    await ProductHistory.deleteMany({});
    console.log("🗑 Cleared old ProductHistory data");

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

(async () => {
  await connectDB();
  await insertFakeHistories();
})();