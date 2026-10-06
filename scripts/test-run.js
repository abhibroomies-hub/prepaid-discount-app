// Dynamic test for extensions/prepaid-discount/src/run.js
// Verifies metafield-driven percentage + enabled flag + fallbacks.
import { run } from "../extensions/prepaid-discount/src/run.js";

function cart(amount) {
  return { cart: { cost: { subtotalAmount: { amount: String(amount), currencyCode: "INR" } } } };
}
function withConfig(base, config) {
  return { ...base, discountNode: { metafield: { value: JSON.stringify(config) } } };
}
function check(name, cond, extra) {
  console.log(`${cond ? "PASS" : "FAIL"}: ${name}${extra ? " -> " + extra : ""}`);
  if (!cond) process.exitCode = 1;
}

const FULL = {
  percentage: 10,
  bannerTitle: "Custom title",
  bannerSubtitle: "Custom subtitle",
  enabled: true,
};
const out10 = run(withConfig(cart(1000), FULL));
check("10% from metafield", out10.discounts?.[0]?.value?.percentage?.value === 10, JSON.stringify(out10.discounts?.[0]?.value));
check("message has 10%", String(out10.discounts?.[0]?.message || "").includes("10%"));

const outDisabled = run(withConfig(cart(1000), { ...FULL, enabled: false }));
check("disabled -> no discounts", outDisabled.discounts.length === 0);

const outMissing = run(cart(1000));
check("missing metafield -> default 5%", outMissing.discounts?.[0]?.value?.percentage?.value === 5);

const outBad = run({ ...cart(1000), discountNode: { metafield: { value: "not-json{{{" } } });
check("bad JSON -> default 5%", outBad.discounts?.[0]?.value?.percentage?.value === 5);

const outZero = run(withConfig(cart(1000), { ...FULL, percentage: 0 }));
check("0% -> no discounts", outZero.discounts.length === 0);

const outEmpty = run(withConfig(cart(0), FULL));
check("empty cart -> no discounts", outEmpty.discounts.length === 0);

console.log("Done.");

