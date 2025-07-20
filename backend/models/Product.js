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
isSold: {
type: Boolean,
default: false
},
donationStage: {
    type: String,
    enum: ["first", "second", null],
    default: null
}

});

// 🧠 Auto-calculate finalPrice before saving
productSchema.pre("save", function (next) {
if (this.price) {
this.finalPrice = this.price - (this.price * this.discount) / 100;
}
next();
});

// ✅ Fix for OverwriteModelError
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;