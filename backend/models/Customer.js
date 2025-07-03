const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Pre-save hook to hash password before saving
customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is new or changed

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Customer", customerSchema);
