import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProductById } from '../hooks/useCatalog.js';
import { useCart } from '../context/CartContext.jsx';
import { dimensionsText, formatPrice, imagesForVariant, stockInfo } from '../lib/catalogShared';
import { BADGE_LABELS } from '../lib/badges';
import Placeholder from '../components/Placeholder.jsx';
import './ProductDetail.css';

// Known products.specs keys (same convention as product.js's SPEC_LABELS),
// mapped to a friendlier Hebrew label. Per the CIO task brief: this is a
// *display* nicety only -- any OTHER key present in `specs` is still
// rendered (via humanizeSpecKey below), not hidden, so this list is
// deliberately not treated as the exhaustive set of keys that can ever
// appear. `dimensions_text` is intentionally excluded here -- it's surfaced
// as its own "מידות" row via dimensionsText() below, same as product.js.
const SPEC_LABELS = {
  burners: 'מספר מבערים',
  price_tier_note: 'הערת מחיר (התייחסות בלבד, לא המחיר הסופי)',
};

function humanizeSpecKey(key) {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function sortByOrder(list) {
  return (list || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { data: product, loading, error } = useProductById(id);

  const variants = useMemo(() => sortByOrder(product ? product.product_variants : []), [product]);

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [qty, setQty] = useState(1);

  // Reset local selection state whenever a (new) product loads.
  useEffect(() => {
    setSelectedVariantId(variants.length ? variants[0].id : null);
    setQty(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  const images = useMemo(
    () => imagesForVariant(product ? product.product_images : [], selectedVariant ? selectedVariant.id : null),
    [product, selectedVariant]
  );

  // Reset the selected gallery image whenever the image set changes (e.g. a
  // variant switch swaps in variant-scoped images).
  useEffect(() => {
    if (!images.length) {
      setSelectedImageId(null);
      return;
    }
    const primary = images.find((img) => img.is_primary) || images[0];
    setSelectedImageId(primary.id);
  }, [images]);

  if (loading) {
    return (
      <div className="container product-status-wrap">
        <p className="product-status">טוען מוצר...</p>
      </div>
    );
  }

  if (error || !product) {
    // Same posture as product.js's not-found handling: a missing id, a
    // garbage id, and a real-but-unpublished id all land here identically --
    // never distinguish "exists but unpublished" from "doesn't exist" in the
    // UI, so an unpublished product's existence is never confirmable by a
    // real customer guessing ids.
    return (
      <Placeholder
        title="המוצר לא נמצא"
        note="המוצר לא נמצא, או שאינו זמין כרגע. אפשר לחזור לחנות, או ליצור קשר."
      />
    );
  }

  const mainImage = images.find((img) => img.id === selectedImageId) || images[0] || null;
  const thumbImages = images.filter((img) => !mainImage || img.id !== mainImage.id).slice(0, 3);

  const hasPrice = selectedVariant && selectedVariant.price_ils !== null && selectedVariant.price_ils !== undefined;
  const priceLabel = hasPrice ? formatPrice(selectedVariant.price_ils) : null;

  const stockStatus = selectedVariant ? selectedVariant.stock_status || 'unknown' : 'unknown';
  const stock = stockInfo(stockStatus);

  const dimsLabel = dimensionsText(selectedVariant, product.specs);

  const specEntries = Object.entries(product.specs || {})
    .filter(([key, value]) => key !== 'dimensions_text' && value !== null && value !== undefined && value !== '')
    .map(([key, value]) => [SPEC_LABELS[key] || humanizeSpecKey(key), value]);

  const badgeLabel = product.badge ? BADGE_LABELS[product.badge] : null;
  const vendorCat = [product.brand?.name, product.category?.name].filter(Boolean).join(' · ');

  function handleVariantSelect(variantId) {
    setSelectedVariantId(variantId);
  }

  function handleAddToCart() {
    if (!selectedVariant) return;
    // Records the variant the customer actually selected/saw the price for
    // (fix for the 2026-07-06 QA bug -- Cart.jsx no longer has to guess).
    add(product.id, selectedVariant.id, qty);
    navigate('/cart');
  }

  return (
    <div className="container product-detail-page">
      <Link to="/shop" className="product-back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        חזרה לחנות
      </Link>

      <div className="product-detail-grid">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            {mainImage ? (
              <img src={mainImage.url} alt={mainImage.alt_text || product.name} />
            ) : (
              <div className="product-image-placeholder" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="M21 15l-5-5-9 9" />
                </svg>
                <span>אין תמונה זמינה</span>
              </div>
            )}
          </div>
          {thumbImages.length > 0 && (
            <div className="product-gallery-thumbs">
              {thumbImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className="product-gallery-thumb"
                  onClick={() => setSelectedImageId(img.id)}
                >
                  <img src={img.url} alt={img.alt_text || ''} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="product-info-card">
          <div className="product-info-meta">
            <span className="product-vendor-cat">{vendorCat}</span>
            {badgeLabel && <span className="product-badge-tag">{badgeLabel}</span>}
          </div>

          <h1 className="product-name">{product.name}</h1>

          {hasPrice ? (
            <div className="product-price">{priceLabel}</div>
          ) : (
            <div className="product-price product-price-inquiry">
              <Link to="/contact">מחיר לפי פנייה</Link>
            </div>
          )}

          <span className={'stock-badge stock-badge--' + stock.className}>{stock.label}</span>

          {variants.length > 1 && (
            <div className="product-variant-picker">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  type="button"
                  className={'variant-pill' + (v.id === selectedVariantId ? ' is-active' : '')}
                  onClick={() => handleVariantSelect(v.id)}
                >
                  {v.variant_name || `אפשרות ${i + 1}`}
                </button>
              ))}
            </div>
          )}

          {product.description && <p className="product-description">{product.description}</p>}

          {(dimsLabel || specEntries.length > 0) && (
            <div className="product-specs">
              {dimsLabel && (
                <div className="product-spec-row">
                  <span className="product-spec-label">מידות</span>
                  {/* dir="ltr" establishes an isolated LTR run for this
                      logically-LTR value (numbers/"x"/units) sitting inside
                      the page's RTL container -- without it the browser
                      visually reverses the string (e.g. renders
                      "132 x 61 x 114 cm" as "x 61 x 114 cm 132"). */}
                  <span className="product-spec-value" dir="ltr">{dimsLabel}</span>
                </div>
              )}
              {specEntries.map(([label, value]) => (
                <div className="product-spec-row" key={label}>
                  <span className="product-spec-label">{label}</span>
                  <span className="product-spec-value">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="product-add-row">
            <div className="qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="הפחתת כמות"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className="qty-value">{qty}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQty((q) => q + 1)}
                aria-label="הוספת כמות"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <button type="button" className="btn btn-primary btn-lg btn-raised btn-block" onClick={handleAddToCart}>
              הוספה לסל{hasPrice ? ` · ${formatPrice(selectedVariant.price_ils * qty)}` : ''}
            </button>
          </div>

          <div className="product-note-strip">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>משלוח והרכבה עד הבית · אחריות יצרן מלאה · תמיכה טכנית לכל החיים</span>
          </div>
        </div>
      </div>
    </div>
  );
}
