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
// const googleAuthRoutes = require("./routes/googleAuthRoutes");
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
// app.use("/auth", googleAuthRoutes);


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
// For HTML form submissions (non-API routes)
app.use("/products", productRoutes);



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

    res.render('wishlist', { wishlist }); 
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
  const redirectUrl = req.query.redirect || "/signup"; // Get redirect URL from query parameter or default to /signup
  
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error during logout:", err);
      return res.status(500).send("Logout failed");
    }
    res.clearCookie("connect.sid");
    res.redirect(redirectUrl);
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
    // Parse filters from query
    const {
      priceMin,
      priceMax,
      categories,
      locations,
      expiryFrom,
      expiryTo,
      inStock,
      sortBy,
      show,
      page
    } = req.query;

    // Build MongoDB query
    const query = {};
    if (priceMin || priceMax) {
      query.finalPrice = {};
      if (priceMin) query.finalPrice.$gte = Number(priceMin);
      if (priceMax) query.finalPrice.$lte = Number(priceMax);
    }
    if (categories) {
      const cats = Array.isArray(categories) ? categories : [categories];
      if (!cats.includes("All Categories")) query.category = { $in: cats };
    }
    if (locations) {
      const locs = Array.isArray(locations) ? locations : [locations];
      if (!locs.includes("All Locations")) query.location = { $in: locs };
    }
    if (expiryFrom || expiryTo) {
      query.expiryDate = {};
      if (expiryFrom) query.expiryDate.$gte = new Date(expiryFrom);
      if (expiryTo) query.expiryDate.$lte = new Date(expiryTo);
    }
    if (inStock === "true") {
      query.quantity = { $gt: 0 };
    }

    // Sorting
    let sort = { expiryDate: 1 };
    if (sortBy === "discount") sort = { discount: -1 };
    else if (sortBy === "priceLowHigh") sort = { finalPrice: 1 };
    else if (sortBy === "priceHighLow") sort = { finalPrice: -1 };
    // else expiryDate default

    // Pagination
    const perPage = show === "All" ? 1000 : Number(show) || 16;
    const currentPage = Number(page) || 1;
    const skip = (currentPage - 1) * perPage;

    // Get total count for display
    const totalProducts = await Product.countDocuments(query);

    // Fetch products
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(perPage);

    // Wishlist logic
    let wishlist = [];
    if (req.session.userId) {
      wishlist = await Wishlist.find({ userId: req.session.userId }).select("productId");
    }
    const wishlistIds = wishlist.map(w => w.productId.toString());
    const productsWithFlags = products.map(product => ({
      ...product.toObject(),
      isWishlisted: wishlistIds.includes(product._id.toString()),
    }));

    // For dynamic filter options (categories, locations, price range)
    const allCategories = await Product.distinct("category");
    const allLocations = await Product.distinct("location");
    const minPrice = await Product.find().sort({ finalPrice: 1 }).limit(1).then(p => p[0]?.finalPrice || 0);
    const maxPrice = await Product.find().sort({ finalPrice: -1 }).limit(1).then(p => p[0]?.finalPrice || 1000);

    res.render("browse", {
      products: productsWithFlags,
      totalProducts,
      allCategories,
      allLocations,
      minPrice,
      maxPrice,
      perPage,
      currentPage,
      query: req.query
    });
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

  const cartQty = item.quantity;
  const remainingQty = product.quantity - cartQty;

  if (remainingQty <= 0) {
    // All units sold, move to history and delete
    await moveProductToHistory({ ...product.toObject(), quantity: cartQty }, true);
    await Product.findByIdAndDelete(product._id);
  } else {
    // Partial sale, update product quantity
    await Product.findByIdAndUpdate(product._id, { $set: { quantity: remainingQty } });

    // Optional: Save a partial sale entry in history
    await moveProductToHistory({ ...product.toObject(), quantity: cartQty }, true);
  }

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
  await Cart.deleteMany({ productId: { $in: expiredProductIds } });
  await Wishlist.deleteMany({ productId: { $in: expiredProductIds } });

  console.log(`✅ Archived and donated ${expiredProducts.length} expired products.`);
} catch (err) {
console.error("❌ Error in daily cron job:", err);
}
});
// 🔧 Manual test for cron job logic
(async () => {
  console.log("⚙️ Manually testing expiry logic now...");
  const expiredProducts = await Product.find({ expiryDate: { $lt: new Date() } });

  for (const product of expiredProducts) {
    await moveProductToHistory(product, false);

    const donation = new Donation({
      productId: product._id,
      productName: product.name,
      quantity: product.quantity,
      expiryDate: product.expiryDate,
      originalLocation: product.location,
    });
    await donation.save();

    await Product.findByIdAndDelete(product._id);
  }

  const cartResult = await Cart.deleteMany({ productId: { $in: expiredProducts } });
  const wishlistResult = await Wishlist.deleteMany({ productId: { $in: expiredProducts } });

  console.log(`✅ Manually processed ${expiredProducts.length} expired products.`);
})();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
