import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { minPrice, primaryImage, formatPrice, cheapestVariant } from '../lib/catalogShared';
import { BADGE_LABELS } from '../lib/badges';
import './ProductCard.css';

// Reusable product card -- ports ceo/design/new-site-redesign-handoff/ProductCard.dc.html.
//
// Badge pill: `products.badge` is a stable code (see the
// 20260706100000 DBA migration's column comment), mapped to its Hebrew
// display label in lib/badges.js (shared with ProductDetail), client-side,
// so copy changes don't need a migration.

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { add } = useCart();

  const price = minPrice(product.product_variants);
  const image = primaryImage(product.product_images);
  const vendorCat = [product.brand?.name, product.category?.name].filter(Boolean).join(' · ');
  const badgeLabel = product.badge ? BADGE_LABELS[product.badge] : null;

  function handleView() {
    navigate(`/product/${product.id}`);
  }

  function handleAdd(e) {
    e.stopPropagation();
    // No variant picker on the card -- add the same variant whose price is
    // shown (cheapestVariant mirrors the minPrice() used above for display).
    const variant = cheapestVariant(product.product_variants);
    if (!variant) return;
    add(product.id, variant.id, 1);
  }

  return (
    <div className="product-card">
      <div className="product-card-media" onClick={handleView} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleView()}>
        {image ? (
          <img src={image.url} alt={image.alt_text || product.name} loading="lazy" />
        ) : (
          <div className="product-card-placeholder" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5-9 9" />
            </svg>
            <span>אין תמונה זמינה</span>
          </div>
        )}
        {badgeLabel && <span className="product-card-badge">{badgeLabel}</span>}
      </div>
      <div className="product-card-body">
        <span className="product-card-meta">{vendorCat}</span>
        <h3 className="product-card-title" onClick={handleView}>
          {product.name}
        </h3>
        <div className="product-card-price-row">
          {price !== null ? (
            <span className="product-card-price">{formatPrice(price)}</span>
          ) : (
            <span className="product-card-price product-card-price-inquiry">מחיר לפי פנייה</span>
          )}
        </div>
        <button type="button" className="btn btn-primary btn-sm btn-block" onClick={handleAdd}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="20" r="1.3" />
            <circle cx="18" cy="20" r="1.3" />
            <path d="M2.5 3.5h2.4l2.1 11.6a1.4 1.4 0 0 0 1.4 1.15h8.4a1.4 1.4 0 0 0 1.4-1.1L20.5 7.2H5.3" />
          </svg>
          הוספה לסל
        </button>
      </div>
    </div>
  );
}
