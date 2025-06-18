const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  is_perishable: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: Number, // calculated below
  expiryDate: {
    type: Date,
    required: true
  },

  imageUrl: {
    type: String,
    default: "https://via.placeholder.com/150"
  },
  sellerName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  },
  
  clicks: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },
  isSold: {
    type: Boolean,
    default: false
  }
});

// 🧠 Auto-calculate finalPrice before saving
productSchema.pre("save", function (next) {
  if (this.price) {
    this.finalPrice = this.price - (this.price * this.discount) / 100;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);