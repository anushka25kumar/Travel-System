/**
 * Indian Rupee (INR) and Multicurrency Formatter
 * Strict adherence to Indian number system formatting (e.g. ₹5,980, ₹1,50,000)
 */

export const formatINR = (amount) => {
  const numericAmount = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numericAmount);
};

export const formatPrice = (amount, currency = 'INR') => {
  const numericAmount = Number(amount || 0);
  if (currency === 'INR' || !currency) {
    return formatINR(numericAmount);
  }
  if (currency === 'USD') {
    const usdAmount = numericAmount / 83.5;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(usdAmount);
  }
  if (currency === 'EUR') {
    const eurAmount = numericAmount / 90.5;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(eurAmount);
  }
  return formatINR(numericAmount);
};

export default formatPrice;
