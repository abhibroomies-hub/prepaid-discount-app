import { Outlet, useRouteError } from "@remix-run/react";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-remix/react";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";

export default function App() {
  return (
    <ShopifyAppProvider
      isEmbeddedApp
      apiKey={typeof document !== "undefined" ? new URLSearchParams(window.location.search).get("apiKey") || "" : ""}
    >
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
