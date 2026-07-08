-- Mangalist redesign data-model gaps: adds the two `products` columns the
-- "Fire & Heat" redesign's mock data surfaced with no home in the real schema
-- (see ceo/design/redesign-architecture-plan.md section 7 and the DBA task
-- that followed it). Both are additive, nullable-or-defaulted columns on the
-- existing `products` table -- no new table, no RLS change (the existing
-- "Public can read published products" policy in
-- 20260705090000_create_catalog_schema.sql already covers every column on the
-- row, including these two; only the postgres role, via Studio, can write to
-- them, same as every other catalog-management field today).
--
-- Reversibility: purely additive (2 columns, 1 check constraint, 1 partial
-- index) -- safe to `alter table public.products drop column badge, drop
-- column is_featured;` (which also drops the check constraint and index) if
-- ever needed to roll back.

-- ---------------------------------------------------------------------------
-- 1. badge -- optional per-product merchandising pill (design mock: card +
--    detail view, e.g. "הנמכר ביותר" / "חדש" / "קלאסיקה").
-- ---------------------------------------------------------------------------
-- Decision (DBA): a single nullable text column on `products`, constrained to
-- a small fixed set of stable English *codes* -- not the literal Hebrew
-- display string, and not a separate lookup table.
--
-- Why a code, not the Hebrew text directly: decouples stored data from copy.
-- Marketing can change "הנמכר ביותר" wording later without a migration/data
-- update -- Dev maps code -> label (and styling) in one small client-side
-- dictionary, same spirit as stock_status codes already being mapped to
-- Hebrew labels in catalog-shared.js.
--
-- Why not a separate lookup table: 3 values, no growth pressure expected
-- (this is a curated small catalog, not a merchandising platform) -- a CHECK
-- constraint gives the same "can't typo a nonsense value" protection at a
-- fraction of the schema weight. Extend the CHECK (a one-line migration) if a
-- real new badge type is ever needed.
--
-- Why on `products`, not `product_variants`: the badge is a product-line
-- merchandising label ("this model is a bestseller"), matching how the
-- design's product cards show exactly one badge per product, not per SKU.
--
-- No index: nothing queries/filters by badge (it's display-only, read
-- alongside the rest of the already-fetched published product row) --
-- unlike `published`/`is_featured` below, there's no WHERE-clause use case
-- that would justify one at this row count.
alter table public.products add column badge text;

alter table public.products
  add constraint products_badge_check
  check (badge is null or badge in ('bestseller', 'new', 'classic'));

comment on column public.products.badge is
  'Optional merchandising pill code shown on product cards/detail (design doc: '
  '"Fire & Heat" redesign). Values are stable codes, not display text -- Dev maps '
  'code -> Hebrew label (bestseller -> "הנמכר ביותר", new -> "חדש", classic -> '
  '"קלאסיקה") client-side so copy changes don''t require a migration. null = no '
  'badge shown. Manually curated via Studio by the twins/CEO, same as `published` '
  '-- there is no sales-history signal behind "bestseller" yet (no orders exist); '
  'this is an editorial call, not a computed statistic. Extend the CHECK constraint '
  'below if a genuinely new badge type is needed.';

-- ---------------------------------------------------------------------------
-- 2. is_featured -- manual curation flag driving the homepage "הנמכרים
--    ביותר" (bestsellers) rail.
-- ---------------------------------------------------------------------------
-- Decision (DBA): explicit boolean flag, twin/CEO-managed via Studio --
-- deliberately NOT derived from real sales data (none exists: fulfillment is
-- order-on-demand, no orders have ever been placed, so there is no honest
-- "bestseller" signal to compute) and NOT the same field as `badge` above.
--
-- Kept as a separate column from `badge` rather than reusing
-- badge='bestseller' to select the rail, because the two questions are
-- independent: "which pill (if any) shows on this card" vs "should this
-- product appear in the curated homepage rail." A product can be featured
-- without a "bestseller" badge (e.g. a new arrival the twins want visibility
-- for) and, in principle, could carry a badge without being featured. Forcing
-- one field to answer both questions would produce awkward data the moment
-- those two curation decisions diverge.
--
-- default false: existing/seeded rows are unaffected; every row is
-- unfeatured until a human explicitly opts it in, matching the same
-- fail-closed posture as `published` defaulting to false.
alter table public.products add column is_featured boolean not null default false;

comment on column public.products.is_featured is
  'Manual curation flag: true = eligible for the homepage "הנמכרים ביותר" '
  '(featured/bestsellers) rail. Deliberately NOT derived from sales data -- no '
  'orders have ever been placed (order-on-demand fulfillment), so there is no real '
  'bestseller signal to compute; this is an editorial pick by the twins/CEO via '
  'Studio, same posture as `published`. The frontend should still filter to '
  'published=true AND is_featured=true (an unpublished product must never appear '
  'in the rail even if flagged featured) and should have a graceful fallback '
  '(e.g. first N published products) for the period before any row is flagged.';

-- Belt-and-braces partial index (cheap at this row count -- dozens of SKUs --
-- but consistent with the published-column index convention already used in
-- 20260705090000_create_catalog_schema.sql, and this one *does* have a real
-- query pattern: "give me the featured rail" is a WHERE is_featured = true
-- lookup the homepage will run on every visit).
create index products_is_featured_idx
  on public.products (is_featured)
  where is_featured;
