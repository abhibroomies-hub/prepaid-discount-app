import "@shopify/shopify-app-remix/server/adapters/vercel";
import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

// NOTE: Memory storage = Vercel-safe (no native sqlite dep, no persistent disk needed).
// No Prisma/SQLite in this project — sessions live in memory per serverless instance.
// Vercel-safe: NEVER throw at module import time. A top-level throw becomes
// "500 FUNCTION_INVOCATION_FAILED" for every route inside the Admin iframe.
// Missing env vars are logged as a warning and filled with build-safe placeholders
// so the server bundle boots; per-request loaders still return valid JSON.
const missing = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL"].filter(
  (k) => !process.env[k],
);
if (missing.length > 0) {
  console.warn(
    `[shopify.server] Missing env vars (using fallback placeholders, fix in Vercel Dashboard > Project > Settings > Environment Variables): ${missing.join(", ")}`,
  );
}

const apiKey = process.env.SHOPIFY_API_KEY || "missing-api-key";
const apiSecretKey =
  process.env.SHOPIFY_API_SECRET || "missing-api-secret-build-placeholder-only";
const appUrl = process.env.SHOPIFY_APP_URL || "https://example.com";

const shopify = shopifyApp({
  apiKey,
  apiSecretKey,
  apiVersion: "2025-07",
  scopes: (process.env.SCOPES || "read_products,write_discounts,read_discounts,read_shop,write_shop").split(","),
  appUrl,
  authPathPrefix: "/auth",
  sessionStorage: new MemorySessionStorage(),
  distribution: "AppStore",
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = "2025-07";
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders.bind(shopify);
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
