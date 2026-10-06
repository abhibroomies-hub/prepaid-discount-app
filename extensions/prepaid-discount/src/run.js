// @ts-check
// Shopify Function: Order Discount — DYNAMIC prepaid discount
// Target: purchase.order-discount.run
// Config source: discountNode metafield $app:prepaid_discount / key "config"
// Value shape (JSON): { percentage, bannerTitle, bannerSubtitle, enabled }
// Set by Admin Dashboard (app/routes/app._index.jsx) via Admin GraphQL metafieldsSet.

/**
 * @typedef {Object} Money
 * @property {string} amount
 * @property {string} currencyCode
 */

/**
 * @typedef {Object} RunInput
 * @property {{ cost: { subtotalAmount: Money } }} cart
 * @property {{ metafield?: { value?: string | null } | null } | null} [discountNode]
 */

/**
 * @typedef {Object} RunOutput
 * @property {Array<Object>} discounts
 * @property {string} discountApplicationStrategy
 */

const EMPTY_DISCOUNT = {
  discountApplicationStrategy: "MAXIMUM",
  discounts: [],
};

const DEFAULTS = {
  percentage: 5,
  bannerTitle: "Pay with UPI and get 5% off",
  bannerSubtitle: "Prepaid order select karein aur instant discount paayein!",
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
    return {
      percentage,
      bannerTitle: String(merged.bannerTitle ?? DEFAULTS.bannerTitle),
      bannerSubtitle: String(merged.bannerSubtitle ?? DEFAULTS.bannerSubtitle),
      enabled: merged.enabled !== false,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * @param {RunInput} input
 * @returns {RunOutput}
 */
export function run(input) {
  const subtotal = input?.cart?.cost?.subtotalAmount;

  // No cart / no subtotal -> no discount
  if (!subtotal || Number(subtotal.amount) <= 0) {
    return EMPTY_DISCOUNT;
  }

  // Dynamic config from app metafield (discount owner), fallback to 5%
  const config = parseConfig(input?.discountNode?.metafield?.value);

  // App disabled from dashboard -> no discount
  if (!config.enabled || config.percentage <= 0) {
    return EMPTY_DISCOUNT;
  }

  return {
    discountApplicationStrategy: "MAXIMUM",
    discounts: [
      {
        message: `Prepaid ${config.percentage}% OFF - Pay online with UPI`,
        value: {
          percentage: {
            value: config.percentage,
          },
        },
        conditions: [
          {
            orderMinimumSubtotal: {
              minimumAmount: 0.0,
              targetType: "ORDER_SUBTOTAL",
              excludedCartLineIds: [],
              excludedVariantIds: [],
            },
          },
        ],
        targets: [
          {
            orderSubtotal: {
              excludedCartLineIds: [],
              excludedVariantIds: [],
            },
          },
        ],
      },
    ],
  };
}

