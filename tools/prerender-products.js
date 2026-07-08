#!/usr/bin/env node
// tools/prerender-products.js
//
// Build-time static pre-rendering for product pages (SEO / social-link-preview),
// per the parent's explicit decision to build Option B now (see
// ceo/design/product-catalogue-design.html §2.1, "Rendering options
// considered" -- Option B was originally left as a deferred future decision
// by that design; the CIO has since been told the parent decided to build it
// now rather than defer it).
//
// WHAT THIS DOES
//   Queries PostgREST directly (plain `fetch`, no HTTP client dependency) for
//   every `published = true` product (with brand/category/variants/images
//   joined -- same shape as catalog.js/product.js), and writes one static
//   HTML file per product to `catalog-prerendered/<product-id>.html`. Each
//   file has real, server-baked <title>/<meta description>/Open Graph tags
//   (so link-preview bots and crawlers that don't execute JS see real
//   content), plus a basic human-readable content snapshot (name, brand,
//   price-or-price-on-request, stock badge, primary image, description) and
//   a link to the live interactive /product/<id> page. This is a
//   static snapshot, NOT a duplicate interactive app -- no variant picker,
//   no gallery swapping, no client-side fetch.
//
// HOW TO RUN
//   1. Make sure the local Supabase stack is running (`supabase start` in
//      supabase-local/) and `web/.env.local` has real
//      VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY values (same file the
//      React app reads via Vite's `import.meta.env` -- this script reads
//      that exact file with simple manual line-parsing, so there is only
//      one place credentials/URLs live). The old root-level
//      `supabase-config.js` this script used to read has been retired to
//      `legacy/` as part of the React cutover and is no longer consulted.
//   2. From the repo root:
//        C:\Program Files\nodejs\node.exe tools/prerender-products.js
//      (or, if node is on PATH: `node tools/prerender-products.js`)
//   3. Output lands in `catalog-prerendered/<product-id>.html` at the repo
//      root. Stale files for products that are no longer published are
//      removed automatically (see cleanOutputDir below).
//
// WHEN TO RE-RUN
//   Manually, whenever the published catalog changes (a product is
//   published/unpublished/edited, images change, etc). No scheduler/cron is
//   being built -- per the design doc, that "someone must remember to
//   regenerate" step is the accepted operational cost of Option B. Whoever
//   trains the twins on publishing products should mention this step.
//
// CANONICAL DOMAIN NOTE (Dev judgment call -- flagged, not a final decision)
//   The design doc leaves the choice of canonical domain vs. relative path
//   for og:url up to Dev. The site has no deployed domain yet (local dev
//   only), but `mangalist.co.il` is the already-named target domain (see
//   root CLAUDE.md). Using a relative path for og:url would be technically
//   invalid per the Open Graph spec (it requires an absolute URL), so this
//   script uses the future real domain as a placeholder, in one place
//   (SITE_BASE_URL below) -- update it once real hosting/domain exists, or
//   swap to an env var at that point. Not a cost decision, just a config
//   placeholder.
//
// NO NEW DEPENDENCIES: uses only Node's built-in `fs`/`path` modules and the
// global `fetch` (available in Node LTS without any package).

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'catalog-prerendered');
const SITE_BASE_URL = 'https://mangalist.co.il'; // placeholder canonical domain -- see note above

// catalog-shared.js moved to legacy/ as part of the React cutover (it is
// still required from there rather than duplicated, since it's plain
// CommonJS-requirable and this script is the one remaining consumer of the
// legacy copy outside legacy/ itself).
const C = require(path.join(REPO_ROOT, 'legacy', 'catalog-shared.js'));

const PRODUCT_SELECT =
  'id,name,slug,description,specs,' +
  'brand:brands(id,name,slug),' +
  'category:categories(id,name,slug),' +
  'product_variants(id,sku,variant_name,price_ils,stock_status,stock_qty,dimensions,sort_order),' +
  'product_images(id,url,alt_text,is_primary,variant_id,sort_order)';

function loadSupabaseConfig() {
  // Reads web/.env.local directly (the same file the Vite app reads via
  // `import.meta.env.VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`), so there
  // is still only one place the local URL/anon key are set -- just a
  // different one since the React cutover retired the old
  // window.SUPABASE_CONFIG browser-script pattern. Plain, dependency-free
  // line parsing (no dotenv package) since this is a repo-root plain-Node
  // script, not part of the web/ Vite build.
  const envPath = path.join(REPO_ROOT, 'web', '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Missing ${envPath} -- copy web/.env.example to web/.env.local and fill in real values.`);
  }
  const source = fs.readFileSync(envPath, 'utf8');
  const values = {};
  source.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    values[key] = value;
  });
  const config = { url: values.VITE_SUPABASE_URL, anonKey: values.VITE_SUPABASE_ANON_KEY };
  if (!config.url || !config.anonKey) {
    throw new Error('web/.env.local did not yield usable VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY values.');
  }
  return config;
}

async function fetchPublishedProducts(config) {
  const url = `${config.url}/rest/v1/products?select=${encodeURIComponent(PRODUCT_SELECT)}&published=eq.true`;
  const res = await fetch(url, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`PostgREST request failed (${res.status}): ${body}`);
  }
  return res.json();
}

function priceSnapshot(variants) {
  const price = C.minPrice(variants);
  if (price === null) {
    return { text: 'מחיר לפי פנייה', isInquiry: true };
  }
  return { text: C.formatPrice(price), isInquiry: false };
}

function renderProductHtml(product) {
  const variants = product.product_variants || [];
  const images = product.product_images || [];
  const img = C.primaryImage(images);
  const status = C.bestStockStatus(variants);
  const stock = C.stockInfo(status);
  const price = priceSnapshot(variants);
  // Site-root-relative paths matching the new React app's routes (see
  // web/src/App.jsx): /product/:id, /shop, /contact.
  const productPath = `/product/${encodeURIComponent(product.id)}`;
  const canonicalUrl = `${SITE_BASE_URL}${productPath}`;

  const title = `${product.name} — מנגליסט`;
  const descriptionSource = product.description || `${product.name} מבית ${product.brand ? product.brand.name : ''} — זמין באתר מנגליסט.`;
  const metaDescription = descriptionSource.length > 300 ? descriptionSource.slice(0, 297) + '...' : descriptionSource;
  const ogImage = img ? img.url : '';

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="theme-color" content="#0E0D0B" />
  <title>${C.escapeHtml(title)}</title>
  <meta name="description" content="${C.escapeHtml(metaDescription)}" />
  <link rel="canonical" href="${C.escapeHtml(canonicalUrl)}" />

  <meta property="og:type" content="product" />
  <meta property="og:title" content="${C.escapeHtml(title)}" />
  <meta property="og:description" content="${C.escapeHtml(metaDescription)}" />
  <meta property="og:url" content="${C.escapeHtml(canonicalUrl)}" />
  ${ogImage ? `<meta property="og:image" content="${C.escapeHtml(ogImage)}" />` : ''}

  <style>
    /* Minimal inline styling only -- this snapshot is a standalone HTML file
       with zero dependency on the retired legacy/styles.css or the new Vite
       build's hashed asset filenames (which change every production build
       and can't be reliably linked to from a script that runs independently
       of the build). Not the site's real design, just readable. */
    body { margin: 0; padding: 1.5rem; background: #0e0d0b; color: #f3ede4; font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif; }
    main { max-width: 780px; margin: 0 auto; }
    a { color: #e08a3e; }
    .prerendered-notice { background: #1c1a16; border: 1px solid #3a352c; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .product-breadcrumb { font-size: 0.85rem; color: #b8ada0; margin-bottom: 1rem; }
    .product-detail-grid { display: flex; flex-wrap: wrap; gap: 1.5rem; }
    .product-gallery { flex: 1 1 280px; }
    .product-gallery img { max-width: 100%; border-radius: 8px; display: block; }
    .product-card-placeholder { background: #1c1a16; border-radius: 8px; padding: 3rem 1rem; text-align: center; color: #7a7266; }
    .product-info { flex: 1 1 280px; }
    .product-brand { color: #b8ada0; margin: 0 0 0.25rem; }
    .product-price-row { display: flex; align-items: center; gap: 0.75rem; margin: 0.75rem 0; }
    .product-price { font-size: 1.25rem; font-weight: 600; }
    .stock-badge { font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 999px; background: #2a2620; }
    .btn { display: inline-block; margin-top: 1rem; padding: 0.6rem 1.2rem; border-radius: 6px; background: #e08a3e; color: #0e0d0b; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <main class="product-page">
    <div class="prerendered-notice">
      זהו תצוגת-תוכן סטטית (למנועי חיפוש ותצוגות-תצוגה-מקדימה). למסך המוצר האינטראקטיבי
      המלא (כולל בחירת גרסה, גלריית תמונות) — <a href="${productPath}">לחצו כאן</a>.
    </div>

    <article class="product-detail">
      <p class="product-breadcrumb">
        <a href="/shop">קטלוג</a>
        <span aria-hidden="true"> / </span>
        <span>${C.escapeHtml(product.category ? product.category.name : '')}</span>
      </p>

      <div class="product-detail-grid">
        <div class="product-gallery">
          <div class="product-gallery-main">
            ${img
              ? `<img src="${C.escapeHtml(img.url)}" alt="${C.escapeHtml(img.alt_text || product.name)}" />`
              : `<div class="product-card-placeholder"><span>אין תמונה זמינה</span></div>`}
          </div>
        </div>

        <div class="product-info">
          <p class="product-brand">${C.escapeHtml(product.brand ? product.brand.name : '')}</p>
          <h1>${C.escapeHtml(product.name)}</h1>

          <div class="product-price-row">
            <span class="product-price${price.isInquiry ? ' product-price-inquiry' : ''}">${
              price.isInquiry
                ? `<a href="/contact">${C.escapeHtml(price.text)}</a>`
                : C.escapeHtml(price.text)
            }</span>
            <span class="stock-badge stock-badge--${stock.className}">${C.escapeHtml(stock.label)}</span>
          </div>

          <p class="product-description">${C.escapeHtml(product.description || '')}</p>

          <a href="${productPath}" class="btn btn-primary">לצפייה במוצר המלא באתר</a>
        </div>
      </div>
    </article>
  </main>
</body>
</html>
`;
}

function cleanOutputDir(expectedFilenames) {
  if (!fs.existsSync(OUTPUT_DIR)) return;
  const existing = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.html'));
  const expectedSet = new Set(expectedFilenames);
  existing.forEach((filename) => {
    if (!expectedSet.has(filename)) {
      fs.unlinkSync(path.join(OUTPUT_DIR, filename));
      console.log(`  removed stale: ${filename}`);
    }
  });
}

async function main() {
  const config = loadSupabaseConfig();
  console.log(`Fetching published products from ${config.url} ...`);
  const products = await fetchPublishedProducts(config);
  console.log(`Found ${products.length} published product(s).`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const expectedFilenames = products.map((p) => `${p.id}.html`);
  cleanOutputDir(expectedFilenames);

  products.forEach((product) => {
    const html = renderProductHtml(product);
    const filePath = path.join(OUTPUT_DIR, `${product.id}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`  wrote: catalog-prerendered/${product.id}.html (${product.name})`);
  });

  console.log('Done. Re-run this script manually whenever the published catalog changes.');
}

main().catch((err) => {
  console.error('Pre-render failed:', err);
  process.exitCode = 1;
});
