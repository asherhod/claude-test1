// catalogShared.js -- ESM port of the root-level ../../../catalog-shared.js.
//
// Why a copy instead of importing the original file directly (per
// redesign-architecture-plan.md §5, which explicitly allows either option):
// catalog-shared.js is loaded today via plain, non-`type="module"` <script>
// tags in catalog.html/product.html. Adding a literal `export` statement to
// that file -- required for Vite to `import` it as an ES module -- is a
// *parse-time* restriction, not just a runtime risk: a classic (non-module)
// script containing a top-level `export` throws "Unexpected token 'export'"
// immediately and stops the whole file from executing, which would break
// window.MangalistCatalog for catalog.html/product.html the moment this
// change landed. That makes the "low-risk" bar in §5 not met, so this is a
// synced copy instead.
//
// KEEP IN SYNC with ../../../catalog-shared.js (source of truth for the
// vanilla-JS pages). Last synced: 2026-07-06, from catalog-shared.js as it
// existed at that date. If stock-status labels / price formatting / image
// picking logic changes there, port the same change here.

export const STOCK_LABELS = {
  in_stock: { label: 'זמין להזמנה', className: 'in-stock', colorHint: 'green' },
  out_of_stock: { label: 'אזל מהמלאי', className: 'out-of-stock', colorHint: 'gray/red' },
  preorder: { label: 'בהזמנה מראש', className: 'preorder', colorHint: 'amber' },
  discontinued: { label: 'הופסק', className: 'discontinued', colorHint: 'dark red' },
  unknown: { label: 'זמינות לפי בירור', className: 'unknown', colorHint: 'neutral gray' },
};

export function stockInfo(status) {
  return STOCK_LABELS[status] || STOCK_LABELS.unknown;
}

const STOCK_PRIORITY = ['in_stock', 'preorder', 'unknown', 'out_of_stock', 'discontinued'];

export function bestStockStatus(variants) {
  if (!variants || !variants.length) return 'unknown';
  const present = variants.map((v) => v.stock_status || 'unknown');
  for (const status of STOCK_PRIORITY) {
    if (present.indexOf(status) !== -1) return status;
  }
  return 'unknown';
}

export function minPrice(variants) {
  if (!variants || !variants.length) return null;
  const priced = variants
    .map((v) => v.price_ils)
    .filter((p) => p !== null && p !== undefined)
    .map(Number);
  if (!priced.length) return null;
  return Math.min(...priced);
}

// NOT ported from catalog-shared.js (no equivalent there -- the vanilla
// pages have no cart/variant-selection concept). Added 2026-07-07 for the
// React cart: when a product card's "הוספה לסל" is clicked without a
// variant picker (Home/Shop grid, unlike Product Detail which has an
// explicit picker), this picks the same variant whose price the card
// displays (minPrice's cheapest priced variant), so what's shown is what's
// added. Falls back to the first variant by sort_order if none are priced.
export function cheapestVariant(variants) {
  if (!variants || !variants.length) return null;
  const priced = variants.filter((v) => v.price_ils !== null && v.price_ils !== undefined);
  if (priced.length) {
    return priced.reduce((min, v) => (Number(v.price_ils) < Number(min.price_ils) ? v : min), priced[0]);
  }
  return [...variants].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0] || null;
}

export function formatPrice(priceIls) {
  if (priceIls === null || priceIls === undefined) return null;
  try {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(priceIls);
  } catch {
    return '₪' + Math.round(priceIls);
  }
}

export function primaryImage(images) {
  if (!images || !images.length) return null;
  const sorted = [...images].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  for (const img of sorted) {
    if (img.is_primary) return img;
  }
  return sorted[0];
}

export function imagesForVariant(allImages, variantId) {
  if (!allImages || !allImages.length) return [];
  const variantImages = allImages.filter((img) => img.variant_id === variantId);
  if (variantImages.length) {
    return [...variantImages].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }
  const productLevel = allImages.filter((img) => !img.variant_id);
  return [...productLevel].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export function dimensionsText(variant, specs) {
  if (variant && variant.dimensions && typeof variant.dimensions === 'object') {
    const d = variant.dimensions;
    const parts = [];
    if (d.width_cm != null) parts.push(`רוחב ${d.width_cm} ס"מ`);
    if (d.depth_cm != null) parts.push(`עומק ${d.depth_cm} ס"מ`);
    if (d.height_cm != null) parts.push(`גובה ${d.height_cm} ס"מ`);
    if (parts.length) return parts.join(' · ');
  }
  if (specs && specs.dimensions_text) return specs.dimensions_text;
  return null;
}

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
