-- Seed data for local dev only. Source: COO's Char-Broil reference table in
-- ceo/operations.md (2026-07-04) -- explicitly flagged there as PLACEHOLDER data:
-- no supplier deal is signed, no real ILS pricing/SKU exists, and figures are
-- approximate/unverified public specs, not scraped or copied manufacturer copy.
-- All rows are published=false -- the twins review/publish for real once the
-- Explore (Char-Broil importer) deal actually closes. No product_images rows
-- are seeded: per the IP-risk note in ceo/operations.md, do not source
-- Char-Broil/retailer product photography until a reseller agreement exists.
--
-- Targets the catalog schema created by
-- migrations/20260705090000_create_catalog_schema.sql (brands / categories /
-- products / product_variants / product_images). `supabase db reset` applies
-- all migrations first, then this file -- see that migration's closing comment
-- for why the data-population step lives here rather than in the migration.
--
-- specs jsonb keys used below follow the gas-grills convention documented in
-- that migration and in supabase-local/README.md: burners, dimensions_text,
-- price_tier_note.

with brand as (
  insert into public.brands (name, slug, published)
  values ('Char-Broil', 'char-broil', false)
  returning id
),
category as (
  insert into public.categories (name, slug, published)
  values ('מנגלי גז', 'gas-grills', false)
  returning id
),
new_products as (
  insert into public.products (brand_id, category_id, name, description, specs, published)
  select
    (select id from brand),
    (select id from category),
    v.name,
    v.description,
    v.specs,
    false
  from (
    values
      (
        'char-broil-001',
        'Classic 4-Burner',
        'Basic open-flame burners, porcelain-coated grates, piezo ignition, side shelves',
        '{"burners":"4","dimensions_text":"132 x 61 x 114 cm","price_tier_note":"Budget, ~$200-280 (US retail ref, not our pricing)"}'::jsonb
      ),
      (
        'char-broil-002',
        'Advantage Series 4-Burner',
        'Value/easy-assembly line, porcelain grates, side shelves',
        '{"burners":"4","dimensions_text":"130 x 60 x 113 cm","price_tier_note":"Entry-mid, ~$250-350 (US retail ref, not our pricing)"}'::jsonb
      ),
      (
        'char-broil-003',
        'Performance 4-Burner',
        'Porcelain-coated cast-iron grates, cabinet base for tank storage',
        '{"burners":"4 (+ side burner on some trims)","dimensions_text":"132 x 61 x 114 cm","price_tier_note":"Entry-mid, ~$300-400 (US retail ref, not our pricing)"}'::jsonb
      ),
      (
        'char-broil-004',
        'Professional TRU-Infrared 3-Burner (compact)',
        'TRU-Infrared emitter plate under grates (reduces flare-ups, more even heat) -- smaller footprint suited to balconies/small patios, relevant to Israeli apartment living',
        '{"burners":"3","dimensions_text":"117 x 56 x 112 cm","price_tier_note":"Mid, ~$300-400 (US retail ref, not our pricing)"}'::jsonb
      ),
      (
        'char-broil-005',
        'Signature TRU-Infrared 4-Burner',
        'TRU-Infrared system, porcelain-coated grates',
        '{"burners":"4","dimensions_text":"132 x 61 x 114 cm","price_tier_note":"Mid, ~$350-450 (US retail ref, not our pricing)"}'::jsonb
      ),
      (
        'char-broil-006',
        'Performance 5-Burner',
        'Larger cooking area (~600+ sq in), same Performance-line build',
        '{"burners":"5 (incl. side burner)","dimensions_text":"152 x 61 x 114 cm","price_tier_note":"Mid, ~$400-500 (US retail ref, not our pricing)"}'::jsonb
      ),
      (
        'char-broil-007',
        'Commercial TRU-Infrared 4-Burner',
        'TRU-Infrared, stainless-steel lid/front panel (higher-end finish than painted-steel trims)',
        '{"burners":"4 (+ side burner)","dimensions_text":"140 x 61 x 114 cm","price_tier_note":"Upper-mid, ~$450-600 (US retail ref, not our pricing)"}'::jsonb
      )
  ) as v(sku, name, description, specs)
  returning id, name, (specs ->> 'dimensions_text') as dimensions_text
),
-- Re-associate each inserted product with its intended sku by matching on name
-- (safe here: the 7 names above are unique, this is a one-shot dev seed, not
-- a general-purpose upsert pattern).
product_sku as (
  select np.id as product_id, x.sku
  from new_products np
  join (
    values
      ('Classic 4-Burner', 'char-broil-001'),
      ('Advantage Series 4-Burner', 'char-broil-002'),
      ('Performance 4-Burner', 'char-broil-003'),
      ('Professional TRU-Infrared 3-Burner (compact)', 'char-broil-004'),
      ('Signature TRU-Infrared 4-Burner', 'char-broil-005'),
      ('Performance 5-Burner', 'char-broil-006'),
      ('Commercial TRU-Infrared 4-Burner', 'char-broil-007')
  ) as x(name, sku) on x.name = np.name
)
insert into public.product_variants (product_id, sku, variant_name, price_ils, stock_status, published)
select product_id, sku, null, null, 'unknown', false
from product_sku;
