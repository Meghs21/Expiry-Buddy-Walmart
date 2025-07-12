const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// View cart
router.get("/", async (req, res) => {
  if (!req.session.userId) return res.redirect("/signup");

  const items = await Cart.find({ userId: req.session.userId }).populate("productId");
  res.render("cart", { cartItems: items });
});

// Add to cart
router.post("/add/:productId", async (req, res) => {
  if (!req.session.userId) return res.status(403).send("Login required");

  const { productId } = req.params;

  const existing = await Cart.findOne({ userId: req.session.userId, productId });

  if (existing) {
    existing.quantity += 1;
    await existing.save();
  } else {
    await Cart.create({ userId: req.session.userId, productId });
  }

  res.redirect("/cart");
});

// Update cart item quantity
router.post("/update/:productId", async (req, res) => {
  if (!req.session.userId) return res.status(403).send("Login required");

  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    await Cart.deleteOne({ userId: req.session.userId, productId });
  } else {
    await Cart.findOneAndUpdate(
      { userId: req.session.userId, productId },
      { quantity },
      { new: true }
    );
  }

  res.redirect("/cart");
});

// Remove from cart
router.post("/remove/:productId", async (req, res) => {
  if (!req.session.userId) return res.status(403).send("Login required");

  await Cart.deleteOne({ userId: req.session.userId, productId: req.params.productId });
  console.log("Cart items:", items.map(item => item.productId));

  res.redirect("/cart");
});

module.exports = router;
