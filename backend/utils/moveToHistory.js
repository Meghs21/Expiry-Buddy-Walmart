const ProductHistory = require("../models/ProductHistory");

const moveProductToHistory = async (product, wasSold = false) => {
  try {
    const soldInDays = wasSold
      ? Math.ceil((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))
      : null;

    const historyData = {
      productId: product._id,                    // ✅ Add this
      name: product.name,
      category: product.category,
      price: product.price,
      finalPrice: product.finalPrice,            // ✅ Add this
      quantity: product.quantity,                // ✅ Must be passed from cart
      sellerName: product.sellerName,
      sellerType: "small", // optional logic
      expiryDate: product.expiryDate,
      views: product.views || 0,
      clicks: product.clicks || 0,
      wishlistCount: product.wishlistCount || 0,
      soldInDays,
      wasSold,
      discount: product.discount,
      dateSold: wasSold ? new Date() : null,
    };

    const historyDoc = new ProductHistory(historyData);
    await historyDoc.save();

    console.log("✅ Moved to history:", product.name);
  } catch (err) {
    console.error("❌ Error moving to history:", err);
  }
};

module.exports = moveProductToHistory;
