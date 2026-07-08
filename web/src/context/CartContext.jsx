// CartContext -- cart line map + useReducer, persisted to localStorage.
// Per redesign-architecture-plan.md §6: "small, justified addition beyond
// the prototype's in-memory-only cart -- no new dependency, prevents losing
// the cart on a refresh".
//
// Cart line shape (fixed 2026-07-07, QA bug from the 2026-07-06 full-app
// pass): each line is keyed by a composite `productId::variantId` key and
// stores `{ productId, variantId, qty }`. Earlier this context stored a bare
// `{ productId: qty }` map, which meant the specific variant a customer
// selected on Product Detail was never recorded -- Cart.jsx had to fall back
// to displaying the product's *cheapest* variant price (`minPrice()`)
// instead of the one actually added. See ceo/qa.md "2026-07-06" entry for
// the full repro. Storage key bumped v1 -> v2 since the old flat map isn't
// compatible with this shape (local-only app, no migration needed -- see
// loadInitialCart's defensive filtering below for belt-and-braces safety
// against any stale v1-shaped data that might still be under the old key,
// or any malformed value under v2).

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'mangalist_cart_v2';

function lineKey(productId, variantId) {
  return `${productId}::${variantId}`;
}

function loadInitialCart() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== 'object') return {};
    // Defensive: only keep well-formed line entries. Guards against any
    // malformed/legacy data under this key rather than crashing the app.
    const clean = {};
    Object.entries(parsed).forEach(([key, line]) => {
      if (
        line &&
        typeof line === 'object' &&
        typeof line.productId === 'string' &&
        typeof line.variantId === 'string' &&
        typeof line.qty === 'number' &&
        line.qty > 0
      ) {
        clean[key] = { productId: line.productId, variantId: line.variantId, qty: line.qty };
      }
    });
    return clean;
  } catch {
    return {};
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const key = lineKey(action.productId, action.variantId);
      const qty = action.qty || 1;
      const existingQty = state[key] ? state[key].qty : 0;
      return {
        ...state,
        [key]: { productId: action.productId, variantId: action.variantId, qty: existingQty + qty },
      };
    }
    case 'DEC': {
      const existing = state[action.key];
      if (!existing) return state;
      const next = { ...state };
      const q = existing.qty - 1;
      if (q <= 0) delete next[action.key];
      else next[action.key] = { ...existing, qty: q };
      return next;
    }
    case 'REMOVE': {
      if (!(action.key in state)) return state;
      const next = { ...state };
      delete next[action.key];
      return next;
    }
    case 'CLEAR':
      return {};
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // localStorage unavailable (e.g. private browsing) -- cart still works in-memory for this session.
    }
  }, [cart]);

  const value = useMemo(() => {
    const count = Object.values(cart).reduce((sum, line) => sum + line.qty, 0);
    return {
      cart,
      count,
      // add: records which *variant* of a product was added, not just the
      // product -- required so Cart.jsx can show that variant's real price.
      add: (productId, variantId, qty = 1) => dispatch({ type: 'ADD', productId, variantId, qty }),
      // dec/remove operate on a line's composite key (see lineKey above),
      // not a bare product id, since a product can now have more than one
      // active cart line (one per variant added).
      dec: (key) => dispatch({ type: 'DEC', key }),
      remove: (key) => dispatch({ type: 'REMOVE', key }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
