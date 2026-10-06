# Prepaid Discount App (Shopify Embedded + Remix + Polaris)

Dynamic prepaid/UPI discount app:
1. **Admin Dashboard** (`app/routes/app._index.jsx`) — Polaris form (percentage, banner title/subtitle, enable toggle) saved via Admin GraphQL `metafieldsSet` to shop metafield `prepaid_discount.config` (json).
2. **Discount Function** (`extensions/prepaid-discount`) — `run.graphql` reads `discountNode.metafield($app:prepaid_discount/config)`; `run.js` parses % dynamically (default 5, clamp 0–90, disabled → no discount).
3. **Checkout UI** (`extensions/upi-banner`) — `Checkout.jsx` reads title/subtitle via `useAppMetafields()` with defaults + hide-on-disabled.

## Local dev
```powershell
Copy-Item .env.example .env   # fill SHOPIFY_API_KEY / SECRET / APP_URL
npm install
npm run dev                    # shopify login + dev store needed
npm run build                  # Vercel / production build (Remix)
node scripts/test-run.js       # function logic test (no Shopify needed)
```

## GitHub push (new repo)
```powershell
cd c:\Users\admin\OneDrive\Desktop\prepaid-discount-app
git init
git add .
git commit -m "Initial commit: prepaid discount app (Remix + functions + checkout UI)"
git branch -M main
git remote add origin https://github.com/abhibroomies-hub/prepaid-discount-app.git
git push -u origin main
```

## Vercel deploy
1. Vercel → New Project → import this GitHub repo.
2. Build Command: `npm run build`, Output: `build/client`, Install: `npm install`.
3. Env vars: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL` (= Vercel URL), `SCOPES`.
4. After deploy: copy Vercel URL into `shopify.app.toml` `application_url` + `auth.redirect_urls`, then `npm run deploy` (Shopify) to link extensions.
5. Note: Memory session storage resets on redeploy — production needs Prisma/Postgres.

