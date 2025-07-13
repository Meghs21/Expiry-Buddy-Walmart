const Product = require("../models/Product");
const ProductHistory = require("../models/ProductHistory");
const Cart = require("../models/Cart");

async function handleProductSold(req, res) {
  const productId = req.params.id;
  const userId = req.session.userId; 

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).send("Product not found");

    const cartItem = await Cart.findOne({ userId, productId });
    if (!cartItem) return res.status(404).send("Product not found in cart");

    const soldQuantity = cartItem.quantity;

    const soldInDays = Math.ceil(
      (Date.now() - product.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const historyData = {
      productId: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      discount: product.discount,
      finalPrice: product.finalPrice,
      quantity: soldQuantity,
      views: 0,
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

    await ProductHistory.create(historyData);

    await Cart.deleteOne({ userId, productId });

    res.send("Product marked as sold and recorded in history.");
  } catch (error) {
    console.error("Error handling sale:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = { handleProductSold };
