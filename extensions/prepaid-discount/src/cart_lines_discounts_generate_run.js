// @ts-check
// Shopify Function: Discount API — cart lines (ORDER class).
// Dynamic prepaid discount: percentage + enabled flag from app metafield
// ($app:prepaid_discount / key "config"), written by the Admin Dashboard.
// Falls back to 5% when the metafield is missing or invalid.

const EMPTY = { operations: [] };

const DEFAULTS = {
  percentage: 5,
  enabled: true,
};

function parseConfig(value) {
  if (!value) return { ...DEFAULTS };
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    const merged = { ...DEFAULTS, ...(parsed || {}) };
    let percentage = Number(merged.percentage);
    if (!Number.isFinite(percentage)) percentage = DEFAULTS.percentage;
    percentage = Math.min(90, Math.max(0, percentage));
    return { percentage, enabled: merged.enabled !== false };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * @param {any} input
 * @returns {any}
 */
export function cartLinesDiscountsGenerateRun(input) {
  const hasOrderDiscountClass = input?.discount?.discountClasses?.includes(
    "ORDER"
  );
  if (!hasOrderDiscountClass) return EMPTY;

  const config = parseConfig(input?.discount?.metafield?.value);
  if (!config.enabled || config.percentage <= 0) return EMPTY;

  const hasLines = (input?.cart?.lines ?? []).some(
    (line) => Number(line?.cost?.subtotalAmount?.amount) > 0
  );
  if (!hasLines) return EMPTY;

  return {
    operations: [
      {
        orderDiscountsAdd: {
          candidates: [
            {
              message: `Prepaid ${config.percentage}% OFF - Pay online with UPI`,
              value: { percentage: { value: config.percentage } },
              targets: [{ orderSubtotal: { excludedCartLineIds: [] } }],
            },
          ],
          selectionStrategy: "ALL",
        },
      },
    ],
  };
}
