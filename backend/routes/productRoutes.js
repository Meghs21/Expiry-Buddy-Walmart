const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProductForm,  // 🆕 for HTML form
  createProductAPI,   // 🆕 for fetch/postman
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");


const Product = require("../models/Product");
const moveProductToHistory = require("../utils/moveToHistory");

// Define routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProductForm); // 👈 for form submissions
router.post("/api", createProductAPI); // 👈 for fetch/ajax/api usage
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);



// ➕ Your new ones
router.post("/sell/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("❌ Product not found");

    await moveProductToHistory(product, true);
    await product.remove();

    res.send("✅ Product sold and moved to history");
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to move product to history");
  }
});

router.post("/archiveExpired", async (req, res) => {
  try {
    const now = new Date();
    const expiredProducts = await Product.find({ expiryDate: { $lt: now } });

    for (const product of expiredProducts) {
      await moveProductToHistory(product, false);
      await product.remove();
    }

    res.send(`✅ Archived ${expiredProducts.length} expired products`);
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to archive expired products");
  }
});

// ➕ New: Increment views
router.get("/view/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("❌ Product not found");

    product.views += 1;
    await product.save();

    res.redirect(`/products/${product._id}`); // redirect to existing detail route
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to update views");
  }
});

// ➕ New: Add to wishlist
router.post("/wishlist/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send("❌ Product not found");

    product.wishlistCount += 1;
    await product.save();

    res.json({ message: "✅ Added to wishlist" });
  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Failed to update wishlist count");
  }
});


// ✅ Export everything at the end
module.exports = router;