// routes/saleRoutes.js
const express = require("express");
const router = express.Router();
const { handleProductSold } = require("../controllers/saleController");

router.post("/sell/:id", handleProductSold);

module.exports = router;
