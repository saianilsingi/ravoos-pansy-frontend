/**
 * Format a number as Indian Rupee currency.
 * formatCurrency(1499) → "₹1,499"
 * formatCurrency(1499.5) → "₹1,499.50"
 */
export function formatCurrency(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) return "₹0";
  return "₹" + num.toLocaleString("en-IN", {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Check if a product was created within the last N days.
 */
export function isNewProduct(createdAt, days = 7) {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return created >= cutoff;
}
