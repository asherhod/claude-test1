// catalog.js -- catalog.html browse/filter/search listing page.
//
// Architecture: ceo/design/product-catalogue-design.html §2.1-2.3 (Option A,
// client-side fetch, no build step). Filter state lives in the URL query
// string so results are linkable/shareable (§2.1); free-text search hits
// Postgres FTS via PostgREST's `fts`-family filter on the generated `fts`
// tsvector column (§2.3, §3.5); facet counts are computed client-side from
// the fetched result set, no extra aggregation query (§2.3, §3.6).
//
// Implementation note (Dev judgment call, not an architecture deviation):
// only the free-text search term is sent to PostgREST as a server-side
// filter (via the `fts` generated column) -- category/brand/price/stock/sort
// are all applied client-side against the already-fetched (search-matched)
// published product set. At the catalog's current scale (dozens of SKUs)
// this is simpler and more robust than trying to express variant-level
// price/stock filters as embedded-resource PostgREST filters (which would
// require `!inner` embeds and complicate facet-count math), and matches the
// design doc's own explicit allowance for client-side facet counting at this
// scale (§3.6, §5.2 item 2). Flagged here for visibility, not because it
// needed a fresh architecture decision.

(function () {
  'use strict';

  var C = window.MangalistCatalog;

  var supabaseClient =
    window.supabase && window.SUPABASE_CONFIG
      ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
      : null;

  var els = {
    search: document.getElementById('filter-search'),
    category: document.getElementById('filter-category'),
    brand: document.getElementById('filter-brand'),
    priceMin: document.getElementById('filter-price-min'),
    priceMax: document.getElementById('filter-price-max'),
    stock: document.getElementById('filter-stock'),
    sort: document.getElementById('filter-sort'),
    clear: document.getElementById('filter-clear'),
    grid: document.getElementById('catalog-grid'),
    resultCount: document.getElementById('catalog-result-count'),
    empty: document.getElementById('catalog-empty'),
    loading: document.getElementById('catalog-loading'),
    error: document.getElementById('catalog-error'),
  };

  var allCategories = []; // published categories, from the categories table
  var allBrands = []; // published brands, from the brands table
  var allProducts = []; // current search-matched published product set (with joins)

  var PRODUCT_SELECT =
    'id, name, slug, description, specs,' +
    ' brand:brands(id, name, slug),' +
    ' category:categories(id, name, slug),' +
    ' product_variants(id, sku, variant_name, price_ils, stock_status, stock_qty, dimensions, sort_order),' +
    ' product_images(id, url, alt_text, is_primary, variant_id, sort_order)';

  // ---------------------------------------------------------------------
  // URL <-> filter state
  // ---------------------------------------------------------------------

  function readStateFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      category: params.get('category') || '',
      brand: params.get('brand') || '',
      priceMin: params.get('price_min') || '',
      priceMax: params.get('price_max') || '',
      stock: params.get('stock') || '',
      sort: params.get('sort') || 'name_asc',
    };
  }

  function writeStateToUrl(state) {
    var params = new URLSearchParams();
    if (state.q) params.set('q', state.q);
    if (state.category) params.set('category', state.category);
    if (state.brand) params.set('brand', state.brand);
    if (state.priceMin) params.set('price_min', state.priceMin);
    if (state.priceMax) params.set('price_max', state.priceMax);
    if (state.stock) params.set('stock', state.stock);
    if (state.sort && state.sort !== 'name_asc') params.set('sort', state.sort);
    var qs = params.toString();
    var newUrl = window.location.pathname + (qs ? '?' + qs : '');
    window.history.replaceState(null, '', newUrl);
  }

  function currentState() {
    return {
      q: els.search.value.trim(),
      category: els.category.value,
      brand: els.brand.value,
      priceMin: els.priceMin.value,
      priceMax: els.priceMax.value,
      stock: els.stock.value,
      sort: els.sort.value,
    };
  }

  function applyStateToControls(state) {
    els.search.value = state.q;
    els.category.value = state.category;
    els.brand.value = state.brand;
    els.priceMin.value = state.priceMin;
    els.priceMax.value = state.priceMax;
    els.stock.value = state.stock;
    els.sort.value = state.sort;
  }

  // ---------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------

  async function fetchTaxonomies() {
    var [{ data: categories, error: catErr }, { data: brands, error: brandErr }] = await Promise.all([
      supabaseClient.from('categories').select('id, name, slug, parent_id, sort_order').eq('published', true),
      supabaseClient.from('brands').select('id, name, slug').eq('published', true),
    ]);
    if (catErr) throw catErr;
    if (brandErr) throw brandErr;
    allCategories = categories || [];
    allBrands = (brands || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'he'); });
  }

  // Fetches the published product set, optionally narrowed by a free-text
  // search term via the PostgREST `fts` filter against the generated
  // `products.fts` tsvector column ('simple' config, per DBA/design). Uses
  // `plfts` (plainto_tsquery) rather than `fts` (to_tsquery) because it
  // accepts arbitrary free-text user input (multiple words, punctuation)
  // without requiring tsquery operator syntax -- confirmed locally that
  // `fts` (to_tsquery) throws a Postgres syntax error on a plain multi-word
  // phrase, which would be a bad experience for a search box.
  async function fetchProducts(searchTerm) {
    var query = supabaseClient.from('products').select(PRODUCT_SELECT).eq('published', true);
    if (searchTerm) {
      query = query.filter('fts', 'plfts(simple)', searchTerm);
    }
    var { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // ---------------------------------------------------------------------
  // Client-side filtering / sorting / facets
  // ---------------------------------------------------------------------

  function matchesFilters(product, state, excludeKey) {
    if (excludeKey !== 'category' && state.category && (!product.category || product.category.slug !== state.category)) {
      return false;
    }
    if (excludeKey !== 'brand' && state.brand && (!product.brand || product.brand.slug !== state.brand)) {
      return false;
    }
    var variants = product.product_variants || [];
    if (excludeKey !== 'stock' && state.stock) {
      var hasStock = variants.some(function (v) { return (v.stock_status || 'unknown') === state.stock; });
      if (!hasStock) return false;
    }
    if (excludeKey !== 'price' && (state.priceMin || state.priceMax)) {
      var min = state.priceMin ? Number(state.priceMin) : -Infinity;
      var max = state.priceMax ? Number(state.priceMax) : Infinity;
      var hasPriceInRange = variants.some(function (v) {
        return v.price_ils !== null && v.price_ils !== undefined && Number(v.price_ils) >= min && Number(v.price_ils) <= max;
      });
      if (!hasPriceInRange) return false;
    }
    return true;
  }

  function filterProducts(products, state, excludeKey) {
    return products.filter(function (p) { return matchesFilters(p, state, excludeKey); });
  }

  function sortProducts(products, sort) {
    var sorted = products.slice();
    if (sort === 'price_asc' || sort === 'price_desc') {
      sorted.sort(function (a, b) {
        var pa = C.minPrice(a.product_variants);
        var pb = C.minPrice(b.product_variants);
        // Null-priced ("price on request") products sort last regardless of direction.
        if (pa === null && pb === null) return a.name.localeCompare(b.name, 'he');
        if (pa === null) return 1;
        if (pb === null) return -1;
        return sort === 'price_asc' ? pa - pb : pb - pa;
      });
    } else {
      sorted.sort(function (a, b) { return a.name.localeCompare(b.name, 'he'); });
    }
    return sorted;
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  function renderTaxonomyOptions(state) {
    var facetBaseForCategory = filterProducts(allProducts, state, 'category');
    var facetBaseForBrand = filterProducts(allProducts, state, 'brand');

    var categoryCounts = {};
    facetBaseForCategory.forEach(function (p) {
      if (!p.category) return;
      categoryCounts[p.category.slug] = (categoryCounts[p.category.slug] || 0) + 1;
    });
    var brandCounts = {};
    facetBaseForBrand.forEach(function (p) {
      if (!p.brand) return;
      brandCounts[p.brand.slug] = (brandCounts[p.brand.slug] || 0) + 1;
    });

    var topLevel = allCategories.filter(function (c) { return !c.parent_id; })
      .sort(function (a, b) { return (a.sort_order - b.sort_order) || a.name.localeCompare(b.name, 'he'); });

    var categoryHtml = '<option value="">כל הקטגוריות</option>';
    topLevel.forEach(function (cat) {
      categoryHtml += categoryOptionHtml(cat, categoryCounts, 0);
      var children = allCategories.filter(function (c) { return c.parent_id === cat.id; })
        .sort(function (a, b) { return (a.sort_order - b.sort_order) || a.name.localeCompare(b.name, 'he'); });
      children.forEach(function (child) { categoryHtml += categoryOptionHtml(child, categoryCounts, 1); });
    });
    els.category.innerHTML = categoryHtml;

    var brandHtml = '<option value="">כל המותגים</option>';
    allBrands.forEach(function (brand) {
      var count = brandCounts[brand.slug] || 0;
      brandHtml += '<option value="' + C.escapeHtml(brand.slug) + '">' + C.escapeHtml(brand.name) + ' (' + count + ')</option>';
    });
    els.brand.innerHTML = brandHtml;

    els.category.value = state.category;
    els.brand.value = state.brand;
  }

  function categoryOptionHtml(cat, counts, depth) {
    var count = counts[cat.slug] || 0;
    var prefix = depth > 0 ? '— ' : '';
    return '<option value="' + C.escapeHtml(cat.slug) + '">' + prefix + C.escapeHtml(cat.name) + ' (' + count + ')</option>';
  }

  function productCardHtml(product) {
    var img = C.primaryImage(product.product_images);
    var variants = product.product_variants || [];
    var price = C.minPrice(variants);
    var status = C.bestStockStatus(variants);
    var info = C.stockInfo(status);
    var mediaHtml = img
      ? '<img src="' + C.escapeHtml(img.url) + '" alt="' + C.escapeHtml(img.alt_text || product.name) + '" loading="lazy" />'
      : '<div class="product-card-placeholder" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="M21 15l-5-5-9 9"></path></svg>' +
          '<span>אין תמונה זמינה</span>' +
        '</div>';
    // Plain <span>, never an <a> here -- the whole card is already a single
    // <a class="product-card">; nesting an <a> inside it is invalid HTML and
    // real browsers recover from it by splitting the outer link in half
    // (confirmed locally), silently breaking the card. The interactive
    // "מחיר לפי פנייה" -> contact-form link lives on product.html instead.
    var priceHtml = price !== null
      ? '<span class="product-card-price">' + C.escapeHtml(C.formatPrice(price)) + '</span>'
      : '<span class="product-card-price product-card-price-inquiry">מחיר לפי פנייה</span>';

    return (
      '<a class="product-card" href="product.html?id=' + encodeURIComponent(product.id) + '">' +
        '<div class="product-card-media">' + mediaHtml + '</div>' +
        '<div class="product-card-body">' +
          '<span class="stock-badge stock-badge--' + info.className + '">' + C.escapeHtml(info.label) + '</span>' +
          '<h3 class="product-card-name">' + C.escapeHtml(product.name) + '</h3>' +
          '<p class="product-card-meta">' +
            (product.brand ? C.escapeHtml(product.brand.name) : '') +
            (product.category ? ' · ' + C.escapeHtml(product.category.name) : '') +
          '</p>' +
          priceHtml +
        '</div>' +
      '</a>'
    );
  }

  function render() {
    var state = currentState();
    writeStateToUrl(state);
    renderTaxonomyOptions(state);

    var visible = sortProducts(filterProducts(allProducts, state, null), state.sort);

    els.grid.innerHTML = visible.map(productCardHtml).join('');
    els.resultCount.textContent = visible.length + (visible.length === 1 ? ' מוצר נמצא' : ' מוצרים נמצאו');
    els.empty.hidden = visible.length !== 0;
  }

  // ---------------------------------------------------------------------
  // Init / wiring
  // ---------------------------------------------------------------------

  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  async function reloadForSearch(state) {
    els.loading.hidden = false;
    els.error.hidden = true;
    try {
      allProducts = await fetchProducts(state.q);
    } catch (err) {
      console.error('Catalog product fetch failed:', err);
      els.error.hidden = false;
      allProducts = [];
    }
    els.loading.hidden = true;
    render();
  }

  var debouncedSearchReload = debounce(function () {
    reloadForSearch(currentState());
  }, 350);

  function wireEvents() {
    els.search.addEventListener('input', debouncedSearchReload);
    [els.category, els.brand, els.priceMin, els.priceMax, els.stock, els.sort].forEach(function (el) {
      el.addEventListener('change', render);
    });
    els.priceMin.addEventListener('input', debounce(render, 250));
    els.priceMax.addEventListener('input', debounce(render, 250));
    els.clear.addEventListener('click', function () {
      applyStateToControls({ q: '', category: '', brand: '', priceMin: '', priceMax: '', stock: '', sort: 'name_asc' });
      reloadForSearch(currentState());
    });
  }

  async function init() {
    if (!supabaseClient) {
      els.loading.hidden = true;
      els.error.hidden = false;
      return;
    }

    var initialState = readStateFromUrl();
    applyStateToControls(initialState);
    wireEvents();

    try {
      await fetchTaxonomies();
    } catch (err) {
      console.error('Catalog taxonomy fetch failed:', err);
      els.loading.hidden = true;
      els.error.hidden = false;
      return;
    }

    await reloadForSearch(initialState);
  }

  init();
})();
