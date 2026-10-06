// Client-safe shared defaults (no server imports).
// Keep in sync with app/prepaid-discount-config.server.js

export const METAFIELD_NAMESPACE = "prepaid_discount";
export const METAFIELD_KEY = "config";

export const DEFAULT_CONFIG = {
  percentage: 5,
  bannerTitle: "Pay with UPI and get 5% off",
  bannerSubtitle: "Prepaid order select karein aur instant discount paayein!",
  enabled: true,
};
