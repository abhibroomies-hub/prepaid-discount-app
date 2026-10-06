import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
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
