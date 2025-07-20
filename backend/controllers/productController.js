const Product = require("../models/Product");
const { computeIsPerishable } = require("../utils/perishability"); // Import perishability logic

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

// For HTML form submissions creating a product
exports.createProductForm = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const {
      name,
      category,
      price,
      quantity,
      discount,
      expiryDay,
      expiryMonth,
      expiryYear,
      imageUrl,
      location,
      sellerName,
      is_perishable, // from checkbox
    } = req.body;

    const day = expiryDay ? parseInt(expiryDay) : 1;
    const month = parseInt(expiryMonth) - 1;
    const year = parseInt(expiryYear);
    const expiryDate = new Date(year, month, day);
    const createdAt = new Date();

    // Compute perishability
    const is_perishable_flag = computeIsPerishable({
      category,
      expiryDate,
      createdAt,
      retailerMarkedPerishable: is_perishable === "on",
    });

    const newProduct = new Product({
      name,
      category,
      price,
      quantity,
      discount,
      expiryDate,
      imageUrl,
      location,
      sellerName,
      is_perishable: is_perishable_flag,
    });

    const saved = await newProduct.save();
    console.log("Product saved yippeee(form):", saved);

    res.redirect("/retailer");
  } catch (err) {
    console.error("Error saving product from form:", err);
    res.status(400).send("Failed to upload product");
  }
};

// For API requests (fetch, Postman, etc.) creating a product
exports.createProductAPI = async (req, res) => {
  try {
    console.log("Received form data:", req.body);
    const body = req.body;
    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;
    const createdAt = new Date();

    const is_perishable_flag = computeIsPerishable({
      category: body.category,
      expiryDate,
      createdAt,
      retailerMarkedPerishable:
        body.is_perishable === true || body.is_perishable === "on",
    });

    const newProduct = new Product({
      ...body,
      expiryDate,
      is_perishable: is_perishable_flag,
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving product via API:", err);
    res.status(400).json({ error: "Invalid product data" });
  }
};
