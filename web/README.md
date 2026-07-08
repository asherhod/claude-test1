# Mangalist — Fire & Heat redesign (`web/`)

React + Vite, plain JS/JSX (no TypeScript), plain CSS, React Router, `@supabase/supabase-js`.
Per `ceo/design/redesign-architecture-plan.md`. Lives alongside the current static shell
(`../index.html`, `../catalog.html`, `../product.html`, etc.) — nothing there is touched or
retired by this build; both can run side by side during review.

## Running locally

1. Make sure the local Supabase stack is running (from the repo root):
   ```powershell
   cd ../supabase-local
   npx supabase start
   ```
2. Copy `.env.example` to `.env.local` and fill in the URL/anon key
   (`npx supabase status` in `supabase-local/` prints both, or copy them from `../supabase-config.js`).
3. Install and run:
   ```powershell
   $env:Path = "C:\Program Files\nodejs;" + $env:Path
   npm install
   npm run dev
   ```
   Vite serves the app at **http://localhost:5173**.

4. `npm run build` produces static files in `dist/` (not committed — see `.gitignore`). No Node
   server is needed to serve the built output; see the architecture plan §3 for the eventual
   static-file-container deploy story.

## What's implemented

- Routing (`/`, `/shop`, `/product/:id`, `/cart`, `/about`, `/contact`) with a shared `Layout`
  (sticky header + footer) via `<Outlet/>`.
- **Home and Shop** are fully built and wired to the live local Supabase instance (categories,
  brands, products/variants/images, `.eq('published', true)` RLS filtering, shop filters in the
  URL query string via `useSearchParams`).
- **Product detail** (`/product/:id`) — real fetch by id (`fetchProductById` in
  `src/lib/catalogQueries.js`, same `.eq('published', true)` posture as `catalog.js`/`product.js`),
  gallery (main image + up to 3 thumbnails), variant picker, spec table (renders whatever keys
  exist in `products.specs`, not just the documented ones), quantity stepper, add-to-cart that
  navigates to `/cart`. Missing/unpublished/garbage ids all render the same not-found state.
- **Cart** (`/cart`) — empty / full / order-success states. Each cart line records `{ productId,
  variantId, qty }` (keyed by a composite `productId::variantId` key in `CartContext`), and
  `Cart.jsx` resolves each line against that specific variant's current name/price — not the
  cheapest variant on the product — after a 2026-07-06 QA bug where a bare id→qty map lost track
  of which variant was added. A line silently drops if its product or that exact variant is no
  longer resolvable (unpublished/removed). Shipping form is local component state only (no
  `orders` table exists — nothing is persisted). "לתשלום מאובטח" is a **UI-only stub**: it clears
  the cart and shows the success state, exactly like the existing contact form's non-transactional
  pattern — no payment gateway/SDK of any kind is wired up.
- **About** (`/about`) — static copy/layout, no data fetching.
- **Contact** (`/contact`) — wired to the real `leads` table (`supabase.from('leads').insert(...)`,
  no `.select()` chained — see the code comment in `src/pages/Contact.jsx` for why). Form fields
  map directly to `leads`' existing `name`/`phone`/`email`/`message` columns.

See `src/lib/catalogQueries.js` and `src/lib/catalogShared.js` for the data-fetching/display-logic
ports of `../catalog.js` / `../product.js` / `../catalog-shared.js`.
