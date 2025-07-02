const mongoose = require("mongoose");

const productHistorySchema = new mongoose.Schema({
productId: {
type: mongoose.Schema.Types.ObjectId,
ref: "Product",
},
name: String,
category: String,
price: Number,
discount: Number,
finalPrice: Number,
quantity: Number,
views: Number,
clicks: Number,
wishlistCount: Number,
sellerName: String,
location: String,
expiryDate: Date,
soldInDays: Number,
dateSold: Date,
wasSold: Boolean,
createdAt: {
type: Date,
default: Date.now,
}
});

module.exports = mongoose.model("ProductHistory", productHistorySchema);