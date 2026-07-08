import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { fetchProductById } from '../lib/catalogQueries.js';
import { formatPrice, primaryImage } from '../lib/catalogShared';
import './Cart.css';

// Design's exact free-shipping rule (README "Cart + checkout"): free at/above
// a ₪1,000 subtotal, otherwise a flat ₪49 -- matches the prototype's
// `placeOrder`/render logic (`freeShip = subtotal >= 1000`,
// `shipping = subtotal > 0 && !freeShip ? 49 : 0`).
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_FEE = 49;

const EMPTY_FORM = { fullName: '', phone: '', email: '', city: '', address: '' };

export default function Cart() {
  const { cart, add, dec, remove, clear } = useCart();
  const navigate = useNavigate();

  // Cart lines: composite key -> { productId, variantId, qty } (see
  // CartContext.jsx). `entries` is the raw set of lines before resolving
  // against fetched product/variant data below.
  const entries = Object.entries(cart).map(([key, line]) => ({ key, ...line }));

  const [products, setProducts] = useState({}); // productId -> product row
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orderDone, setOrderDone] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // For each *distinct* product id referenced by the cart, fetch the
  // product's current data (name/image/variants) via the same publish-gated
  // query used everywhere else (fetchProductById) -- small cart, no need for
  // a dedicated batch-fetch endpoint (per the CIO task brief, "your call on
  // efficiency"). A product that's since been unpublished/deleted simply
  // won't resolve, and below, a line whose specific variant id is no longer
  // present in the resolved product (unpublished/removed variant, product
  // still published) is dropped the same way -- both stay in localStorage as
  // stray data but don't affect totals or crash rendering, reasonable given
  // carts aren't a real order record in this schema.
  useEffect(() => {
    const currentIds = [...new Set(Object.values(cart).map((line) => line.productId))];
    if (!currentIds.length) {
      setProducts({});
      setLoadingProducts(false);
      return undefined;
    }
    let cancelled = false;
    setLoadingProducts(true);
    Promise.all(
      currentIds.map((id) =>
        fetchProductById(id).catch((err) => {
          // eslint-disable-next-line no-console
          console.error('Cart product fetch failed for', id, err);
          return null;
        })
      )
    ).then((results) => {
      if (cancelled) return;
      const map = {};
      results.forEach((p, i) => {
        if (p) map[currentIds[i]] = p;
      });
      setProducts(map);
      setLoadingProducts(false);
    });
    return () => {
      cancelled = true;
    };
  }, [cart]);

  function handleFormChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  // Critical constraint (per CIO task brief): this is a UI-only stub, exactly
  // like the existing contact form's client-side-only status message -- no
  // payment gateway/SDK call of any kind. It only clears the cart and shows
  // the success state, mirroring the design prototype's `placeOrder()`.
  function handlePlaceOrder() {
    clear();
    setOrderDone(true);
    window.scrollTo(0, 0);
  }

  if (orderDone) {
    return (
      <div className="container cart-page">
        <h1 className="cart-title">סל הקניות</h1>
        <div className="cart-state-card">
          <span className="cart-state-icon cart-state-icon--success">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <h2 className="cart-state-title">ההזמנה התקבלה!</h2>
          <p className="cart-state-body">תודה שקניתם במנגליסט. שלחנו אישור לדוא״ל שלכם וניצור קשר לתיאום משלוח והרכבה.</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>
            להמשך קנייה
          </button>
        </div>
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="container cart-page">
        <h1 className="cart-title">סל הקניות</h1>
        <div className="cart-state-card">
          <span className="cart-state-icon cart-state-icon--empty">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
              <path d="M2.5 3.5h2.4l2.1 11.6a1.4 1.4 0 0 0 1.4 1.15h8.4a1.4 1.4 0 0 0 1.4-1.1L20.5 7.2H5.3" />
            </svg>
          </span>
          <h2 className="cart-state-title cart-state-title--md">הסל שלכם ריק</h2>
          <p className="cart-state-body">מצאו את הגריל המושלם ותתחילו לצלות.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            מעבר לחנות
          </Link>
        </div>
      </div>
    );
  }

  if (loadingProducts) {
    return (
      <div className="container cart-page">
        <h1 className="cart-title">סל הקניות</h1>
        <p className="cart-status">טוען את הסל...</p>
      </div>
    );
  }

  // Resolve each raw cart entry against its fetched product, then against
  // that specific variant within the product's (publish-filtered)
  // product_variants list. A line is dropped (silently, same posture as the
  // whole-product case) if either the product or that exact variant is no
  // longer resolvable -- e.g. the variant was unpublished/removed while the
  // product itself stayed published.
  const lines = entries
    .map((entry) => {
      const product = products[entry.productId];
      const variant = product ? (product.product_variants || []).find((v) => v.id === entry.variantId) : null;
      return { key: entry.key, qty: entry.qty, product, variant };
    })
    .filter((l) => l.product && l.variant);

  const subtotal = lines.reduce((sum, l) => {
    const unit = l.variant.price_ils !== null && l.variant.price_ils !== undefined ? Number(l.variant.price_ils) : null;
    return sum + (unit !== null ? unit * l.qty : 0);
  }, 0);

  const freeShip = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = subtotal > 0 && !freeShip ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  return (
    <div className="container cart-page">
      <h1 className="cart-title">סל הקניות</h1>

      <div className="cart-layout">
        <div className="cart-main-col">
          <div className="cart-lines-card">
            {lines.map((line) => {
              const unit =
                line.variant.price_ils !== null && line.variant.price_ils !== undefined
                  ? Number(line.variant.price_ils)
                  : null;
              const image = primaryImage(line.product.product_images);
              const lineTotal = unit !== null ? unit * line.qty : null;
              // Only show the variant name alongside the product name when
              // the product actually has more than one variant -- avoids
              // noise like "· רגיל" on today's single-variant seed products.
              const variantLabel =
                (line.product.product_variants || []).length > 1 && line.variant.variant_name
                  ? line.variant.variant_name
                  : null;
              return (
                <div className="cart-line" key={line.key}>
                  <div className="cart-line-thumb">
                    {image ? (
                      <img src={image.url} alt={image.alt_text || line.product.name} />
                    ) : (
                      <div className="cart-line-thumb-placeholder" aria-hidden="true" />
                    )}
                  </div>
                  <div className="cart-line-info">
                    <div className="cart-line-name">
                      {line.product.name}
                      {variantLabel ? ` · ${variantLabel}` : ''}
                    </div>
                    <div className="cart-line-unit">
                      {unit !== null ? formatPrice(unit) : 'מחיר לפי פנייה'} ליחידה
                    </div>
                  </div>
                  <div className="cart-line-stepper">
                    <button type="button" className="qty-btn qty-btn-sm" onClick={() => dec(line.key)} aria-label="הפחתת כמות">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="cart-line-qty">{line.qty}</span>
                    <button
                      type="button"
                      className="qty-btn qty-btn-sm"
                      onClick={() => add(line.product.id, line.variant.id, 1)}
                      aria-label="הוספת כמות"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                  <div className="cart-line-total">{lineTotal !== null ? formatPrice(lineTotal) : 'לפי פנייה'}</div>
                  <button type="button" className="cart-line-remove" onClick={() => remove(line.key)} title="הסרה" aria-label="הסרת פריט">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-shipping-card">
            <h2 className="cart-card-title">פרטי משלוח</h2>
            <div className="cart-shipping-grid">
              <label className="cart-field">
                <span>שם מלא</span>
                <input value={form.fullName} onChange={handleFormChange('fullName')} placeholder="ישראל ישראלי" />
              </label>
              <label className="cart-field">
                <span>טלפון</span>
                <input value={form.phone} onChange={handleFormChange('phone')} placeholder="050-0000000" />
              </label>
              <label className="cart-field">
                <span>דוא״ל</span>
                <input type="email" value={form.email} onChange={handleFormChange('email')} placeholder="you@email.com" />
              </label>
              <label className="cart-field">
                <span>עיר</span>
                <input value={form.city} onChange={handleFormChange('city')} placeholder="תל אביב" />
              </label>
              <label className="cart-field cart-field-full">
                <span>כתובת</span>
                <input value={form.address} onChange={handleFormChange('address')} placeholder="רחוב ומספר, דירה" />
              </label>
            </div>
          </div>
        </div>

        <div className="cart-summary-card">
          <h2 className="cart-card-title">סיכום הזמנה</h2>
          <div className="cart-summary-row">
            <span>סכום ביניים</span>
            <span className="cart-summary-value">{formatPrice(subtotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>משלוח והרכבה</span>
            <span className="cart-summary-value cart-summary-value-ember">{freeShip ? 'חינם' : formatPrice(shipping)}</span>
          </div>
          <div className="cart-summary-divider" />
          <div className="cart-summary-row cart-summary-total-row">
            <span>סה״כ לתשלום</span>
            <span className="cart-summary-total">{formatPrice(total)}</span>
          </div>
          <button type="button" className="btn btn-primary btn-lg btn-raised btn-block" onClick={handlePlaceOrder}>
            לתשלום מאובטח
          </button>
          <div className="cart-secure-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span>תשלום מאובטח · Visa · Mastercard · Bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
