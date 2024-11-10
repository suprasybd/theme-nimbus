export function formatPrice(number: number) {
  const formattedNumber = Number(number).toLocaleString('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `৳${formattedNumber}`;
}

export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
) {
  // Calculate the difference between original and discounted price
  const discountAmount = originalPrice - discountedPrice;

  // Calculate the percentage discount
  const discountPercentage = (discountAmount / originalPrice) * 100;

  // Return the percentage discount
  return discountPercentage;
}
