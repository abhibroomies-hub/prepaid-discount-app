import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

// NOTE: Memory storage = Vercel-safe build (no native sqlite dep).
// Sessions reset on redeploy/cold start — fine for demo/dev.
// Production: switch to Prisma/Postgres or Redis storage.

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
