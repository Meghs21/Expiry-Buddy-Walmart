const ProductHistory = require("../models/ProductHistory");

const moveProductToHistory = async (product, wasSold = false) => {
  try {
    const soldInDays = wasSold
      ? Math.ceil((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))
      : null;

    const historyData = {
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      sellerName: product.sellerName,
      sellerType: "small", // optional logic: make it dynamic later
      expiryDate: product.expiryDate,
      views: product.views,
      clicks: product.clicks,
      wishlistCount: product.wishlistCount,
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