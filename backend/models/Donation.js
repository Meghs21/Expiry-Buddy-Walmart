const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",              
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  originalLocation: {
    type: String,              
    required: true,
  },
});

module.exports = mongoose.model("Donation", donationSchema);
