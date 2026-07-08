import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useBrands, useCategories, useProducts } from '../hooks/useCatalog.js';
import { filterProducts, sortProducts } from '../lib/catalogQueries.js';
import ProductCard from '../components/ProductCard.jsx';
import './Shop.css';

const PRICE_OPTIONS = [
  { v: '', label: 'כל המחירים' },
  { v: 'under_1000', label: 'עד ₪1,000' },
  { v: '1000_2500', label: '₪1,000 – ₪2,500' },
  { v: 'over_2500', label: 'מעל ₪2,500' },
];

const SORT_OPTIONS = [
  { v: '', label: 'מיון: מומלץ' },
  { v: 'price_asc', label: 'מחיר: מהנמוך לגבוה' },
  { v: 'price_desc', label: 'מחיר: מהגבוה לנמוך' },
];

// Debounce delay matches catalog.js's own free-text-search debounce (350ms).
const SEARCH_DEBOUNCE_MS = 350;

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const price = searchParams.get('price') || '';
  const sort = searchParams.get('sort') || '';
  const q = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(q);

  // Keep the input in sync if the URL changes from elsewhere (back/forward,
  // "ניקוי סינון", a category chip that also happens to run while typing).
  useEffect(() => {
    setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === q) return undefined;
    const timer = setTimeout(() => updateParams({ q: trimmed }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setSearchParams(next, { replace: true });
  }

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: products, loading, error } = useProducts(q);

  const filtered = useMemo(() => {
    if (!products) return [];
    return sortProducts(filterProducts(products, { category, brand, price }), sort);
  }, [products, category, brand, price, sort]);

  const hasFilters = !!(q || category || brand || price || sort);

  function clearFilters() {
    setSearchInput('');
    setSearchParams({}, { replace: true });
  }

  return (
    <div className="container shop-page">
      <h1 className="shop-title">החנות</h1>
      <p className="shop-subtitle">כל הגרילים, המעשנות והאביזרים במקום אחד</p>

      <div className="shop-chips">
        <button type="button" className={'chip' + (category === '' ? ' is-selected' : '')} onClick={() => updateParams({ category: '' })}>
          הכל
        </button>
        {(categories || []).map((c) => (
          <button
            key={c.id}
            type="button"
            className={'chip' + (category === c.slug ? ' is-selected' : '')}
            onClick={() => updateParams({ category: c.slug })}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="shop-toolbar">
        <div className="shop-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="חיפוש דגם — למשל Professional, Kettle..."
          />
        </div>
        <select value={brand} onChange={(e) => updateParams({ brand: e.target.value })} className="shop-select">
          <option value="">כל היצרנים</option>
          {(brands || []).map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={price} onChange={(e) => updateParams({ price: e.target.value })} className="shop-select">
          {PRICE_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.label}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className="shop-select">
          {SORT_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="shop-result-row">
        <span className="shop-result-count">{filtered.length} מוצרים</span>
        {hasFilters && (
          <button type="button" className="btn btn-tertiary" onClick={clearFilters}>
            ניקוי סינון
          </button>
        )}
      </div>

      {loading && <p className="shop-status">טוען מוצרים...</p>}
      {!loading && error && (
        <p className="shop-status shop-status-error">
          שגיאה בטעינת הקטלוג. ודאו שהשרת המקומי פעיל ונסו שוב, או <Link to="/contact">צרו קשר</Link>.
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="shop-status">לא נמצאו מוצרים התואמים לסינון הנוכחי.</p>
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="shop-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
