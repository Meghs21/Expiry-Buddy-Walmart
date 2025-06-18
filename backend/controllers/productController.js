const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

// Add a product
const addProduct = async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(product);
};

module.exports = { getProducts, addProduct };
