import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

// NOTE: Memory storage = Vercel-safe (no native sqlite dep, no persistent disk needed).
// No Prisma/SQLite in this project — sessions live in memory per serverless instance.
// If SHOPIFY_API_KEY / SHOPIFY_API_SECRET / SHOPIFY_APP_URL are missing, throw a
// clear error at boot instead of a cryptic 500 inside the Admin iframe.
const missing = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL"].filter(
  (k) => !process.env[k],
);
if (missing.length > 0) {
  throw new Error(
    `[shopify.server] Missing required env vars: ${missing.join(", ")}. ` +
      `Set them in Vercel Dashboard > Project > Settings > Environment Variables (and .env locally).`,
  );
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: "2025-07",
  scopes: (process.env.SCOPES || "read_products,write_discounts,read_discounts,read_shop,write_shop").split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "http://localhost:3000",
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
