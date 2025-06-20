// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const productRoutes = require("./routes/productRoutes");

// dotenv.config();
// const app = express();

// // Middleware to parse JSON
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // API Routes
// app.use("/api/products", productRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("🟢 API is running");
// });

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path"); // 👉 to handle path to views
const productRoutes = require("./routes/productRoutes");
const Product = require("./models/Product");

dotenv.config();
const app = express();

// 📌 Setup EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));


// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/products", productRoutes);

// 👇 Render the EJS page on root URL
// app.get("/", (req, res) => {
//   res.render("home"); // renders home.ejs from frontend/views/
// });

app.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load products");
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
