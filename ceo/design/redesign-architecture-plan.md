# Mangalist Redesign — Migration & Architecture Plan

Author: Solution Architect. Status: **draft for CIO review** — not approved, nothing here is to be implemented until CIO signs off and the resulting decision goes to the CEO/parent per the Operating process in `CLAUDE.md`.

Scope of this document: how Dev should build the "Fire & Heat" redesign (`ceo/design/new-site-redesign-handoff/`) as a real, DB-backed site that sits alongside — and eventually replaces — the current static shell, without re-litigating anything the parent already locked (brands, checkout-is-a-stub, local-Docker-then-AWS-EC2, framework approval). This is a design document, not code; no file outside this one was modified to produce it.

---

## 1. Recap of constraints (not decided here, just carried forward)

- Framework change is pre-approved for this redesign only (parent, per task brief). AWS EC2 (self-hosted Supabase via Docker) remains the only approved eventual host — no Vercel/Netlify/other hosted platform is authorized.
- Brands: Char-Broil + Napoleon only. All Weber copy/data/filter options must not ship.
- Catalog data source: the real `brands`/`categories`/`products`/`product_variants`/`product_images` schema (`supabase-local/supabase/migrations/20260705090000_create_catalog_schema.sql`), not the prototype's static 17-item array. Today that means 7 Char-Broil products, 0 Napoleon, everything `published=false` — the redesigned shop/product pages will legitimately render empty on first review.
- Checkout is UI-only: "לתשלום מאובטח" clears the cart and shows the success state, same non-transactional pattern as today's contact form stub. No payment gateway is contracted.

---

## 2. Stack choice + rationale

**Recommendation: React + Vite, client-side rendered (CSR) single-page app, plain JavaScript (JSX, no TypeScript), plain CSS (component-scoped files + a shared `tokens.css`), React Router for routing, `@supabase/supabase-js` as an npm dependency for data access.**

### Options considered

| Option | Fit | Why not (or why) |
|---|---|---|
| **Next.js, App Router, server components / SSR** | Poor fit here | Its main advantage — server-side data fetching/SSR — requires a persistent Node process. On a single modest EC2 instance already running the *entire* self-hosted Supabase stack (Postgres, PostgREST, GoTrue, Storage, Kong, Studio, ...), adding a second always-on Node service is real extra operational surface (process supervision, memory headroom, another thing that can crash) for a business at this scale. Next.js's natural home is Vercel — using it any other way works but fights the framework's defaults, which is scope creep relative to the benefit. |
| **Next.js, static export (`output: 'export'`)** | Poor fit | Loses almost all of Next's actual advantages (no server components, no ISR, dynamic product routes need build-time `generateStaticParams` against data that changes independently of any build) while keeping all of its tooling/config complexity. If going fully static/client-fetched anyway, there's no reason to carry Next's weight. |
| **Plain React + Vite, CSR, client-side supabase-js fetch** (recommended) | Good fit | Directly extends the data-fetching pattern Dev already built and QA already verified in `catalog.js`/`product.js` (client-side `supabase-js` against RLS-gated `published=true` rows) — same mental model, just componentized. Vite's output is a folder of static files; no server process is needed for the frontend at all, so the AWS-EC2/self-hosted-Supabase deploy story is untouched. Smallest total number of new concepts introduced in one jump (bundler + React + JSX — no SSR data-fetching paradigm, no TypeScript, no CSS framework). |
| **Keep the current no-build-step vanilla JS approach, just re-skin** | Rejected — out of scope | The parent already approved a framework specifically for this redesign; re-litigating that isn't this document's job. Also, the redesign's 6-view SPA with real interactive cart/filter state is a much better fit for a component model than hand-rolled DOM manipulation at this complexity. |

**Why CSR over SSR matters concretely for this business**: there is no SEO/first-paint requirement here that isn't already solved — `tools/prerender-products.js` already produces static, crawlable per-product HTML snapshots for search engines/link previews, independent of whatever renders the interactive app. That's the piece of "server-rendered content" this project actually needs, and it already exists and doesn't need to move. The interactive shop/cart/checkout experience itself has no SEO requirement (it's arguably better for it *not* to be crawled, since it's cart/session-flavored). So CSR loses nothing real here in exchange for a materially simpler deploy footprint.

**Dependencies added** (all free/OSS, no new paid vendor):
`react`, `react-dom`, `react-router-dom`, `@supabase/supabase-js`, `vite`, `@vitejs/plugin-react`. No CSS framework (no Tailwind), no state-management library (Context + `useReducer` is enough for a cart), no TypeScript, no testing library (QA's call, not mine).

**Flag to CIO**: this is a real new build-tool dependency (`npm install`/`npm run build`) where none existed before — proportionate to the framework change already approved, but worth CIO explicitly noting in the decision log alongside the framework sign-off, since it's the team's first exposure to an npm-based workflow.

---

## 3. Deployment topology

No new hosting dependency. Concretely:

- **Local dev**: `cd web && npm install && npm run dev` runs Vite's dev server (default port 5173) against the same local self-hosted Supabase instance (`http://127.0.0.1:54321`) already running via `npx supabase start` in `supabase-local/`. This runs *alongside*, not instead of, the current `npx serve -l 5500` static shell — both can be open in different tabs during the transition.
- **Build**: `npm run build` produces a folder of static files (`web/dist/`) — no Node server required to serve it.
- **Serving it (local and eventually EC2, same shape both times)**: add one lightweight static-file container (e.g. `nginx:alpine` or `caddy:alpine`) to the existing `docker-compose` stack in `supabase-local/`, serving `web/dist/`. This is one more container in the same box, not a new host or a new paid service — consistent with the CIO's already-approved "single EC2 instance, same docker-compose" plan. It runs on its own port, separate from Supabase's own ports (54321 API / 54323 Studio / etc.), so there's no collision.
- On EC2 later, the exact same compose addition is deployed — nothing about this topology is Vite/React-specific tooling that only works locally; it's just static files behind a static-file server, which is about as close to "no moving parts" as a modern frontend build gets.

**Flag to CIO** (no cost, but worth noting): running the frontend container alongside the full self-hosted Supabase stack on one t3.small/medium EC2 instance is one more process sharing that box's RAM/CPU. At this scale (small catalog, 2-person team, no live traffic) it should be a non-issue, but it's worth keeping in mind if the instance size is ever revisited.

---

## 4. Routing / page structure

React Router, one persistent `Layout` (header + footer, matching the prototype's shared sticky header/footer) wrapping route content via `<Outlet/>`.

| Prototype view (`state.view`) | Route |
|---|---|
| `home` | `/` |
| `shop` | `/shop` (filters in the URL query string — see below) |
| `product` | `/product/:id` |
| `cart` | `/cart` |
| `about` | `/about` |
| `contact` | `/contact` |

**Product routing**: recommend **`/product/:id`** (path param, not the existing `catalog.js`/`product.js` pattern of `product.html?id=`). `products.slug` is nullable/unused today per the schema's own comment ("routing is by id until Marketing settles a Hebrew product-URL convention") — a path-param shape makes the later swap to `/product/:slug` a one-line change, whereas staying on `?id=` query-string routing doesn't naturally extend to a slug-based path later.

**Flag**: this is a URL *shape* change from the current `product.html?id=`. Since nothing is live/indexed yet (everything `published=false`), there's no real-world redirect/SEO cost to changing it now, but Dev will need to update `tools/prerender-products.js`'s generated links/canonical URLs to match once the new frontend is what's live (that's a Dev follow-up, not something this plan implements).

**Shop filters** stay in the URL (`?category=&brand=&q=&price_min=&price_max=&sort=`) via React Router's `useSearchParams` — this preserves the exact behavior `catalog.js` already has today (shareable/linkable filtered views, back-button-friendly) rather than losing it by moving filter state into private component state.

---

## 5. Data-fetching approach

**Client-side `supabase-js`, same pattern as the existing `catalog.js`/`product.js`, ported into React hooks — not reinvented.**

- Reuse the exact same `PRODUCT_SELECT` column/join shape already defined in `catalog.js`/`product.js` (`brand:brands(...)`, `category:categories(...)`, `product_variants(...)`, `product_images(...)`), and the exact same `.eq('published', true)` filtering — this logic is already QA-verified against the real RLS policies; a new component-based UI should call the same shape, not redefine it.
- Reuse **`catalog-shared.js`** (`stockInfo`, `minPrice`, `formatPrice`, `primaryImage`, `imagesForVariant`, `dimensionsText`, `escapeHtml`) as the single source of truth for display logic, rather than re-implementing stock-badge/price-formatting/image-picking logic inside JSX. Minor implementation note for Dev (not an architecture decision): the file's current UMD wrapper doesn't have a native ES `export`, so either (a) add a small ESM export block to the existing file so it can be `import`ed cleanly by Vite, or (b) start with a synced copy under `web/src/lib/` — either is fine; just don't let the two copies drift if (b) is chosen.
- **Facet filtering/sorting**: same client-side-after-server-FTS-filter approach already used in `catalog.js` (search term goes to PostgREST via the generated `fts` column; category/brand/price/stock/sort apply client-side against the already-fetched published set). At this catalog's scale (dozens of SKUs), no reason to change this — it's already the right-sized answer, don't re-architect it just because the UI moved to React.
- **Config (URL + anon key)**: recommend switching from the current `window.SUPABASE_CONFIG` script-tag pattern to Vite's built-in `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, read from a gitignored `.env.local` (with a committed `.env.example` showing the shape). This is idiomatic once a build step exists, and keeps the local-vs-eventual-EC2 URL difference out of the repo. This is a small, low-stakes deviation — flagging it explicitly so CIO can bless it in one sentence rather than Dev silently deciding it; keeping `supabase-config.js`-style instead is equally valid if CIO prefers minimum diff.
- No server-side/SSR fetching, no new API layer — the frontend still talks directly to the same self-hosted PostgREST endpoint, over the same anon key, protected by the same RLS policies as today. Nothing about the local-Docker-then-AWS-EC2 deploy story changes because of this choice (see §3).

---

## 6. State management plan

| Prototype state | React mechanism |
|---|---|
| `view` | React Router routes (§4) |
| `cart` (id→qty map) | `CartContext` + `useReducer`, persisted to `localStorage` (small, justified addition beyond the prototype's in-memory-only cart — no new dependency, prevents losing the cart on a refresh; flagging only because it's a behavior improvement over the reference, not because it's risky) |
| `sel` (selected product) | the `:id` route param — no separate state needed |
| `qty` (detail-page stepper) | local `useState` in the Product Detail page |
| `filter` / `q` / `vendor` / `priceR` / `sort` (shop toolbar) | URL search params via `useSearchParams` (§4) |
| `orderDone` | local `useState` in the Cart page |
| `contactSent` | local `useState` in the Contact page |
| `form` (shipping form + contact form) | local `useState` per page — no need for global state; each form is only ever used on its own page |

---

## 7. Data-model gaps surfaced by this redesign (flag to CIO → DBA, not decided here)

Translating the prototype faithfully surfaces two fields the mock data has that the **real schema does not**:

1. **Badges** (`"הנמכר ביותר"`, `"חדש"`, `"קלאסיקה"` on product cards/detail) — there is no `badge`/`is_featured`-type column on `products` today. Options: add a nullable `badge` text column (or a small enum), derive something simple client-side (e.g. a "new" badge from `created_at` age), or drop the badge feature at launch until real merchandising needs are clear. **This is a schema/product decision — needs DBA input, not mine to decide.**
2. **"הנמכרים ביותר" (featured/bestseller) home-page rail** — same gap: the mock hardcodes 4 product IDs; the real schema has no featured flag or sales data yet (no orders exist). Recommend punting this rail to "first N published products" or hiding it entirely until there's a real signal (either sales data or an explicit manual flag) — **DBA/CIO call, flagged here so Dev doesn't invent a column on its own.**

Two related **content-only** (not data-model) points, worth a line for Marketing:
- Homepage category tiles and the shop's category filter chips should be **driven by the live `categories` table**, not hardcoded to the mock's 5 categories — today that means only "גז" (gas-grills) will actually render/filter meaningfully until more categories are seeded, which is expected and not a bug.
- Header sub-label "יבואן מורשה Char-Broil" and the README's "official Char-Broil importer; also carries Weber and Napoleon" line both need Marketing's correction to reflect Char-Broil + Napoleon only (per the locked 2026-07-04 brand decision) — this is Marketing's copy call, flagged here so it isn't missed when Dev builds the header.

---

## 8. Coexistence / cutover plan

1. Build the new frontend in a **new top-level directory, `web/`** — entirely separate from the current `index.html`, `catalog.html`, `product.html`, `styles.css`, `script.js`, `catalog.js`, `product.js`, `catalog-shared.js` (which stays in place, referenced by both the old pages and the new build per §5), and separate from `supabase-local/` (the data layer is shared, untouched, unaffected by any of this).
2. Nothing in the existing static shell is touched, deleted, or re-skinned during the build phase. The current dark-theme site keeps working exactly as it does today, at the same URLs, for as long as building/reviewing the redesign takes.
3. Local review happens with both running side by side (old shell via `npx serve -l 5500`, new build via `npm run dev` in `web/` on a different port) — this lets the CIO/CEO/parent compare them directly before any cutover decision.
4. **Cutover — i.e. the new build becoming what's actually served — happens only on the parent's explicit approval**, per `CLAUDE.md`'s Operating process ("nothing is final until the parent approves it... pushed to the live site... is final"). At that point: Dev builds `web/dist/`, that becomes what the static-file container (§3) serves, and the old `index.html`/`catalog.html`/`product.html`/`styles.css`/`script.js` are retired — moved to a `legacy/` folder for one release as a safety net rather than deleted outright, so there's an easy rollback path if something's wrong post-cutover.
5. Until step 4 happens, this entire redesign effort has zero live-traffic exposure — same posture as the current catalog build (100% local, nothing published).

---

## 9. Migration risks

1. **RLS/publish-gating parity isn't automatic.** The new React data hooks must replicate — not just "roughly resemble" — the exact `.eq('published', true)` filtering and the nested variant/image inherited-visibility joins that `catalog.js`/`product.js` already implement correctly. A subtle miss (e.g. forgetting that a variant's own `published` flag also gates visibility, independent of the parent product's) could show more or less than intended. **QA must independently re-verify the full RLS matrix against the new frontend before any go-live** — the existing QA sign-off (`qa.md`, 2026-07-06) verified the *old* vanilla pages, not the new build; it does not transfer automatically.
2. **Theme collision risk during transition, if not kept fully separate.** The redesign is a full visual replacement (light "Fire & Heat" Assistant-only theme vs. today's dark "grill" Rubik+Assistant theme) — as long as `web/` and the old shell are genuinely separate directories/build outputs, never loaded on the same page/origin at once, there's no actual CSS collision. The risk only appears if someone later tries to share a stylesheet or embed one inside the other (e.g. an iframe, or reusing `--ink`/`--bg` custom-property names across both token sets with different meanings) — flagging so Dev doesn't take a shortcut here during cutover.
3. **Empty-catalog state will be the default first impression, and that's expected, not a bug.** With 7 Char-Broil products (0 Napoleon) all `published=false` today, the redesigned Shop/Product pages will legitimately render "no products" on first review. Don't mistake this for broken data-fetching — it's the same state the current `catalog.html`/`product.html` are already correctly showing.
4. **Checkout-stub ambiguity is a real risk, not just a technicality.** "לתשלום מאובטח · Visa · Mastercard · Bit" is polished, trustworthy-looking copy sitting on top of a button that does nothing but clear the cart client-side. Dev must not wire even a placeholder/staging call to any payment SDK "for later" — no gateway is contracted. Recommend CIO/CEO explicitly re-confirm, right before this view is ever made reachable in a live/published environment, that checkout is still non-transactional — this is a business-facing risk (a real customer could believe they paid), not just a code-review detail.
5. **Weber leakage from the reference file is an easy mistake to make.** The prototype's `PRODUCTS` mock array (the "authoritative source of business logic" per this task's own framing) still contains `weber-spirit`/`weber-kettle`/`weber-wsm` and a `Weber` vendor-filter option, because the design handoff predates the 2026-07-04 brand lock. A literal port risks shipping these. Dev's instruction must be explicit: the mock array is reference-only for *shape* (badges, specs display, card layout) — never a real data source — and the vendor filter must be built from the live `brands` table (Char-Broil today, Napoleon once seeded), never a hardcoded list.
6. **First build-step tooling the team has ever had.** Neither the twins nor the parent have prior npm/Vite/React exposure. Recommend Dev document a short "how to run this" section for `web/` in the same plain style as the root `CLAUDE.md`'s "Running locally," and recommend **not** introducing CI (e.g. GitHub Actions) yet — keep the build a manual local step, proportionate to current scale, revisit once there's a reason (e.g. a second contributor, or automated deploys) to need it.

---

## 10. Open items requiring a decision before Dev starts (checklist for CIO)

- [ ] Confirm React + Vite (CSR) stack recommendation, or override.
- [ ] Confirm `/product/:id` path-param routing (vs. keeping `?id=` query-string routing).
- [ ] Confirm Vite env-var config (`.env.local`) vs. keeping the `window.SUPABASE_CONFIG` script pattern.
- [ ] Route the two data-model gaps (§7: badges, featured rail) to DBA for an actual schema decision before Dev builds anything that depends on them.
- [ ] Route the two copy corrections (§7: header sub-label, README importer line) to Marketing.
- [ ] Acknowledge the one new infra component (static-file container in docker-compose) — no cost, but worth a line in the decision log alongside the framework approval.
- [ ] Confirm the `legacy/` (not delete-outright) approach for retiring the old shell at cutover time.

None of the above blocks starting a first vertical slice (Home + Shop wired to the real Supabase instance is the natural first slice, since it exercises the highest-risk piece — real data fetching/RLS parity — earliest) except the DBA schema questions, which only block the badge/featured-rail features specifically, not the rest of the build.
