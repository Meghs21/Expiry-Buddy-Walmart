const ProductHistory = require("../models/ProductHistory");

exports.addDummyHistory = async (req, res) => {
  try {
    console.log("🛠 addDummyHistory hit");
    const sample = new ProductHistory({
      name: "Rice Bag",
      category: "Grocery",
      price: 500,
      quantity: 10,
      sellerName: "Walmart",
      sellerType: "big",
      expiryDate: new Date("2025-08-15"),
      views: 80,
      clicks: 30,
      wishlistCount: 15,
      soldInDays: 3,
      wasSold: true,
      discount: 20,
      dateSold: new Date("2025-06-20")
    });

    await sample.save();
    res.status(201).send("Dummy ProductHistory inserted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error inserting history data");
  }
};