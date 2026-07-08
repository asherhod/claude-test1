# Mangalist — Catalogue Management Site: Plan

**Status: DESIGN / RECOMMENDATION ONLY.** Nothing in this document is approved, implemented, migrated, or deployed. Produced by Solution Architect (UI/architecture) + DBA (data layer/RLS/auth schema), reviewed by the CIO (this section's security sign-off is the CIO's own, not delegated). Dev has not been briefed to build anything yet.

**In scope:** a management web UI for the twins to create/edit/publish brands, categories, products, variants, and images — replacing Supabase Studio's raw table editor for this purpose.
**Out of scope:** orders/checkout/payment (still don't exist).

---

## 1. Why this is needed

The public catalogue (brands/categories/products/product_variants/product_images, RLS-gated to `published = true` for anon reads) is already built and QA-signed-off. The only way to add content today is Supabase Studio's raw table editor, which requires manually sequencing inserts across up to three related tables per product with no guided flow. The parent tried it and found it unusable. This plan proposes a guided, purpose-built UI on top of the same stack.

---

## 2. Access control — the real architecture question (CIO-reviewed)

### 2.1 Recommendation: Supabase Auth (email/password), 2 staff accounts, explicit staff allow-list

Supabase Auth (GoTrue) is already enabled in the running local stack (`supabase/config.toml`, `[auth] enabled = true`) — this is not a new component, just the first real use of one already approved and running at zero cost. `supabase-js` (already loaded on every page) handles `signInWithPassword`; PostgREST already understands the resulting JWT (`authenticated` role, `auth.uid()`).

**Alternatives considered and rejected:**
- Shared/basic-auth password on the admin page — no per-user identity for RLS to key off, no audit trail of which twin changed what. Strictly worse for the same effort.
- Home-grown login/session handling — reinventing password hashing badly for no benefit over what's already built in.
- OAuth/social login or third-party auth (Auth0/Clerk/Firebase) — new external dependency/cost solving a problem already solved for free by what's running.
- A bare `auth.role() = 'authenticated'` check as the "is this staff" test — **rejected in favor of an explicit `staff_users` allow-list table.** It happens to be equivalent today (zero non-staff authenticated accounts exist), but it is a silent landmine: the moment any customer-facing account feature ships (plausible next phase — order history, saved details), every new customer account would instantly and silently inherit catalog-write access under a bare role check. A one-row-per-staff-member table + a small helper function removes that failure mode permanently, for negligible added complexity. This is the one place this design adds structure ahead of strictly proven need — justified because retrofitting it after a customer-auth feature exists would be a real incident-risk fix instead of a five-minute addition now.

No role tiers beyond "staff can write catalog data" — both twins get identical full write access; no editor/admin split, no per-table permission granularity.

### 2.2 Concrete RLS shape

Existing anon/authenticated SELECT-published-only policies on all 5 tables are **untouched** — no drop, no edit. One additional permissive policy is added per table, scoped to staff only (Postgres RLS policies are OR'd, so this only adds a path, never weakens the existing public one):

```sql
create table public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create function public.is_staff()
returns boolean
language sql
security definer
set search_path = public, pg_temp     -- CIO note: required to close the standard
                                        -- SECURITY DEFINER search-path privilege-escalation gotcha
as $$
  select exists (select 1 from public.staff_users where user_id = auth.uid());
$$;
grant execute on function public.is_staff() to authenticated;

-- repeated for brands, categories, products, product_variants, product_images:
create policy "Staff can manage <table>" on public.<table>
  for all to authenticated
  using (public.is_staff())
  with check (public.is_staff());
grant insert, update, delete on public.<table> to authenticated;
```

Net effect: `anon` unchanged (read-only, published-only, no writes). `authenticated` non-staff (any future customer account) unchanged in practice — falls through to published-only read, no write. `authenticated` staff (the twins) — full read (including drafts) + insert/update/delete on all 5 tables.

`staff_users` itself gets RLS too — staff can see the staff list, no one can self-add:
```sql
alter table public.staff_users enable row level security;
create policy "Staff can see the staff list" on public.staff_users
  for select to authenticated using (public.is_staff());
grant select on public.staff_users to authenticated;
-- deliberately no insert/update/delete policy for authenticated at all:
-- staff membership can only be changed by postgres/service_role during provisioning (§2.4)
```
**CIO correction to the DBA's initial draft:** the `staff_users` SELECT policy should call `is_staff()` (as above), not re-run its own raw `exists (select ... from staff_users ...)` subquery — the latter is a known Postgres RLS gotcha (a policy on a table querying that same table recursively), which `security definer` + a fixed `search_path` on a shared helper function is the standard fix for. Straightforward for DBA to correct when writing the real migration; not a blocker to this plan.

### 2.3 Storage bucket (`product-images`) — the same hard constraint applied to file uploads

The bucket doesn't exist yet. Declared in `config.toml`:
```toml
[storage.buckets.product-images]
public = true
file_size_limit = "10MiB"
allowed_mime_types = ["image/jpeg", "image/png", "image/webp"]
```
`storage.objects` gets its own RLS (separate from table RLS): public read (matches the bucket's public-read purpose), staff-only write, scoped strictly to this one bucket:
```sql
create policy "Public can read product-images objects" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "Staff can manage product-images objects" on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());
```
This lets twins upload/replace/delete files directly from their browser session (`authenticated` role) — **the `service_role` key never appears in any client-side file**, satisfying the hard security constraint from the brief. This is the one non-negotiable the CIO checked personally across both the SA and DBA output: neither design references `service_role` anywhere in browser-side code; all client writes (table rows and Storage objects) go through the staff member's own authenticated session, gated by the RLS/policies above.

### 2.4 Staff account provisioning (no public signup)

Two separate actions, both one-time / low-frequency, neither a self-serve flow:
1. **Close public self-registration** — `config.toml` currently has `enable_signup = true` (both `[auth]` and `[auth.email]`). Recommend flipping both to `false` once the two twin accounts exist, closing `/auth/v1/signup` entirely. This is a pre-existing open gap independent of this feature (harmless today, local-only) but should close before any real deploy.
2. **Create the two twin accounts** via Studio's Auth UI (Authentication → Users → Add user) — the supported path (GoTrue manages password hashing/bookkeeping; hand-inserting into `auth.users` is unsupported/fragile). Then insert one row per twin into `staff_users` via Studio's SQL editor (runs as `postgres`, bypasses RLS — matches the "only an admin can grant staff status" design).

### 2.5 Backup implication flagged (real, not blocking)

`backup-db.ps1` (pg_dump, no schema filter) already captures `auth.users` and the new `staff_users` table — no script change needed there. **Gap actually worth acting on:** Storage file bytes live in a separate Docker volume (`supabase_storage_supabase-local`), not inside the Postgres dump at all — a DB-only restore would bring back `product_images` rows pointing at files that no longer exist if that volume is ever lost. Low-stakes today (no images uploaded yet) but should be closed **before** Phase 3 (image upload) goes live with real product photos — either extend the backup script to also archive that Docker volume, or accept the gap explicitly as a known limitation. Recommend the former; small addition, no new cost (still local disk/tar, no new service).

### 2.6 Cost

**No new cost anywhere in this design.** Auth, Storage, and Postgres/PostgREST are already running in the approved self-hosted stack at the existing 60–150 NIS/month AWS estimate once deployed — this only puts a first real use on components already there. Local `Inbucket` test-SMTP (already enabled) is sufficient for all local-dev testing of the 2 twin accounts; **no real SMTP provider needed at this stage.** Flagged clearly: the moment this stack is deployed somewhere twins need real password-reset emails delivered to actual inboxes, a real SMTP provider becomes necessary — that is a genuine future cost decision, not decided or needed now, and would come back through the CIO/parent per the standard cost-approval rule.

---

## 3. Pages / forms

Plain HTML/CSS/JS, no framework, no build step — same pattern as `index.html`/`catalog.html`/`product.html`, same `supabase-js` CDN client + `supabase-config.js`. New pages live under a new `admin/` folder, not linked from public nav.

| Page | Purpose |
|---|---|
| `admin/login.html` | Email/password sign-in, redirects to dashboard on success |
| `admin/index.html` | Thin dashboard: row counts, "Add Product" CTA, links to Brands/Categories/Products |
| `admin/brands.html` | List + inline add/edit (name, slug, logo, published toggle) — ~2 rows, simple table is enough |
| `admin/categories.html` | List + inline add/edit incl. `parent_id` select (2-level tree) |
| `admin/products.html` | List view: name, brand, category, published state, thumbnail, edit link |
| `admin/product-edit.html?id=<uuid>` (or `?new`) | **Guided "Add/Edit Product" wizard** — see below |

**Guided product flow (new products):**
1. **Basic info** — brand/category selects, name, description, `specs` (per-category fixed field list rendered as labeled inputs rather than a raw JSON textarea, to structurally enforce the naming convention the DBA already flagged as needing one — exact key list per category still needs Dev+DBA sign-off before this step is built). Submits as a real `insert` (`published=false`), carries the returned `id` through later steps so partial progress isn't lost.
2. **Variants** — repeating fieldset: sku, variant_name, dimensions (three numeric inputs), price_ils (nullable), stock_status dropdown (existing Hebrew labels from the catalogue design), per-variant published toggle.
3. **Images** — see §4.
4. **Review & Publish** — read-only summary + one explicit "פרסם" button flipping product + variant `published` to true together, a deliberate go-live moment rather than piecemeal visibility.

Editing an existing product relaxes the wizard into freely-clickable tabs (Info/Variants/Images) instead of forced sequential steps.

---

## 4. Image upload flow (end to end)

Same `product-images` bucket from §2.3 — no new service.

1. Twin drags/picks a file; instant local preview via `URL.createObjectURL`.
2. Client-side resize/re-encode before upload, via the browser's native `<canvas>` API (cap longest edge ~1600px, JPEG re-encode) — plain JS, no library, no new dependency. This is a judgment call flagged for the CIO to accept or defer: the existing catalogue design left image sizing as a manual practice; doing it in ~30-40 lines of JS here is cheap and removes reliance on twins remembering to resize phone photos. Fallback (keep it manual) remains valid if this is deferred to a later phase.
3. Required Hebrew alt-text field per image.
4. Client uploads directly to Storage **using the staff member's own authenticated session** (not anon key, not service_role) — `storage.from('product-images').upload(...)`. Suggested path: `{product_id}/{variant_id-or-"product"}/{timestamp}-{filename}`.
5. On success, insert a `product_images` row (product_id, variant_id nullable, url, alt_text, sort_order, is_primary) via the same authenticated client.
6. Primary-image selection (radio, respects the existing partial-unique-per-product index) and simple up/down reordering (no drag-and-drop library — unnecessary for a handful of images per product).
7. Delete removes both the Storage object and the DB row; a failure after the file delete succeeds surfaces an error rather than leaving an orphaned reference silently.

---

## 5. Phased build order

- **Phase 1 — Auth + basic CRUD for brands/categories.** Smallest vertical slice: login, admin shell, the two simplest entities. Proves real login + the new staff RLS policies actually work end-to-end before the more complex wizard is built.
- **Phase 2 — Product + variant guided form** (steps 1–2, no images yet). Produces a real (unpublished) product + variants; isolates the image-upload work from the more familiar CRUD/form work.
- **Phase 3 — Image upload flow.** Before this ships with real product photos, close the Storage-volume backup gap (§2.5).
- **Phase 4 — List/edit views for ongoing maintenance** (editing existing products/variants/images, publish/unpublish toggles). Follows rather than leads — the twins' most urgent need is getting the first SKUs in at all.

Each phase goes through the existing pipeline: Dev builds against this design + DBA's migration, QA signs off before anything is reported done.

---

## 6. Proportionality check

No role tiers beyond staff/non-staff. No approval workflow beyond the wizard's own "Publish" step — twins are trusted to publish their own work. No audit/history log of catalog edits. No admin-generator framework (Retool, React Admin, etc.) — stays plain HTML/CSS/JS. No per-object path enforcement at the RLS layer (UI convention, not a data-integrity requirement at this scale). No FK between `product_images.url` and `storage.objects` — pre-existing accepted gap, not worsened here.

---

## 7. Open items for CIO to route before/alongside implementation

1. **To DBA**: write the real migration incorporating the CIO's correction in §2.2 (`is_staff()` reused on the `staff_users` policy, not a raw recursive subquery); extend `backup-db.ps1` to cover the Storage Docker volume before Phase 3.
2. **To Dev + DBA jointly**: finalize the per-category `specs` field list before wizard Step 1 is built.
3. **To CIO** (already captured above, restating for tracking): flip `auth.enable_signup` to `false` after the two twin accounts exist.
4. **Judgment call, not a blocker**: whether Phase 3 includes the client-side canvas resize-before-upload step (§4.2) or defers to "manual resize practice" as already documented in the existing catalogue design.

---

## 8. Sign-off needed

Nothing here is implemented. Before Dev starts on Phase 1: CEO/parent review of the access-control approach (§2) and confirmation there is no objection to the phased order (§5). No cost decision is required — this entire plan runs on stack components already approved and running at zero incremental cost.
