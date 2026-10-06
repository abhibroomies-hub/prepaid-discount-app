import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { json } from "@remix-run/node";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { addDocumentResponseHeaders, authenticate } from "../shopify.server";

// Allow Shopify Admin iframe embedding (CSP frame-ancestors).
export const headers = (headersArgs) => {
  return addDocumentResponseHeaders(headersArgs);
};

// Loader supplies the API key + embedded flag server-side.
// (window.location parsing in render breaks SSR and throws 500 in Admin iframe.)
// Always returns valid JSON: auth redirects are re-thrown, other failures
// (missing env / session-token init) fall back to a safe payload so Vercel
// never returns FUNCTION_INVOCATION_FAILED.
export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
  } catch (error) {
    // Preserve OAuth / session-token redirects — swallowing these breaks login.
    if (error instanceof Response) throw error;
    console.error("[app loader] authenticate.admin failed, returning fallback JSON:", error);
    return json({ apiKey: process.env.SHOPIFY_API_KEY || "", authError: true });
  }
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  return json({ apiKey });
};

export default function App() {
  const { apiKey } = useLoaderData() ?? {};
  return (
    <ShopifyAppProvider isEmbeddedApp apiKey={apiKey || ""}>
      <PolarisProvider i18n={{}}>
        <ui-nav-menu>
          <a href="/app" rel="home">Dashboard</a>
        </ui-nav-menu>
        <Outlet />
      </PolarisProvider>
    </ShopifyAppProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <title>Error</title>
      </head>
      <body>
        <h1>App error</h1>
        <pre>{error instanceof Error ? error.message : JSON.stringify(error)}</pre>
      </body>
    </html>
  );
}
