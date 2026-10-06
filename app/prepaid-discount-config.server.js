// Shared defaults + metafield helpers for prepaid-discount config.
// Shop metafield: namespace "prepaid_discount", key "config", type "json"
// Value shape: { percentage, bannerTitle, bannerSubtitle, enabled }
// NOTE: DEFAULT_CONFIG lives in ./prepaid-discount-config.js (client-safe).
// This *.server module must never be imported by client component code.

import { DEFAULT_CONFIG, METAFIELD_NAMESPACE, METAFIELD_KEY } from "./prepaid-discount-config.js";

export { DEFAULT_CONFIG, METAFIELD_NAMESPACE, METAFIELD_KEY };

/**
 * Clamp/validate raw config into safe shape.
 */
export function normalizeConfig(raw) {
  const merged = { ...DEFAULT_CONFIG, ...(raw || {}) };
  let percentage = Number(merged.percentage);
  if (!Number.isFinite(percentage)) percentage = DEFAULT_CONFIG.percentage;
  percentage = Math.min(90, Math.max(0, percentage));
  return {
    percentage,
    bannerTitle: String(merged.bannerTitle ?? DEFAULT_CONFIG.bannerTitle),
    bannerSubtitle: String(merged.bannerSubtitle ?? DEFAULT_CONFIG.bannerSubtitle),
    enabled: Boolean(merged.enabled ?? true),
  };
}

export function parseConfigFromMetafieldValue(value) {
  if (!value) return { ...DEFAULT_CONFIG };
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return normalizeConfig(parsed);
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

const GET_CONFIG_QUERY = `#graphql
  query GetPrepaidDiscountConfig($namespace: String!, $key: String!) {
    shop {
      metafield(namespace: $namespace, key: $key) {
        value
      }
    }
  }
`;

const SET_CONFIG_MUTATION = `#graphql
  mutation SetPrepaidDiscountConfig($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        namespace
        key
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function getShopConfig(admin) {
  const response = await admin.graphql(GET_CONFIG_QUERY, {
    variables: { namespace: METAFIELD_NAMESPACE, key: METAFIELD_KEY },
  });
  const json = await response.json();
  return parseConfigFromMetafieldValue(json?.data?.shop?.metafield?.value);
}

/**
 * Save config to shop metafield via metafieldsSet (owner: current shop).
 */
export async function saveShopConfig(admin, config) {
  const clean = normalizeConfig(config);
  const response = await admin.graphql(SET_CONFIG_MUTATION, {
    variables: {
      metafields: [
        {
          namespace: METAFIELD_NAMESPACE,
          key: METAFIELD_KEY,
          type: "json",
          value: JSON.stringify(clean),
          ownerId: "gid://shopify/Shop/1",
        },
      ],
    },
  });
  const json = await response.json();
  const errors = json?.data?.metafieldsSet?.userErrors ?? [];
  if (errors.length > 0) {
    throw new Response(errors.map((e) => e.message).join(", "), { status: 400 });
  }
  return clean;
}
