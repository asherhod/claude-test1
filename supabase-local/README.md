# Mangalist — local Supabase stack (Phase 1)

Self-hosted Supabase (Postgres + PostgREST + Studio + Auth/Storage, etc.) run
locally via Docker, per the CIO's Phase 1 architecture recommendation (see
`../ceo/strategy.md` and `../ceo/finance.md`). This is a **local dev stack only**
— nothing here is deployed or exposed to the internet. Deploying the same
docker-compose to AWS is a separate, later decision requiring its own explicit
parent sign-off.

## Prerequisites

- **Docker Desktop for Windows** (with the WSL2 backend). Not installed on this
  machine as of 2026-07-04 — install it manually (interactive installer,
  usually requires a reboot / enabling the WSL2 Windows feature) before any of
  the commands below will work. See https://docs.docker.com/desktop/setup/install/windows-install/
- Node.js (already installed on this machine; not on PATH by default — see
  root `CLAUDE.md` "Running locally").
- Supabase CLI — already installed locally via `npm install -g supabase`
  (works without Docker; only `supabase start` itself needs Docker running).

## Commands

All commands below run from this `supabase-local/` folder.

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path

# Start the full local stack (Postgres, PostgREST, Studio, Auth, Storage, etc.)
npx supabase start

# Applies migrations/ and seed.sql automatically on first start; to re-apply
# after editing migrations/seed.sql without losing the Docker images:
npx supabase db reset

# Stop the stack (containers persist, DB data persists in a Docker volume)
npx supabase stop
```

`supabase start` prints, among other things:
- **API URL** (e.g. `http://127.0.0.1:54321`) and **anon key** — paste both
  into `../supabase-config.js` (see comments in that file).
- **Studio URL** (e.g. `http://127.0.0.1:54323`) — open this in a browser to
  browse/edit the `products` and `leads` tables, same table-editor UI the
  twins will use to manage the catalog and view leads once this is live.

## Schema

Two migrations, applied in order by `supabase db reset`:

`supabase/migrations/20260704173512_create_products_and_leads.sql`:
- `public.leads` — structured lead capture replacing the old client-side-only
  contact-form stub. RLS: public insert-only, no public read/update/delete.
- (This migration also originally created a flat `public.products` table;
  that table was retired by the migration below — see that file's "Step 0"
  comment for why.)

`supabase/migrations/20260705090000_create_catalog_schema.sql` — full catalog
schema per `../ceo/design/product-catalogue-design.html` §3 (DBA data model),
replacing the old flat `products` table:

- `public.brands` — brand list (e.g. Char-Broil, Napoleon). `slug` unique.
- `public.categories` — 2-level self-referencing tree (`parent_id`, nullable).
  `slug` unique.
- `public.products` — model-line entity: `brand_id`/`category_id` (FK, on
  delete restrict), `name`, `slug` (nullable — routing is by `id` until
  Marketing settles a Hebrew slug convention), `description`, `specs` jsonb
  (see convention below), generated `fts` tsvector column (name+description,
  `'simple'` config) with a GIN index for full-text search, `badge` and
  `is_featured` (see below — added by
  `20260706100000_add_product_badge_and_featured.sql`).
- `public.product_variants` — the purchasable/sellable unit (price/stock live
  here, not on `products`): `product_id` (FK, on delete cascade), `sku`
  (unique), `variant_name`, `dimensions` jsonb, `price_ils` (check `>= 0` or
  null), `stock_status` (check: `in_stock`/`out_of_stock`/`preorder`/
  `discontinued`/`unknown`), `stock_qty`, own `published` flag.
- `public.product_images` — `product_id`/`variant_id` (FK, on delete cascade),
  `url`, `alt_text`, `is_primary` (partial unique index: at most one primary
  image per product). No own `published` column — visibility inherits fully
  from the parent product/variant.

**RLS summary** (same pattern across all five tables and matching the
existing `products`/`leads` pattern): RLS enabled on every table; anon/
authenticated get **SELECT-only on published rows** (no insert/update/delete
policy exists for the public roles, so those are denied by default); catalog
management is via Studio using the `postgres` role, which bypasses RLS. An
explicit `grant select` is required per table in addition to each RLS policy
— a PostgREST gotcha (new tables aren't auto-exposed to the Data API roles by
default; see `auto_expose_new_tables` in `supabase/config.toml`).

- `brands` / `categories` / `products`: `using (published = true)`
- `product_variants`: `using (published = true and` parent product also
  `published = true)` — a variant can be independently hidden but is never
  shown if the parent product is hidden
- `product_images`: no own `published` column; visible only if the parent
  product is published (and the variant too, if `variant_id` is set)

Seeded via `supabase/seed.sql`: 1 brand (Char-Broil), 1 category (gas-grills),
and the 7 Char-Broil models from the old flat table, each with exactly one
`product_variants` row (generated `sku` like `char-broil-001`, no real
pricing). **Everything seeded lands `published = false`** — the twins publish
for real once a supplier deal closes.

### `specs` jsonb key-naming convention

`products.specs` is a flexible jsonb bag (no DB-enforced schema) rather than
rigid columns, since grills vs. future accessory categories have very
different attributes. Convention for the one category that exists today:

```
category slug: gas-grills
products.specs = {
  "burners":         "<string, e.g. \"4\" or \"5 (incl. side burner)\">",
  "dimensions_text": "<string, free-text \"W x D x H\" — holdover from the
                       old free-text dimensions column, until real per-variant
                       dimensions are entered>",
  "price_tier_note": "<string, informational reference only — NOT real ILS
                       pricing; real pricing lives on
                       product_variants.price_ils>"
}
```

`product_variants.dimensions` (structured jsonb, e.g.
`{"width_cm":132,"depth_cm":61,"height_cm":114}`) is the correct home for real
structured, filterable/sortable dimensions going forward — `specs.dimensions_text`
above is only a stopgap for the migrated free-text data and should be retired
once real per-variant dimensions are entered. Extend this convention with a new
per-category key list as new categories are added, rather than inventing a
generic schema up front.

### `products.badge` / `products.is_featured` (redesign data-model gaps)

Added by `supabase/migrations/20260706100000_add_product_badge_and_featured.sql`,
covering two fields the "Fire & Heat" redesign's mock data has that the schema
didn't (see `ceo/design/redesign-architecture-plan.md` §7). Both are manually
curated via Studio by the twins/CEO — the same posture as `published` — since
no real sales history exists yet (order-on-demand fulfillment, no orders have
ever been placed).

- **`badge`** (nullable `text`, `CHECK (badge is null or badge in
  ('bestseller', 'new', 'classic'))`) — optional merchandising pill shown on
  product cards/detail. Stores a stable **code**, not the Hebrew display
  string, so Marketing can change copy without a migration — Dev maps code →
  label client-side: `bestseller` → "הנמכר ביותר", `new` → "חדש", `classic` →
  "קלאסיקה". `null` = no badge. Extend the `CHECK` constraint if a genuinely
  new badge type is ever needed. No index (display-only; nothing filters by
  it).
- **`is_featured`** (`boolean not null default false`) — drives the homepage
  "הנמכרים ביותר" (bestsellers) rail. Deliberately **not** derived from sales
  data (none exists) and deliberately a separate column from `badge` — "which
  pill shows on this card" and "should this appear in the curated homepage
  rail" are independent editorial decisions. Partial index
  `products_is_featured_idx on products (is_featured) where is_featured` for
  the rail's `WHERE is_featured = true` lookup.
  **Frontend contract**: always filter `published = true AND is_featured =
  true` (an unpublished product must never appear in the rail even if
  flagged featured), and fall back gracefully (e.g. first N published
  products) while no row is flagged yet.

## Backups

`backup-db.ps1` — run from this folder (stack must already be running via
`supabase start`) to dump the local Postgres DB to a timestamped plain-SQL
file under `backups/` (gitignored — may contain real customer lead data once
live). This is a **local dev backup**, not production disaster recovery; a
scheduled pg_dump-to-S3 job is planned once AWS deployment is approved.

```powershell
./backup-db.ps1
```

## Verifying the contact form end-to-end

1. `npx supabase start`, fill in `../supabase-config.js` with the printed API
   URL + anon key.
2. Serve the site from the repo root (see root `CLAUDE.md`): `npx serve -l 5500`.
3. Open http://localhost:5500, submit the contact form.
4. Confirm a new row appears in `leads` via Studio (`http://127.0.0.1:54323` →
   Table Editor → `leads`), or via SQL: `select * from leads order by created_at desc limit 5;`
5. Confirm the categories/catalog section on the live site still shows the
   static "coming soon" note — no products render yet, since all seeded rows
   have `published = false`.
