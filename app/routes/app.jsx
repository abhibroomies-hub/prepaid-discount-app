import { Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { authenticate } from "../shopify.server";

// Loader supplies the API key + embedded flag server-side.
// (window.location parsing in render breaks SSR and throws 500 in Admin iframe.)
export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  return new Response(JSON.stringify({ apiKey }), {
    headers: { "Content-Type": "application/json" },
  });
};

export default function App() {
  const { apiKey } = useLoaderData();
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
