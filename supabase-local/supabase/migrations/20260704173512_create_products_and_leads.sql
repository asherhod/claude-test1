-- Mangalist Phase 1 schema: product catalog (not yet live) + structured lead capture
-- (replaces the client-side-only contact-form stub). See ceo/strategy.md and
-- ceo/operations.md for business context. No payment/shipping tables here — out of
-- scope for this phase.

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
-- Columns match the COO's Char-Broil reference data in ceo/operations.md.
-- `published` gates whether a row is visible to the public API (see RLS below).
-- Twins review/publish rows for real once a supplier deal actually closes —
-- everything seeded by this migration starts unpublished.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  dimensions text,              -- free-text "W x D x H", e.g. "132 x 61 x 114 cm"
  burners text,                 -- free-text, e.g. "4" or "5 (incl. side burner)"
  features text,                -- free-text description of notable features
  price_tier text,               -- free-text reference tier, e.g. "Budget, ~$200-280 (US retail ref, not our pricing)"
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is
  'Product catalog. published=false rows are seed/draft data not yet shown publicly. '
  'No real ILS pricing/SKU/availability exists yet -- see ceo/operations.md.';

-- Keep updated_at current on every row edit (twins editing via Studio included).
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

-- Public (anon) read access limited strictly to published rows.
drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products
  for select
  to anon, authenticated
  using (published = true);

-- No public insert/update/delete policy is created for products: with RLS enabled
-- and no such policy, those operations are denied by default to anon/authenticated.
-- Catalog management happens via Studio using the postgres role, which bypasses RLS.

-- This CLI/config defaults to NOT auto-exposing new public-schema tables to the
-- Data API roles (see [api] auto_expose_new_tables in config.toml) -- explicit
-- GRANTs are required in addition to the RLS policy above, or PostgREST will
-- reject requests before RLS is even evaluated.
grant select on public.products to anon, authenticated;

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
-- Structured replacement for the contact-form stub. The current live contact form
-- only collects name/email/message (see index.html) -- phone/product_interest/
-- quantity are included here for the schema the business wants to grow into, and
-- are nullable since the form doesn't collect them yet. Expanding the form itself
-- is a Marketing/CIO copy+design decision, out of scope for this wiring change.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  product_interest text,
  quantity integer,
  message text,
  created_at timestamptz not null default now()
);

comment on table public.leads is
  'Structured lead/order-inquiry capture, replacing the old client-side-only '
  'contact-form stub. Insert-only from the public client; no public read/update/delete.';

alter table public.leads enable row level security;

-- Public insert-only: anyone can submit a lead, nobody (anon/authenticated) can
-- read, update, or delete via the public API. Only the postgres role (Studio) can.
drop policy if exists "Public can insert leads" on public.leads;
create policy "Public can insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policies for anon/authenticated -- default-deny with RLS
-- enabled means leads data (customer contact info) is never publicly readable.

-- Explicit GRANT required (same reasoning as products above) -- insert-only, no
-- select/update/delete grant, so even bypassing RLS via a bug there's no grant
-- path for the public roles to read/modify existing leads.
grant insert on public.leads to anon, authenticated;
