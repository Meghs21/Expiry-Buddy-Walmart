const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const ProductHistory = require("../models/ProductHistory");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const histories = await ProductHistory.find().limit(20);

    for (const hist of histories) {
      console.log("Checking ProductHistory for ID:", hist.productId);
      const product = await Product.findById(hist.productId);
      
      if (!product) {
        console.log("No product found with ID:", hist.productId, "\n");
      } else {
        console.log("✔ Match:", hist.name === product.name);
        console.log("History Product:", hist.name);
        console.log("Original Product:", product.name, "\n");
      }
    }

    process.exit();
  })
  .catch(err => {
    console.error("Mongo error:", err);
    process.exit(1);
  });
