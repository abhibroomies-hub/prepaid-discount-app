// Entry point for the Shopify Function (JavaScript).
// The CLI bundles this exact file (src/index.js) -> dist/function.js -> dist/function.wasm.
// Export names must be kebab-case to comply with the WASM Component Model.
// Logic lives in the per-target modules; index only re-exports them.

// @ts-ignore - resolved at function build time
export { cartLinesDiscountsGenerateRun } from "./cart_lines_discounts_generate_run.js";
// @ts-ignore - resolved at function build time
export { cartDeliveryOptionsDiscountsGenerateRun } from "./cart_delivery_options_discounts_generate_run.js";
