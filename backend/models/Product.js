const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  price: Number,
  discount: Number,
  finalPrice: Number,
  expiryDate: Date,
  quantity: Number,
  imageUrl: String,
  sellerName: String,
  location: String,
  isSold: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 },
});

// Auto-calculate finalPrice
productSchema.pre("save", function (next) {
  if (this.price) {
    this.finalPrice = this.price - (this.price * this.discount) / 100;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
