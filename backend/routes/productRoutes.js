const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// All API routes
router.get("/", getProducts);               // GET all products
router.get("/:id", getProductById);         // GET product by ID
router.post("/", createProduct);            // CREATE new product
router.put("/:id", updateProduct);          // UPDATE product by ID
router.delete("/:id", deleteProduct);       // DELETE product by ID

module.exports = router;

