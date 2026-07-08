-- Mangalist Phase 2: full product-catalog schema (brands / categories / products /
-- product_variants / product_images), replacing the flat `products` table created
-- in 20260704173512_create_products_and_leads.sql.
--
-- Authoritative spec: ceo/design/product-catalogue-design.html, section 3
-- (Data Model, DBA design). This migration implements that design as written,
-- with no alterations. `leads` is untouched by this migration.
--
-- Zero live-traffic risk: nothing in the old `products` table was published
-- (all 7 seed rows had published=false), so this migration retires that table
-- and replaces it outright rather than trying to run both shapes in parallel.

-- ---------------------------------------------------------------------------
-- Step 0: get the old flat `products` table out of the way of the new name.
-- ---------------------------------------------------------------------------
-- Nothing outside this migration/seed.sql depends on the old flat shape
-- (index.html/script.js only ever touch `leads`; there is no catalog UI yet).
-- Cleanest path: rename the old table to `products_legacy` so the new
-- design-shaped `products` table can be created under its real name, then
-- drop `products_legacy` once the new schema exists (see the closing comment
-- of this migration for why data-carry-forward itself happens in seed.sql,
-- not here). This keeps the rename/drop sequence visible and reviewable in
-- one file rather than silently overwriting/altering the old table in place.
alter table public.products rename to products_legacy;
comment on table public.products_legacy is
  'Temporary holding name for the old flat products table during the catalog-schema '
  'migration (20260705090000). Data is copied into brands/categories/products/'
  'product_variants below, then this table is dropped at the end of this migration. '
  'Not expected to exist after this migration has run.';

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.brands is
  'Product brands (e.g. Char-Broil, Napoleon). published=false rows are not shown '
  'publicly. Managed via Studio (postgres role bypasses RLS).';

drop trigger if exists trg_brands_updated_at on public.brands;
create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_parent_not_self check (parent_id is null or parent_id <> id)
);

comment on table public.categories is
  'Two-level category tree (parent_id self-reference; null = top-level). '
  'Cycle guard is intentionally shallow (blocks only direct self-parenting) -- '
  'accepted given the 2-level hierarchy in practice (see design doc section 5.1 item 4).';

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products (conceptual / model-line entity -- price/stock live on variants)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  slug text unique,
  description text,
  specs jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Generated full-text-search column: name + description, 'simple' config
  -- (Hebrew doesn't benefit from English stemming). See design doc section 3.3/3.5.
  fts tsvector generated always as (
    to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored
);

comment on table public.products is
  'Catalog products (model-line entity). slug is nullable and left unused for now -- '
  'routing is by id until Marketing settles a Hebrew product-URL convention '
  '(design doc section 2.2 / 5.1 item 1). specs is a flexible per-category jsonb bag; '
  'see the specs key-naming convention documented below and in supabase-local/README.md.';

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_variants (the purchasable/sellable unit -- price/stock attach here)
-- ---------------------------------------------------------------------------
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique,
  variant_name text,
  dimensions jsonb,
  price_ils numeric(10, 2),
  stock_status text not null default 'unknown',
  stock_qty integer,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_price_ils_nonnegative check (price_ils is null or price_ils >= 0),
  constraint product_variants_stock_status_check check (
    stock_status in ('in_stock', 'out_of_stock', 'preorder', 'discontinued', 'unknown')
  )
);

comment on table public.product_variants is
  'Every product has >=1 variant; a trivial variant (variant_name null) covers '
  'single-SKU products. published gates independently but read policy also requires '
  'the parent product to be published (see RLS below). stock_status mirrors the '
  'order-on-demand fulfillment model, not a warehouse inventory system.';

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.product_images is
  'No own published column -- visibility is fully inherited from the parent product '
  '(and variant, if variant-scoped). See RLS below.';

drop trigger if exists trg_product_images_updated_at on public.product_images;
create trigger trg_product_images_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes (design doc section 3.3)
-- ---------------------------------------------------------------------------
create index categories_parent_id_idx on public.categories (parent_id);

create index products_category_id_idx on public.products (category_id);
create index products_brand_id_idx on public.products (brand_id);
create index products_specs_gin_idx on public.products using gin (specs jsonb_path_ops);
create index products_fts_gin_idx on public.products using gin (fts);

create index product_variants_price_ils_idx on public.product_variants (price_ils);
create index product_variants_stock_status_idx on public.product_variants (stock_status);
-- Note: a GIN/btree index on product_variants(dimensions) is deliberately not
-- created yet -- design doc section 3.3 lists it as "if needed"; no migrated row
-- has structured dimensions data yet (see specs convention below), so there is
-- nothing to index. Add it if/when real per-variant dimensions filtering is needed.

-- Belt-and-braces published-column indexes (design doc section 3.3) -- cheap at
-- this row count, but keeps future filtered-count queries (e.g. admin views) fast.
create index brands_published_idx on public.brands (published);
create index categories_published_idx on public.categories (published);
create index products_published_idx on public.products (published);
create index product_variants_published_idx on public.product_variants (published);

-- FK-column indexes on product_images -- not explicitly enumerated in design doc
-- section 3.3, but standard practice for on-delete-cascade FK columns (join/
-- cascade-delete performance); included as ordinary DBA practice, not a deviation
-- from the design.
create index product_images_product_id_idx on public.product_images (product_id);
create index product_images_variant_id_idx on public.product_images (variant_id);

-- Partial unique index: at most one primary image per product.
create unique index product_images_one_primary_per_product_idx
  on public.product_images (product_id)
  where (is_primary);

-- brands.slug, categories.slug, products.slug, product_variants.sku unique
-- indexes already exist implicitly via the `unique` column constraints above.

-- ---------------------------------------------------------------------------
-- Row Level Security (design doc section 3.4)
-- ---------------------------------------------------------------------------
-- Same pattern as the existing products/leads tables: RLS enabled on every
-- table; anon/authenticated get SELECT-only on published rows; no public
-- insert/update/delete policy is created anywhere below, so with RLS enabled
-- and no such policy those operations are denied by default. Catalog
-- management happens via Studio using the postgres role, which bypasses RLS.
--
-- This CLI/config defaults to NOT auto-exposing new public-schema tables to
-- the Data API roles (see [api] auto_expose_new_tables in config.toml) --
-- explicit GRANTs are required in addition to each RLS policy below, or
-- PostgREST will reject requests before RLS is even evaluated. Same gotcha
-- already documented and handled in 20260704173512_create_products_and_leads.sql.

alter table public.brands enable row level security;
drop policy if exists "Public can read published brands" on public.brands;
create policy "Public can read published brands"
  on public.brands
  for select
  to anon, authenticated
  using (published = true);
grant select on public.brands to anon, authenticated;

alter table public.categories enable row level security;
drop policy if exists "Public can read published categories" on public.categories;
create policy "Public can read published categories"
  on public.categories
  for select
  to anon, authenticated
  using (published = true);
grant select on public.categories to anon, authenticated;

alter table public.products enable row level security;
drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products
  for select
  to anon, authenticated
  using (published = true);
grant select on public.products to anon, authenticated;

alter table public.product_variants enable row level security;
drop policy if exists "Public can read published product variants" on public.product_variants;
create policy "Public can read published product variants"
  on public.product_variants
  for select
  to anon, authenticated
  using (
    published = true
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id
        and p.published = true
    )
  );
grant select on public.product_variants to anon, authenticated;

alter table public.product_images enable row level security;
drop policy if exists "Public can read images of published products" on public.product_images;
create policy "Public can read images of published products"
  on public.product_images
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id
        and p.published = true
    )
    and (
      variant_id is null
      or exists (
        select 1 from public.product_variants v
        where v.id = product_images.variant_id
          and v.published = true
      )
    )
  );
grant select on public.product_images to anon, authenticated;

-- ---------------------------------------------------------------------------
-- specs jsonb key-naming convention (design doc section 5.1, open question 2)
-- ---------------------------------------------------------------------------
-- Documented here for Dev, and mirrored in supabase-local/README.md so it's
-- discoverable without reading migration SQL. Only one category exists today
-- (gas-grills), so this is intentionally short -- extend with a new key list
-- per category as new categories are added, rather than inventing a generic
-- schema up front.
--
--   category slug: gas-grills
--   products.specs = {
--     "burners":          "<string, e.g. \"4\" or \"5 (incl. side burner)\">",
--     "dimensions_text":  "<string, free-text \"W x D x H\", e.g. \"132 x 61 x 114 cm\" --
--                          a holdover from the old free-text dimensions column, used
--                          only until real per-variant dimensions are entered>",
--     "price_tier_note":  "<string, informational reference only (e.g. US retail
--                          price-tier commentary) -- NOT real ILS pricing; real
--                          pricing lives on product_variants.price_ils>"
--   }
--
-- product_variants.dimensions (structured jsonb, e.g.
-- {"width_cm":132,"depth_cm":61,"height_cm":114}) is the correct home for real
-- structured, filterable/sortable dimensions going forward -- specs.dimensions_text
-- above is only a stopgap for the migrated free-text data below and should be
-- retired once real per-variant dimensions are entered.

-- ---------------------------------------------------------------------------
-- Retire the old flat table.
-- ---------------------------------------------------------------------------
-- Note on mechanics for the 7 legacy Char-Broil seed rows (design doc section
-- 5.1, open question 3): `supabase db reset` applies every file under
-- migrations/ (in order) FIRST, then loads supabase/seed.sql. That means at
-- the point this migration runs, `products_legacy` (renamed from `products`
-- above) is always empty in this dev environment -- the 7 rows only exist
-- once seed.sql has loaded, which happens strictly after all migrations. A
-- copy-from-products_legacy step here would therefore always migrate zero
-- rows and give a false sense of having "carried the data forward".
--
-- Given that, the actual carrying-forward of the 7 Char-Broil rows into the
-- new brands/categories/products/product_variants shape is done in
-- supabase/seed.sql (rewritten alongside this migration to target the new
-- schema directly, using the same specs jsonb convention documented above),
-- not in this migration. This migration's job is purely the schema/DDL change
-- and disposing of the now-empty legacy table. In a real deployed environment
-- where `products` genuinely held rows at migration-apply time, the
-- rename -> copy -> drop pattern above is exactly how you'd do it (copy step
-- would go here, before the drop), which is why the rename is preserved
-- rather than dropping/recreating in place.
drop table public.products_legacy;
