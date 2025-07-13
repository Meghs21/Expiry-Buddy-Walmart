const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");

// Add expired product to donations
router.post("/donations", async (req, res) => {
  try {
    const { productId, productName, quantity, expiryDate, originalLocation } = req.body;

    const donation = new Donation({
      productId,
      productName,
      quantity,
      expiryDate,
      originalLocation,
    });

    await donation.save();
    res.status(201).json({ message: "Donation recorded successfully" });
  } catch (err) {
    console.error("Error adding donation:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// View all donations
// router.get("/donations", async (req, res) => {
//   try {
//     const donations = await Donation.find().populate("productId");
//     res.json(donations);
//   } catch (err) {
//     console.error("Error fetching donations:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// Render EJS donation page
router.get("/donations", async (req, res) => {
  try {
    const donations = await Donation.find().populate("productId");
    res.render("donations", { donations }); // Pass data to donations.ejs
  } catch (err) {
    console.error("Error rendering donation page:", err);
    res.status(500).send("Error loading donation page");
  }
});


module.exports = router;
