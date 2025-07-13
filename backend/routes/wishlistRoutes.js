const express = require("express");
const router = express.Router();
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

// GET wishlist items for current user
router.get("/", async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect("/signup");

    const items = await Wishlist.find({ userId: req.session.userId }).populate("productId");

    res.render("wishlist", { wishlist: items });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load wishlist");
  }
});

// ADD product to wishlist
router.post("/add/:productId", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(403).send("Login required");

    const { productId } = req.params;

    const existing = await Wishlist.findOne({ userId: req.session.userId, productId });
    if (existing) return res.status(400).send("Already in wishlist");

    await Wishlist.create({ userId: req.session.userId, productId });
    res.redirect("/wishlist");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add to wishlist");
  }
});

// REMOVE from wishlist
router.post("/remove/:productId", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(403).send("Login required");

    await Wishlist.deleteOne({ userId: req.session.userId, productId: req.params.productId });
    res.redirect("/wishlist");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to remove from wishlist");
  }
});

module.exports = router;
