const Product = require("../models/Product");
const ProductHistory = require("../models/ProductHistory");

async function handleProductSold(req, res) {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("❌ Product not found");

    const soldInDays = Math.ceil((Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    const historyData = {
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      discount: product.discount,
      finalPrice: product.finalPrice,
      quantity: product.quantity,
      views: 0, // Replace later with real values
      clicks: 0,
      wishlistCount: 0,
      sellerName: product.sellerName,
      location: product.location,
      expiryDate: product.expiryDate,
      is_perishable: product.is_perishable,
      soldInDays,
      dateSold: new Date(),
      wasSold: true,
    };

    // Save to history
    await ProductHistory.create(historyData);

    // Option 1: Mark as sold (preferred if keeping record in products)
    //await Product.findByIdAndUpdate(productId, { isSold: true });

    // Option 2: Delete it completely
    // await Product.findByIdAndDelete(productId);

    res.send("✅ Product marked as sold and recorded in history.");
  } catch (error) {
    console.error("❌ Error handling sale:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { handleProductSold };
