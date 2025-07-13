const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const bcrypt = require("bcryptjs");

// Customer Signup
router.post("/customers/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.redirect("/signup?error=exists"); // Already registered
    }

    // No need to hash manually if model has pre-save hook
    const customer = new Customer({
      fullName,
      email,
      phone,
      password, // plain, will be hashed by pre-save
    });

    await customer.save();

    // Set session
    req.session.userId = customer._id;
    req.session.userRole = "customer";

    return res.redirect("/home?registered=true");
  } catch (err) {
    console.error("Customer signup error:", err);
    return res.redirect("/signup?error=server");
  }
});

// Customer Login
router.post("/customers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.redirect("/signup?error=notregistered");
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.redirect("/signup?error=invalid");
    }

    // Set session
    req.session.userId = customer._id;
    req.session.userRole = "customer";

    return res.redirect("/home");
  } catch (err) {
    console.error("Customer login error:", err);
    return res.redirect("/signup?error=server");
  }
});

module.exports = router;
