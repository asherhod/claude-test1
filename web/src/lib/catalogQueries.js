// catalogQueries.js -- data-fetching + client-side filter/sort logic for the
// React Home/Shop views, ported from ../../../catalog.js (per
// redesign-architecture-plan.md §5: "reuse the exact same PRODUCT_SELECT
// column/join shape ... and the exact same .eq('published', true) filtering
// ... a new component-based UI should call the same shape, not redefine it").
//
// Same architecture as catalog.js: free-text search is sent to PostgREST via
// the generated `fts` column (plfts/plainto_tsquery, same reasoning as
// catalog.js's comment -- accepts free text without tsquery operator syntax);
// category/brand/price filtering and sorting happen client-side against the
// already-fetched (search-matched) published product set.
//
// Deliberately NOT included here (no equivalent control in the "Fire & Heat"
// shop toolbar design): a stock-status filter. catalog.js has one because
// catalog.html's toolbar has a stock <select>; the redesign's toolbar does
// not, so it's not ported.

import { supabase } from './supabaseClient';
import { minPrice } from './catalogShared';

export const PRODUCT_SELECT =
  'id, name, slug, description, specs, created_at, badge, is_featured,' +
  ' brand:brands(id, name, slug),' +
  ' category:categories(id, name, slug),' +
  ' product_variants(id, sku, variant_name, price_ils, stock_status, stock_qty, dimensions, sort_order),' +
  ' product_images(id, url, alt_text, is_primary, variant_id, sort_order)';

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, sort_order')
    .eq('published', true);
  if (error) throw error;
  return (data || []).slice().sort((a, b) => (a.sort_order - b.sort_order) || a.name.localeCompare(b.name, 'he'));
}

export async function fetchBrands() {
  const { data, error } = await supabase.from('brands').select('id, name, slug').eq('published', true);
  if (error) throw error;
  return (data || []).slice().sort((a, b) => a.name.localeCompare(b.name, 'he'));
}

// Fetches the published product set, optionally narrowed by a free-text
// search term via the PostgREST `fts` filter -- same plfts(simple) approach
// as catalog.js (see that file's comment for why plfts over fts).
export async function fetchProducts(searchTerm) {
  let query = supabase.from('products').select(PRODUCT_SELECT).eq('published', true);
  if (searchTerm) {
    query = query.filter('fts', 'plfts(simple)', searchTerm);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// Product detail page: fetch a single product by id. Same shape/posture as
// product.js's init() -- `.eq('published', true)` alongside `.eq('id', id)`
// (never just `.eq('id', id)` alone) so a real customer can never see an
// unpublished product's data by guessing/visiting its id directly, and
// `.maybeSingle()` (not `.single()`) so a missing/unpublished id resolves to
// `null` instead of throwing -- the caller renders a not-found state either
// way (see ProductDetail.jsx).
export async function fetchProductById(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .eq('published', true)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// Home page "הנמכרים ביותר" rail: real curation via `is_featured`, per the
// 20260706100000 DBA migration's documented contract on that column --
// published=true AND is_featured=true, with a graceful fallback (below) for
// the period before any row is flagged featured (every row is currently
// unpublished, so both the featured query and the fallback are empty today --
// that's expected, not a bug; see the CIO task brief for this follow-up).
export async function fetchFeaturedProducts(limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Fallback used when no product is curated as featured yet: first N
// published products ordered by created_at.
export async function fetchFallbackFeatured(limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('published', true)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Combines the two above: prefer the curated is_featured=true set; if that
// set is empty (e.g. before any row has been flagged), fall back to the
// first N published products.
export async function fetchHomeFeatured(limit = 4) {
  const featured = await fetchFeaturedProducts(limit);
  if (featured.length > 0) return featured;
  return fetchFallbackFeatured(limit);
}

// ---------------------------------------------------------------------
// Client-side filtering / sorting (mirrors catalog.js's matchesFilters /
// filterProducts / sortProducts)
// ---------------------------------------------------------------------

// filters: { category: slug|'', brand: slug|'', price: ''|'under_1000'|'1000_2500'|'over_2500' }
export function matchesFilters(product, filters) {
  if (filters.category && (!product.category || product.category.slug !== filters.category)) {
    return false;
  }
  if (filters.brand && (!product.brand || product.brand.slug !== filters.brand)) {
    return false;
  }
  if (filters.price) {
    const variants = product.product_variants || [];
    const range = priceRangeBounds(filters.price);
    const hasPriceInRange = variants.some((v) => {
      if (v.price_ils === null || v.price_ils === undefined) return false;
      const p = Number(v.price_ils);
      return p >= range.min && p <= range.max;
    });
    if (!hasPriceInRange) return false;
  }
  return true;
}

function priceRangeBounds(price) {
  if (price === 'under_1000') return { min: -Infinity, max: 999.99 };
  if (price === '1000_2500') return { min: 1000, max: 2500 };
  if (price === 'over_2500') return { min: 2500.01, max: Infinity };
  return { min: -Infinity, max: Infinity };
}

export function filterProducts(products, filters) {
  return products.filter((p) => matchesFilters(p, filters));
}

export function sortProducts(products, sort) {
  const sorted = [...products];
  if (sort === 'price_asc' || sort === 'price_desc') {
    sorted.sort((a, b) => {
      const pa = minPrice(a.product_variants);
      const pb = minPrice(b.product_variants);
      if (pa === null && pb === null) return a.name.localeCompare(b.name, 'he');
      if (pa === null) return 1;
      if (pb === null) return -1;
      return sort === 'price_asc' ? pa - pb : pb - pa;
    });
  } else {
    // 'מומלץ' (default/recommended) -- no real ranking signal exists yet
    // (same gap as the home featured rail), so this falls back to the same
    // alphabetical order catalog.js uses as its default sort.
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }
  return sorted;
}

// Counts per category/brand for facet display, computed the same way
// catalog.js does (excluding the facet's own filter so its own count isn't
// self-narrowed) -- not currently rendered in the shop chips/select labels
// (the design doesn't show counts on chips), kept here in case QA/CIO want
// them surfaced later without another data-shape decision.
export function facetCounts(products, filters, excludeKey) {
  const base = products.filter((p) => matchesFilters(p, { ...filters, [excludeKey]: '' }));
  const counts = {};
  base.forEach((p) => {
    const key = excludeKey === 'brand' ? p.brand && p.brand.slug : p.category && p.category.slug;
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}
