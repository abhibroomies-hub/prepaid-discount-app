import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { authenticate } from "../shopify.server";

// Landing route: redirect embedded traffic to /app, never crash on cold boot.
export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("[_index loader] auth warming up, returning fallback JSON:", error);
  }
  return json({ ok: true });
};

export default function Index() {
  return (
    <div style={{ padding: 24 }}>
      <h1>prepaid-discount-app</h1>
      <p>Embedded app. Open the dashboard:</p>
      <Link to="/app">Go to /app dashboard</Link>
    </div>
  );
}
