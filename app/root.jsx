import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { addDocumentResponseHeaders } from "./shopify.server";

// Allow Shopify Admin iframe embedding (CSP frame-ancestors).
// NOTE: addDocumentResponseHeaders returns a Headers object, but Remix
// `headers` export must return a plain object — convert explicitly.
export const headers = (headersArgs) => {
  const shopifyHeaders = addDocumentResponseHeaders(headersArgs);
  const out = {};
  shopifyHeaders.forEach((value, key) => {
    out[key] = value;
  });
  return out;
};

// Root loader always returns valid JSON, even while env/session-token init
// is still warming up on a cold Vercel serverless instance.
export const loader = async () => {
  try {
    return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
  } catch (error) {
    console.error("[root loader] failed, returning fallback JSON:", error);
    return json({ apiKey: "", rootError: true });
  }
};

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>App error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>App error</h1>
        <pre>{error instanceof Error ? error.message : JSON.stringify(error)}</pre>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
