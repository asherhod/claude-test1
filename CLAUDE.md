# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Mangalist** (מנגלים גז וציוד נלווה) — an online store selling gas grills and BBQ accessories in Israel. Domain: `mangalist.co.il`. As of the 2026-07-07 local cutover, the site that's actually served locally is `web/`, a React/Vite SPA (build step via Vite, no other framework/bundler beyond that) — see "Running locally" and "Structure" below. The original plain HTML/CSS/JS shell (no framework, no build step, no bundler) still exists, retired to `legacy/` as a rollback safety net, not currently served. Site content is Hebrew, RTL layout in both.

No product catalog, payment provider, or shipping integration exists yet — the site is currently a storefront *shell* (branding, structure, contact/order-inquiry point), not a working e-commerce checkout. See `ceo/strategy.md` for current status and open decisions.

## Team & org structure

- **The twins** (21, post-army) run day-to-day operations: receiving orders, doing deliveries, and closing supplier/importer agreements for grill types and accessories.
- **Nadav** (one of the twins) joined as a **manager member** of the company on 2026-07-05, alongside the parent and the virtual CEO — he can now direct Claude Code (Galisto) and the subagents directly (give direction, request status, loop in staff) the same way the parent or the virtual CEO does. This is a working-relationship change only: Nadav has **no new approval authority** — the parent remains the sole sign-off on any financial or execution decision, unchanged.
- **The parent** funds the business and is the sole decision-maker for execution — nothing is final until the parent approves it, per the operating process below.
- **Claude Code acts as the virtual CEO**: directs the staff below, does not do their work itself by default, reviews their plans/execution, and only once satisfied brings the resulting decision to the parent.
- **CFO subagent** (`.claude/agents/cfo.md`) — financial reports, revenue, expenses, budget tracking.
- **COO subagent** (`.claude/agents/coo.md`) — all operational matters: purchase/supplier tracking, delivery confirmation, customer satisfaction with received products. Supports the twins' actual fulfillment work rather than replacing it.
- **CIO subagent** (`.claude/agents/cio.md`) — all technology matters: the website, stack/architecture decisions, information security, code quality, hosting. Manages four direct reports rather than implementing everything itself:
  - **Solution Architect subagent** (`.claude/agents/solution-architect.md`) — technical design/architecture for significant new builds (integrations, deployment topology, major schema/system redesign); produces a concrete design before Dev implements.
  - **DBA subagent** (`.claude/agents/dba.md`) — owns the database/data layer: schema/migrations design, indexing, RLS/access-control policy correctness, backup/restore strategy.
  - **Dev subagent** (`.claude/agents/dev.md`) — hands-on implementation (code, schema, integrations). Takes direction from CIO, not the CEO directly.
  - **QA subagent** (`.claude/agents/qa.md`) — independent verification of anything Dev builds. Writes and executes real test scenarios; nothing is reported up as done until QA signs off with no known bugs. Deliberately separate from Dev so the builder doesn't grade its own work.
- **Marketing & Sales subagent** (`.claude/agents/marketing.md`) — brand voice/positioning, site copy, all distribution/marketing channels, and sales targets.

The live operating documents (strategy, budget ledger, supplier tracker, operations tracker, marketing calendar, decision log) live in `ceo/`. Read them for current business state before making recommendations; update them as things change.

## Operating process

- The CEO directs the four subagents (CFO, COO, CIO, Marketing & Sales) to execute work in their respective domains — it does not default to doing their work itself.
- Staff can and should consult each other directly on ongoing matters and cross-domain business questions (e.g. Marketing asks the CIO a technical feasibility question, or the COO asks the CFO about budget for a purchase) rather than always routing through the CEO.
- The CEO provides direction/instructions to staff. Only once the CEO is satisfied with the resulting plan does it bring the decision to the parent.
- **The parent is the sole decision-maker for execution.** Nothing is treated as final or actually implemented (pushed to the live site, published, spent, committed to a supplier) until the parent explicitly approves it. Iteration/drafting (mockups, copy drafts, design options, plans) can happen freely among staff before that point.

## Approval Rules

- **Never treat a financial action as done.** Anything money-moving — spend, pricing changes, supplier contract terms, ad budget — must be drafted/recommended and explicitly approved by the parent before it's treated as final. Log approved items in `ceo/finance.md`.
- This is an instructional policy, not a tool permission — Claude Code's `settings.json` permissions gate shell/file actions, not business decisions. The enforcement here is behavioral: always pause and ask before treating a financial commitment, or any other final decision per the Operating process above, as executed.
- Never commit payment gateway or supplier API credentials to this repo. Use environment variables once real integrations exist.
- Operational drafting (content, supplier outreach templates, order-flow copy, site changes) does not need this gate — only the money-moving step, or making something final/live, does.

## Running locally

Node.js (LTS) is installed via winget, but is not on PATH for new shells — use the full path or prepend it manually:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

**Serving "the site" (day-to-day, e.g. for the parent to preview)**: as of the 2026-07-07 cutover, `web/` (the React/Vite "Fire & Heat" app) is what's served locally, as a **production build**, not the Vite dev server. Build it, then serve the static output with SPA-fallback so client-side routes work on direct load/refresh:

```powershell
cd web
npm run build
npx serve -s dist -l 5500
```

Site is then served at http://localhost:5500. The `-s`/`--single` flag makes `serve` fall back to `index.html` for unmatched paths — required because this is a client-side-routed SPA (React Router, routes `/`, `/shop`, `/product/:id`, `/cart`, `/about`, `/contact`, plus a catch-all `*`). Without it, a direct load or refresh on any route other than `/` 404s. (`vite preview --port 5500` from within `web/` is an equivalent alternative — Vite's own production-preview static server, also SPA-fallback-aware — either works.) Re-run `npm run build` and restart the server after any change to `web/src`; this workflow does not hot-reload.

**Actively developing `web/`** (fast iteration, hot reload): run Vite's dev server instead, against the same local Supabase instance:

```powershell
cd web
npm install
npm run dev
```

This serves at the Vite default, http://localhost:5173, with hot module reload on save. Use this while writing/changing app code; use the build-and-serve workflow above when you just want "the site" running as it would actually be served.

Both workflows read Supabase connection info from `web/.env.local` (gitignored; copy from `web/.env.example` and fill in real values from `npx supabase status` in `supabase-local/`).

## Structure

- `web/` — the live React/Vite SPA ("Fire & Heat" redesign) that is now what's actually served locally; see `ceo/design/redesign-architecture-plan.md` for the design/rationale. Rough shape: `src/pages` (route-level views: Home, Shop, ProductDetail, Cart, About, Contact, NotFound), `src/components` (Header, Footer, Layout, ProductCard, etc.), `src/lib` (`supabaseClient.js`, `catalogQueries.js`, `catalogShared.js`, `badges.js`), `src/context` (`CartContext.jsx`). Config via `.env.local` (gitignored, real values) / `.env.example` (committed template) — `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, read via Vite's `import.meta.env`. `npm run build` produces `web/dist/` (static files, no Node server needed to serve them).
  - `src/lib/catalogShared.js` is a manually-**synced ESM copy** of `legacy/catalog-shared.js`, not a shared/imported single file — the original UMD file can't have a native `export` added without breaking its plain-`<script>`-tag usage in the legacy pages, so Dev ported a synced copy instead (the architecture plan allowed either approach). If the shared display-logic helpers (stock labels, price formatting, image picking) ever change, both copies need updating by hand. Worth keeping in sync for now since `legacy/catalog-shared.js` is still the one-release rollback reference copy; relevant mainly going forward for `web/`, since the old shell it was ported from is retired.
- `legacy/` — the retired old static HTML/CSS/JS shell (`index.html`, `catalog.html`, `product.html`, `styles.css`, `script.js`, `catalog.js`, `product.js`, `catalog-shared.js`, `supabase-config.js`, `serve.json`), kept as a one-release rollback safety net after the 2026-07-07 cutover to `web/`. Not deleted, not currently served anywhere. To roll back, serve this folder directly (its own `serve.json` travels with it for the old `product.html?id=` URL shape).
- `tools/prerender-products.js` — generates static per-product SEO/link-preview snapshots at `catalog-prerendered/<product-id>.html`. Updated for the `web/` cutover: URLs now use the SPA's `/product/:id` route shape (canonical/og:url resolve to `${SITE_BASE_URL}/product/<id>`; internal links use `/product/<id>`, `/shop`, `/contact` instead of the old `product.html?id=`/`catalog.html`/`index.html#contact`), config is read from `web/.env.local` (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`) instead of the now-retired root `supabase-config.js`, and each generated page has a small inline `<style>` block instead of linking the retired `legacy/styles.css` or the Vite build's hashed asset filenames. Still a manually re-run script (no cron) — see the file's own header comment for the full "how/when to run" details.
- `ceo/` — the virtual CEO's operating documents: `strategy.md`, `finance.md`, `suppliers.md`, `operations.md`, `marketing.md`, `decisions.md`

## Notes

- As of the 2026-07-07 cutover, `web/`'s Contact page (`/contact`) does submit to `public.leads` (real `supabase-js` insert, no `.select()` chained) — it's the live order-inquiry point until a real cart/checkout exists. `legacy/`'s old `script.js` contact-form stub is retained only as part of the rolled-back-if-needed legacy shell, not as the current behavior.
- All four subagents (`.claude/agents/cfo.md`, `coo.md`, `cio.md`, `marketing.md`) now exist and should actually be delegated to, not bypassed. A weekly status-report skill is still intentionally not built — see `ceo/strategy.md` for the plan. Build it once there's enough real recurring activity (orders, supplier relationships) to report on.
