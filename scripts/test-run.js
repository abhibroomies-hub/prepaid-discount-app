// Dynamic test for the Discount API function
// extensions/prepaid-discount/src/cart_lines_discounts_generate_run.js
// Verifies metafield-driven percentage + enabled flag + fallbacks.
import { cartLinesDiscountsGenerateRun } from "../extensions/prepaid-discount/src/cart_lines_discounts_generate_run.js";

function cart(amount) {
  return {
    cart: {
      lines: [
        {
          id: "gid://shopify/CartLine/1",
          quantity: 1,
          cost: { subtotalAmount: { amount: String(amount), currencyCode: "INR" } },
        },
      ],
    },
    discount: { discountClasses: ["ORDER"] },
  };
}
function withConfig(base, config) {
  return {
    ...base,
    discount: {
      ...base.discount,
      metafield: { value: JSON.stringify(config) },
    },
  };
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
const out10 = cartLinesDiscountsGenerateRun(withConfig(cart(1000), FULL));
const cand10 = out10.operations?.[0]?.orderDiscountsAdd?.candidates?.[0];
check("10% from metafield", cand10?.value?.percentage?.value === 10, JSON.stringify(cand10?.value));
check("message has 10%", String(cand10?.message || "").includes("10%"));

const outDisabled = cartLinesDiscountsGenerateRun(withConfig(cart(1000), { ...FULL, enabled: false }));
check("disabled -> no operations", outDisabled.operations.length === 0);

const outMissing = cartLinesDiscountsGenerateRun(cart(1000));
check(
  "missing metafield -> default 5%",
  outMissing.operations?.[0]?.orderDiscountsAdd?.candidates?.[0]?.value?.percentage?.value === 5
);

const outBad = cartLinesDiscountsGenerateRun({
  ...cart(1000),
  discount: { discountClasses: ["ORDER"], metafield: { value: "not-json{{{" } },
});
check(
  "bad JSON -> default 5%",
  outBad.operations?.[0]?.orderDiscountsAdd?.candidates?.[0]?.value?.percentage?.value === 5
);

const outZero = cartLinesDiscountsGenerateRun(withConfig(cart(1000), { ...FULL, percentage: 0 }));
check("0% -> no operations", outZero.operations.length === 0);

const outEmpty = cartLinesDiscountsGenerateRun(withConfig(cart(0), FULL));
check("empty cart -> no operations", outEmpty.operations.length === 0);

const outNoClass = cartLinesDiscountsGenerateRun({
  ...withConfig(cart(1000), FULL),
  discount: { discountClasses: ["PRODUCT"], metafield: { value: JSON.stringify(FULL) } },
});
check("non-ORDER class -> no operations", outNoClass.operations.length === 0);

console.log("Done.");

