// product.js -- product.html single product detail page, ?id=<uuid>.
//
// Architecture: ceo/design/product-catalogue-design.html §2.2 (id-based
// routing for products; Marketing hasn't settled a Hebrew slug convention
// yet) and §2.4 (variant picker / stock badge / price-on-request behavior).

(function () {
  'use strict';

  var C = window.MangalistCatalog;

  var supabaseClient =
    window.supabase && window.SUPABASE_CONFIG
      ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
      : null;

  var els = {
    loading: document.getElementById('product-loading'),
    error: document.getElementById('product-error'),
    detail: document.getElementById('product-detail'),
    category: document.getElementById('product-category'),
    galleryMain: document.getElementById('product-gallery-main'),
    galleryThumbs: document.getElementById('product-gallery-thumbs'),
    brand: document.getElementById('product-brand'),
    name: document.getElementById('product-name'),
    variantPicker: document.getElementById('product-variant-picker'),
    price: document.getElementById('product-price'),
    stockBadge: document.getElementById('product-stock-badge'),
    dimensions: document.getElementById('product-dimensions'),
    specs: document.getElementById('product-specs'),
    description: document.getElementById('product-description'),
    pageTitle: document.getElementById('page-title'),
  };

  var PRODUCT_SELECT =
    'id, name, slug, description, specs,' +
    ' brand:brands(id, name, slug),' +
    ' category:categories(id, name, slug),' +
    ' product_variants(id, sku, variant_name, price_ils, stock_status, stock_qty, dimensions, sort_order),' +
    ' product_images(id, url, alt_text, is_primary, variant_id, sort_order)';

  // Known products.specs keys for the gas-grills convention documented in
  // supabase-local/README.md + the create_catalog_schema.sql migration.
  // dimensions_text is deliberately excluded here -- it's surfaced via
  // C.dimensionsText() as a dimensions fallback, not repeated in this list.
  var SPEC_LABELS = {
    burners: 'מספר מבערים',
    price_tier_note: 'הערת מחיר (התייחסות בלבד, לא המחיר הסופי)',
  };

  var product = null;
  var selectedVariantId = null;

  function getIdFromUrl() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function showError() {
    els.loading.hidden = true;
    els.error.hidden = false;
    els.detail.hidden = true;
  }

  // Variants sorted by sort_order -- PostgREST/Postgres do not guarantee any
  // particular row order for an embedded resource without an explicit
  // `order=`, so relying on raw array order (as returned by the API) picked
  // an arbitrary "default" variant in local testing. Always go through this
  // helper rather than `product.product_variants` directly.
  function sortedVariants() {
    return (product.product_variants || []).slice().sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
  }

  function selectedVariant() {
    var variants = sortedVariants();
    return variants.find(function (v) { return v.id === selectedVariantId; }) || variants[0] || null;
  }

  function renderGallery() {
    var variant = selectedVariant();
    var images = C.imagesForVariant(product.product_images, variant ? variant.id : null);

    if (!images.length) {
      els.galleryMain.innerHTML =
        '<div class="product-card-placeholder" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="M21 15l-5-5-9 9"></path></svg>' +
          '<span>אין תמונה זמינה</span>' +
        '</div>';
      els.galleryThumbs.innerHTML = '';
      return;
    }

    function setMain(img) {
      els.galleryMain.innerHTML =
        '<img src="' + C.escapeHtml(img.url) + '" alt="' + C.escapeHtml(img.alt_text || product.name) + '" />';
    }

    setMain(images[0]);

    if (images.length > 1) {
      els.galleryThumbs.innerHTML = images
        .map(function (img, i) {
          return '<button type="button" class="product-gallery-thumb' + (i === 0 ? ' is-active' : '') +
            '" data-url="' + C.escapeHtml(img.url) + '" data-alt="' + C.escapeHtml(img.alt_text || product.name) + '">' +
            '<img src="' + C.escapeHtml(img.url) + '" alt="" loading="lazy" /></button>';
        })
        .join('');

      els.galleryThumbs.querySelectorAll('.product-gallery-thumb').forEach(function (btn) {
        btn.addEventListener('click', function () {
          els.galleryThumbs.querySelectorAll('.product-gallery-thumb').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          els.galleryMain.innerHTML = '<img src="' + btn.getAttribute('data-url') + '" alt="' + btn.getAttribute('data-alt') + '" />';
        });
      });
    } else {
      els.galleryThumbs.innerHTML = '';
    }
  }

  function renderVariantDependent() {
    var variant = selectedVariant();

    // `#product-price` is a plain <span> in product.html -- when there's no
    // real price, render an actual <a href="index.html#contact"> *inside*
    // it (design §2.4: null price links to the contact form) rather than
    // trying to toggle an href on the span itself (a no-op bug caught during
    // local testing: a <span> has no href attribute to set/remove).
    if (variant && variant.price_ils !== null && variant.price_ils !== undefined) {
      els.price.classList.remove('product-price-inquiry');
      els.price.textContent = C.formatPrice(variant.price_ils);
    } else {
      els.price.classList.add('product-price-inquiry');
      els.price.innerHTML = '<a href="index.html#contact">מחיר לפי פנייה</a>';
    }

    var status = variant ? (variant.stock_status || 'unknown') : 'unknown';
    var info = C.stockInfo(status);
    els.stockBadge.textContent = info.label;
    els.stockBadge.className = 'stock-badge stock-badge--' + info.className;

    var dimText = C.dimensionsText(variant, product.specs);
    if (dimText) {
      els.dimensions.hidden = false;
      els.dimensions.innerHTML = '<dt>מידות</dt><dd>' + C.escapeHtml(dimText) + '</dd>';
    } else {
      els.dimensions.hidden = true;
      els.dimensions.innerHTML = '';
    }

    renderGallery();
  }

  function renderVariantPicker() {
    var variants = sortedVariants();

    if (variants.length <= 1) {
      els.variantPicker.hidden = true;
      els.variantPicker.innerHTML = '';
      selectedVariantId = variants.length ? variants[0].id : null;
      return;
    }

    els.variantPicker.hidden = false;
    els.variantPicker.innerHTML = variants
      .map(function (v, i) {
        var label = v.variant_name || 'אפשרות ' + (i + 1);
        return '<button type="button" class="variant-pill' + (v.id === selectedVariantId ? ' is-active' : '') +
          '" data-variant-id="' + v.id + '">' + C.escapeHtml(label) + '</button>';
      })
      .join('');

    els.variantPicker.querySelectorAll('.variant-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedVariantId = btn.getAttribute('data-variant-id');
        els.variantPicker.querySelectorAll('.variant-pill').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        renderVariantDependent();
      });
    });
  }

  function renderSpecs() {
    var specs = product.specs || {};
    var rows = Object.keys(SPEC_LABELS)
      .filter(function (key) { return specs[key] !== undefined && specs[key] !== null && specs[key] !== ''; })
      .map(function (key) {
        return '<div class="product-spec-row"><span class="product-spec-label">' + C.escapeHtml(SPEC_LABELS[key]) +
          '</span><span class="product-spec-value">' + C.escapeHtml(specs[key]) + '</span></div>';
      });
    els.specs.innerHTML = rows.join('');
  }

  function render() {
    els.pageTitle.textContent = product.name + ' — מנגליסט';
    els.name.textContent = product.name;
    els.brand.textContent = product.brand ? product.brand.name : '';
    els.category.textContent = product.category ? product.category.name : '';
    els.description.textContent = product.description || '';

    var variants = sortedVariants();
    selectedVariantId = variants.length ? variants[0].id : null;

    renderVariantPicker();
    renderVariantDependent();
    renderSpecs();

    els.loading.hidden = true;
    els.error.hidden = true;
    els.detail.hidden = false;
  }

  async function init() {
    var id = getIdFromUrl();
    if (!id || !supabaseClient) {
      showError();
      return;
    }

    try {
      var { data, error } = await supabaseClient
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('id', id)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        showError();
        return;
      }

      product = data;
      render();
    } catch (err) {
      console.error('Product fetch failed:', err);
      showError();
    }
  }

  init();
})();
