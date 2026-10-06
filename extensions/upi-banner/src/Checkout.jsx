import {
  reactExtension,
  Banner,
  useAppMetafields,
  useApi,
} from "@shopify/ui-extensions-react/checkout";

// Target: purchase.checkout.block.render
// Dynamic banner — title/subtitle come from shop metafield
// namespace "prepaid_discount", key "config" (JSON: { percentage, bannerTitle, bannerSubtitle, enabled })
// Written by Admin Dashboard (app/routes/app._index.jsx) via Admin GraphQL metafieldsSet.
// Alt target: purchase.checkout.payment-method-list.render-after

const DEFAULT_TITLE = "Pay with UPI and get 5% off";
const DEFAULT_SUBTITLE = "Prepaid order select karein aur instant 5% discount paayein!";

function parseConfig(value) {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export default reactExtension("purchase.checkout.block.render", () => <Extension />);

function Extension() {
  const api = useApi();
  const appMetafields = useAppMetafields();

  // 1) Preferred: app metafields subscription (needs [[extensions.metafields]] in toml)
  let config = null;
  if (Array.isArray(appMetafields)) {
    const entry = appMetafields.find(
      (m) => m?.metafield?.namespace === "prepaid_discount" && m?.metafield?.key === "config",
    );
    config = parseConfig(entry?.metafield?.value ?? entry?.metafield?.jsonValue);
  }

  // 2) Fallback: query shop metafield via useApi (covers older runtimes)
  // NOTE: kept defensive — if api.query / metafields not available, defaults are used.
  let fallbackTitle = DEFAULT_TITLE;
  let fallbackSubtitle = DEFAULT_SUBTITLE;
  try {
    const shopMetafield = api?.metafields?.current;
    if (!config && shopMetafield) {
      // shopMetafield may be a Subscribable; read current value if present
      const current = typeof shopMetafield?.value === "string" ? shopMetafield.value : null;
      config = parseConfig(current);
    }
  } catch {
    // ignore — use defaults
  }

  const title = config?.bannerTitle || fallbackTitle;
  const subtitle = config?.bannerSubtitle || fallbackSubtitle;
  const enabled = config?.enabled !== false;

  if (!enabled) {
    return null;
  }

  return (
    <Banner status="info" title={title}>
      {subtitle}
    </Banner>
  );
}

