const express = require("express");
const router = express.Router();
const Retailer = require("../models/Retailer");
const bcrypt = require("bcryptjs");

// 🔐 Retailer Sign Up
router.post("/retailers/signup", async (req, res) => {
  try {
    const { businessName, licenseNumber, email, password } = req.body;

    const existing = await Retailer.findOne({ email });
    if (existing) {
      return res.redirect("/?exists=true"); // fixed
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const retailer = new Retailer({
      businessName,
      licenseNumber,
      email,
      password: hashedPassword
    });

    await retailer.save();
    return res.redirect("/?registered=true"); // fixed

  } catch (err) {
    console.error("Signup error:", err);
    return res.redirect("/?error=server"); // fixed
  }
});


// 🔓 Retailer Login
router.post("/retailers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const retailer = await Retailer.findOne({ email });
    if (!retailer) {
      return res.redirect("/?error=notfound"); // fixed
    }

    const isMatch = await bcrypt.compare(password, retailer.password);
    if (!isMatch) {
      return res.redirect("/?error=invalid"); // fixed
    }

    // ✅ Set session for login
    req.session.userId = retailer._id;
    req.session.userRole = "retailer";

    return res.redirect("/retailer");

  } catch (err) {
    console.error("Login error:", err);
    return res.redirect("/?error=server"); // fixed
  }
});

module.exports = router;
