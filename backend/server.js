const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path"); // 👉 to handle path to views
const cron = require("node-cron");
const passport = require("passport");

//Routes & models
const productRoutes = require("./routes/productRoutes");
const Product = require("./models/Product");
const productHistoryRoutes = require("./routes/productHistoryRoutes");
const customerAuthRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const retailerRoutes = require("./routes/retailerRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const Cart = require("./models/Cart");
const Wishlist = require("./models/Wishlist");
const Customer = require("./models/Customer");
const ProductHistory = require("./models/ProductHistory");
const moveProductToHistory = require("./utils/moveToHistory");
const Donation = require('./models/Donation');
const donationRoutes = require("./routes/donationRoutes");




dotenv.config();
const app = express();

//session setup
const session = require("express-session");
const MongoStore = require("connect-mongo");

app.use(session({
  secret: "expirybuddy-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Initialize passport
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// 📌 Setup EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "frontend", "views"));


// Middleware to parse JSON
app.use(express.json());

// Middleware to parse form data from <form> submissions (like signup)
app.use(express.urlencoded({ extended: true }));

//middleware for auth
app.use("/auth", customerAuthRoutes);
app.use("/auth", googleAuthRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/history", productHistoryRoutes);
app.use("/api", retailerRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/api", donationRoutes);


// ORIGINALL HOMEEEE

// Middleware to get cart and wishlist counts and user info for all routes
app.use(async (req, res, next) => {
  try {
    let cartCount = 0;
    let wishlistCount = 0;
    let user = null;
    
    if (req.session.userId) {
      cartCount = await Cart.countDocuments({ userId: req.session.userId });
      wishlistCount = await Wishlist.countDocuments({ userId: req.session.userId });
      
      // Get user information if logged in
      if (req.session.userRole === "customer") {
        user = await Customer.findById(req.session.userId).select("fullName email");
      }
    }
    
    res.locals.cartCount = cartCount;
    res.locals.wishlistCount = wishlistCount;
    res.locals.user = user;
    res.locals.isLoggedIn = !!req.session.userId;
    next();
  } catch (err) {
    console.error("Error getting counts or user info:", err);
    next();
  }
});

app.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("home", { products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load products");
  }
});

app.get("/retailer", (req, res) => {
res.render("retailer");
});

app.get("/wishlist", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/signup");
    }
    
    const wishlist = await Wishlist.find({ userId: req.session.userId }).populate("productId");
    res.render("wishlist", { wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load wishlist");
  }
});

app.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find(); // Fetch all donations
    res.render('donations', { donations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching donations');
  }
});

app.get("/cart", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/signup");
    }
    
    const cartItems = await Cart.find({ userId: req.session.userId }).populate("productId");
    res.render("cart", { cartItems });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load cart");
  }
});

app.get("/signup", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/home");
  }
  res.render("signup");
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error during logout:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    res.redirect("/signup"); // or homepage or login page
  });
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
    const products = await Product.find();

    let wishlist = [];
    if (req.session.userId) {
      wishlist = await Wishlist.find({ userId: req.session.userId }).select("productId");
    }

    const wishlistIds = wishlist.map(w => w.productId.toString());

    const productsWithFlags = products.map(product => ({
      ...product.toObject(),
      isWishlisted: wishlistIds.includes(product._id.toString()),
    }));

    res.render("browse", { products: productsWithFlags });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load browse page");
  }
});
// GET home page
app.get("/home", async (req, res) => {
  try {
    const products = await Product.find();
    let user = null;

    if (req.session.userId && req.session.userRole === "customer") {
      user = await Customer.findById(req.session.userId);
    }

    res.render("home", {
      products,
      isLoggedIn: !!user,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load products");
  }
});

// moving soldout stuff 

app.post("/checkout", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect("/signup");
    }

    if (!req.session.userId) {
    console.log("❌ Not logged in");
    return res.redirect("/signup");
    }
    const cartItems = await Cart.find({ userId: req.session.userId }).populate("productId");

    for (const item of cartItems) {
      const product = item.productId;

      if (!product) continue;

      // Move product to history and mark as sold
      await moveProductToHistory(product, true);
      await Product.findByIdAndDelete(product._id); // or use isSold if you prefer

      // Remove from cart
      await Cart.findByIdAndDelete(item._id);
    }

    res.send("<h2>✅ Checkout complete! Products sold and cart cleared.</h2><a href='/browse'>Browse more</a>");
  } catch (error) {
    console.error("❌ Checkout Error:", error);
    res.status(500).send("❌ Something went wrong during checkout.");
  }
});

app.get("/checkout", (req, res) => {
  res.redirect("/cart"); // or res.render("checkoutConfirm");
});
// ⏰ Cron Job – Runs every day at midnight
cron.schedule("0 0 * * *", async () => {
console.log("🕒 Running daily expiry check...");

try {
const expiredProducts = await Product.find({
expiryDate: { $lt: new Date() },
});

for (const product of expiredProducts) {
  // Archive to ProductHistory
  await moveProductToHistory(product, false);

  // Log in Donations
  const donation = new Donation({
    productId: product._id,
    productName: product.name,
    quantity: product.quantity,
    expiryDate: product.expiryDate,
    originalLocation: product.location,
  });
  await donation.save();

  // Delete from Products collection
  await Product.findByIdAndDelete(product._id);
}

console.log(`✅ Archived and donated ${expiredProducts.length} expired products.`);
} catch (err) {
console.error("❌ Error in daily cron job:", err);
}
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
