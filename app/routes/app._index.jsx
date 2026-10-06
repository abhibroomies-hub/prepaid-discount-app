import { json } from "@remix-run/node";
import { authenticate, addDocumentResponseHeaders } from "../shopify.server";
import {
  getShopConfig,
  saveShopConfig,
} from "../prepaid-discount-config.server";
import { DEFAULT_CONFIG } from "../prepaid-discount-config.js";

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

// ---------- Loader: read current config from shop metafield ----------
export const loader = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const config = await getShopConfig(admin);
    return json({ config });
  } catch (error) {
    // Preserve OAuth / session-token redirects.
    if (error instanceof Response) throw error;
    console.error("[app._index loader] failed, returning default config JSON:", error);
    return json({ config: DEFAULT_CONFIG, loaderError: true });
  }
};

// ---------- Action: save config via Admin GraphQL metafieldsSet ----------
export const action = async ({ request }) => {
  let admin;
  try {
    ({ admin } = await authenticate.admin(request));
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("[app._index action] auth failed:", error);
    return json({ ok: false, error: "Not authenticated. Re-open the app from Shopify Admin." }, { status: 401 });
  }
  const formData = await request.formData();
  const enabledRaw = formData.get("enabled");
  try {
    const saved = await saveShopConfig(admin, {
      percentage: formData.get("percentage"),
      bannerTitle: formData.get("bannerTitle"),
      bannerSubtitle: formData.get("bannerSubtitle"),
      enabled: enabledRaw === "on" || enabledRaw === "true",
    });
    return json({ ok: true, config: saved });
  } catch (e) {
    return json(
      { ok: false, error: "Failed to save settings" },
      { status: 400 },
    );
  }
};

import { useState, useCallback } from "react";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import {
  Page, Layout, Card, Form, FormLayout, TextField,
  Checkbox, Button, Banner, BlockStack, Text,
} from "@shopify/polaris";

export default function Dashboard() {
  const { config } = useLoaderData() ?? {};
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";
  const initial = { ...DEFAULT_CONFIG, ...(config || {}) };
  const [percentage, setPercentage] = useState(String(initial.percentage));
  const [bannerTitle, setBannerTitle] = useState(initial.bannerTitle);
  const [bannerSubtitle, setBannerSubtitle] = useState(initial.bannerSubtitle);
  const [enabled, setEnabled] = useState(initial.enabled !== false);

  const handleSubmit = useCallback(() => {
    const fd = new FormData();
    fd.append("percentage", percentage);
    fd.append("bannerTitle", bannerTitle);
    fd.append("bannerSubtitle", bannerSubtitle);
    fd.append("enabled", enabled ? "true" : "false");
    submit(fd, { method: "post" });
  }, [percentage, bannerTitle, bannerSubtitle, enabled, submit]);

  const saved = actionData?.ok ? actionData.config : null;

  return (
    <Page title="Prepaid Discount Settings" subtitle="UPI / prepaid offer">
      <Layout>
        <Layout.Section>
          {saved && (
            <div style={{ marginBottom: 16 }}>
              <Banner title="Settings saved" tone="success">
                Discount {saved.percentage}% - Status: {saved.enabled ? "Enabled" : "Disabled"}
              </Banner>
            </div>
          )}
          {actionData && !actionData.ok && (
            <div style={{ marginBottom: 16 }}>
              <Banner title="Save failed" tone="critical">{actionData.error}</Banner>
            </div>
          )}
          <Card>
            <Form onSubmit={handleSubmit}>
              <FormLayout>
                <Text variant="headingMd" as="h2">Discount Configuration</Text>
                <TextField label="Discount Percentage (%)" type="number" value={percentage} onChange={setPercentage} autoComplete="off" min={0} max={90} helpText="Default: 5. Function isi value ko metafield se padhta hai." />
                <TextField label="Banner Title" value={bannerTitle} onChange={setBannerTitle} autoComplete="off" />
                <TextField label="Banner Subtitle" value={bannerSubtitle} onChange={setBannerSubtitle} autoComplete="off" multiline={2} />
                <Checkbox label="App Status (Enable / Disable)" checked={enabled} onChange={setEnabled} helpText="Off par Function discount nahi dega, Banner hide hoga." />
                <Button submit variant="primary" loading={saving}>Save settings</Button>
                <Text variant="bodySm" as="p" tone="subdued">Save par metafieldsSet se shop metafield prepaid_discount.config (json) update hota hai.</Text>
              </FormLayout>
            </Form>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">Live Preview</Text>
              <Banner title={bannerTitle} tone="info">{bannerSubtitle}</Banner>
              <Text variant="bodySm" as="p" tone="subdued">Discount: {percentage}% - {enabled ? "Enabled" : "Disabled"}</Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

