// catalog-shared.js
//
// Small set of helpers shared between the browser catalog pages
// (catalog.html + catalog.js, product.html + product.js) and the Node
// pre-render script (tools/prerender-products.js), so the stock-status
// labels / price formatting / image-picking / dimensions logic is written
// exactly once instead of duplicated across browser and Node code.
//
// Plain JS, no build step: this file uses the UMD-ish pattern below so it
// works both as a plain <script> tag (attaches `window.MangalistCatalog`)
// and via Node's `require()` (module.exports) -- no bundler, no transpile.
//
// NOTE on stock badge wording: the Hebrew labels below are exactly the
// design doc's (ceo/design/product-catalogue-design.html §2.4) suggested
// copy, reproduced here verbatim. Marketing has NOT signed off on this
// wording -- see the design doc's own "NOTE FOR MARKETING" flag. Treat as
// a working placeholder, not final, until Marketing confirms.
(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    root.MangalistCatalog = factory();
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  // stock_status -> { label, className, colorHint } -- className maps to a
  // `.stock-badge--<key>` rule in styles.css.
  var STOCK_LABELS = {
    in_stock: { label: 'זמין להזמנה', className: 'in-stock', colorHint: 'green' },
    out_of_stock: { label: 'אזל מהמלאי', className: 'out-of-stock', colorHint: 'gray/red' },
    preorder: { label: 'בהזמנה מראש', className: 'preorder', colorHint: 'amber' },
    discontinued: { label: 'הופסק', className: 'discontinued', colorHint: 'dark red' },
    unknown: { label: 'זמינות לפי בירור', className: 'unknown', colorHint: 'neutral gray' },
  };

  function stockInfo(status) {
    return STOCK_LABELS[status] || STOCK_LABELS.unknown;
  }

  // Stable ordering used when a product with multiple variants needs a single
  // "summary" status for a catalog card / facet count -- prefers whichever
  // status means "you can actually get one" first.
  var STOCK_PRIORITY = ['in_stock', 'preorder', 'unknown', 'out_of_stock', 'discontinued'];

  function bestStockStatus(variants) {
    if (!variants || !variants.length) return 'unknown';
    var present = variants.map(function (v) { return v.stock_status || 'unknown'; });
    for (var i = 0; i < STOCK_PRIORITY.length; i++) {
      if (present.indexOf(STOCK_PRIORITY[i]) !== -1) return STOCK_PRIORITY[i];
    }
    return 'unknown';
  }

  // Lowest non-null price among a set of variants, or null if every variant
  // is null-priced (expected at launch -- no real ILS pricing yet).
  function minPrice(variants) {
    if (!variants || !variants.length) return null;
    var priced = variants
      .map(function (v) { return v.price_ils; })
      .filter(function (p) { return p !== null && p !== undefined; })
      .map(Number);
    if (!priced.length) return null;
    return Math.min.apply(Math, priced);
  }

  function formatPrice(priceIls) {
    if (priceIls === null || priceIls === undefined) return null;
    try {
      return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        maximumFractionDigits: 0,
      }).format(priceIls);
    } catch (e) {
      // Environments without full Intl currency data (shouldn't happen in
      // modern Node/browsers, but fail safe rather than throw).
      return '₪' + Math.round(priceIls);
    }
  }

  // Picks the "primary" image from a flat product_images array: is_primary
  // wins, else the lowest sort_order, else the first one found.
  function primaryImage(images) {
    if (!images || !images.length) return null;
    var sorted = images.slice().sort(function (a, b) {
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    for (var i = 0; i < sorted.length; i++) {
      if (sorted[i].is_primary) return sorted[i];
    }
    return sorted[0];
  }

  // Images to show for a given selected variant: variant-specific images if
  // any exist, else fall back to the product-level gallery (images with
  // variant_id null), per design §2.4.
  function imagesForVariant(allImages, variantId) {
    if (!allImages || !allImages.length) return [];
    var variantImages = allImages.filter(function (img) { return img.variant_id === variantId; });
    if (variantImages.length) {
      return variantImages.slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
    }
    var productLevel = allImages.filter(function (img) { return !img.variant_id; });
    return productLevel.slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
  }

  // Human dimensions string for one variant: prefers the structured
  // product_variants.dimensions jsonb; falls back to the free-text
  // specs.dimensions_text stopgap (see migration/README convention).
  function dimensionsText(variant, specs) {
    if (variant && variant.dimensions && typeof variant.dimensions === 'object') {
      var d = variant.dimensions;
      var parts = [];
      if (d.width_cm != null) parts.push('רוחב ' + d.width_cm + ' ס"מ');
      if (d.depth_cm != null) parts.push('עומק ' + d.depth_cm + ' ס"מ');
      if (d.height_cm != null) parts.push('גובה ' + d.height_cm + ' ס"מ');
      if (parts.length) return parts.join(' · ');
    }
    if (specs && specs.dimensions_text) return specs.dimensions_text;
    return null;
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  return {
    STOCK_LABELS: STOCK_LABELS,
    stockInfo: stockInfo,
    bestStockStatus: bestStockStatus,
    minPrice: minPrice,
    formatPrice: formatPrice,
    primaryImage: primaryImage,
    imagesForVariant: imagesForVariant,
    dimensionsText: dimensionsText,
    escapeHtml: escapeHtml,
  };
});
