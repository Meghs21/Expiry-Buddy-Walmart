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

// Middleware to parse form data from <form> submissions (like signup)
app.use(express.urlencoded({ extended: true }));

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

// ORIGINALL HOMEEEE

// app.get("/", async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.render("home", { products });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to load products");
//   }
// });
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/", (req, res) => {
  res.redirect("/signup");
});


app.get("/upload", (req, res) => {
  res.render("upload");
});

// ✅ NEW: POST /upload form submission
app.post("/upload", async (req, res) => {
  try {
    const {
      name,
      price,
      discount,
      quantity,
      expiryDate,
      category,
      imageUrl,
      location,
    } = req.body;

    const finalPrice = price - (price * (discount || 0)) / 100;

    const newProduct = new Product({
      name,
      category,
      price,
      discount,
      finalPrice,
      expiryDate,
      quantity,
      imageUrl,
      sellerName: "Retailer",
      location,
    });

    await newProduct.save();

    res.send("<h2>✅ Product uploaded successfully!</h2><a href='/upload'>Upload another</a>");
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).send("❌ Failed to upload product");
  }
});


app.get("/browse", async (req, res) => {
  try {
    const products = await Product.find(); // if browse.ejs expects this
    res.render("browse", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load browse page");
  }
});
const User = require("./models/User"); // make sure this is imported

// GET signup page
app.get("/home", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load products");
  }
});

// POST signup form

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.send("User already exists");

    const user = new User({ username, email, password });
    await user.save();

    res.redirect("/home");  // 👈 Redirect to main page after signup
  } catch (err) {
    console.error(err);
    res.send("❌ Signup failed");
  }
});



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
