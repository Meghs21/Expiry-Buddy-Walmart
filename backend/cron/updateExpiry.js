const Product = require('../models/Product');
const Donation = require('../models/Donation');

async function createDonationFromProduct(product, quantity) {
    try {
        await Donation.create({
            productId: product._id,
            productName: product.name,
            originalLocation: product.location,
            expiryDate: product.expiryDate,
            quantity,
            category: product.category,
            is_perishable: product.is_perishable
        });
    } catch (err) {
        console.error(`❌ Failed to create donation for product ${product._id}:`, err);
    }
}

async function runDonationCron() {
    const today = new Date();

    console.log("🕒 Running donation cron...");

    // 1. Perishable products: move 2 days before expiry
    const perishableProducts = await Product.find({
        is_perishable: true,
        expiryDate: { $lte: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) }
    });

    for (const product of perishableProducts) {
        await createDonationFromProduct(product, product.quantity);
        await Product.deleteOne({ _id: product._id });
    }

    // 2. Non-Perishable products - First stage (60% of quantity 15 days before expiry)
    const firstStage = await Product.find({
        is_perishable: false,
        donationStage: { $ne: "first" },
        expiryDate: { $lte: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000) }
    });

    for (const product of firstStage) {
        const qtyToMove = Math.ceil(product.quantity * 0.6);
        if (qtyToMove > 0) {
            await createDonationFromProduct(product, qtyToMove);
            product.quantity -= qtyToMove;
            product.donationStage = "first";
            await product.save();
        }
    }

    // 3. Non-Perishable products - Second stage (remaining quantity 5 days before expiry)
    const secondStage = await Product.find({
        is_perishable: false,
        donationStage: "first",
        expiryDate: { $lte: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000) }
    });

    for (const product of secondStage) {
        if (product.quantity > 0) {
            await createDonationFromProduct(product, product.quantity);
            product.quantity = 0;
            product.donationStage = "second";
            await product.save();
        }
    }

    // 4. Remove expired donations from donation collection
    const deleted = await Donation.deleteMany({ expiryDate: { $lt: today } });
    console.log(`✅ Cron completed: Products moved to donation & ${deleted.deletedCount} expired donations removed.`);
}

module.exports = runDonationCron;
