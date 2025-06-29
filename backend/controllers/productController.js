const Product = require("../models/Product");

// Get all products
exports.getProducts = async (req, res) => {
try {
const products = await Product.find();
res.json(products);
} catch (err) {
res.status(500).json({ error: "Server error" });
}
};

// Get a product by ID
exports.getProductById = async (req, res) => {
try {
const product = await Product.findById(req.params.id);
if (!product) return res.status(404).json({ error: "Not found" });
res.json(product);
} catch (err) {
res.status(500).json({ error: "Server error" });
}
};

// Create a new product
exports.createProduct = async (req, res) => {
try {
const newProduct = new Product(req.body);
const saved = await newProduct.save();
res.status(201).json(saved);
} catch (err) {
res.status(400).json({ error: "Invalid data" });
}
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
try {
const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
new: true,
});
if (!updated) return res.status(404).json({ error: "Not found" });
res.json(updated);
} catch (err) {
res.status(500).json({ error: "Server error" });
}
};

// Delete a product by ID
exports.deleteProduct = async (req, res) => {
try {
const deleted = await Product.findByIdAndDelete(req.params.id);
if (!deleted) return res.status(404).json({ error: "Not found" });
res.json({ message: "Deleted" });
} catch (err) {
res.status(500).json({ error: "Server error" });
}
};