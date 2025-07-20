// backend/utils/perishability.js
const PERISHABLE_CATS = new Set(["Dairy", "Bakery"]);

function computeIsPerishable({ category, expiryDate, createdAt, retailerMarkedPerishable }) {
  if (retailerMarkedPerishable) return true;
  if (PERISHABLE_CATS.has(category)) return true;

  if (expiryDate && createdAt) {
    const ms = expiryDate - createdAt;
    const days = ms / (1000 * 60 * 60 * 24);
    if (days <= 15) return true;
  }
  return false;
}

module.exports = { computeIsPerishable, PERISHABLE_CATS };
