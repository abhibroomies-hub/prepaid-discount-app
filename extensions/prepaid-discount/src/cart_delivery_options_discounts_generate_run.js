// @ts-check
// Shopify Function: Discount API — delivery options (SHIPPING class).
// Prepaid orders pay online, so shipping stays full price: no delivery
// discount candidates. Keeps the export present for the second target.

const EMPTY = { operations: [] };

/**
 * @param {any} input
 * @returns {any}
 */
export function cartDeliveryOptionsDiscountsGenerateRun(input) {
  if (!input?.cart?.deliveryGroups?.length) return EMPTY;
  return EMPTY;
}
