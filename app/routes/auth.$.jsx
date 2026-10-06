import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    await authenticate.admin(request);
  } catch (error) {
    // OAuth redirects / session-token responses must pass through untouched.
    if (error instanceof Response) throw error;
    console.error("[auth loader] unexpected error, returning JSON:", error);
    return json({ ok: false, error: "Authentication failed. Please retry from Shopify Admin." }, { status: 500 });
  }
  return null;
};
