// Thin React hooks around lib/catalogQueries.js -- no data-fetching library
// (react-query etc.) added, per the architecture plan's dependency list;
// plain useState/useEffect is enough at this catalog's scale.

import { useEffect, useState } from 'react';
import { fetchBrands, fetchCategories, fetchHomeFeatured, fetchProductById, fetchProducts } from '../lib/catalogQueries';
import { supabase } from '../lib/supabaseClient';

function useAsync(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!supabase) {
      setState({ data: null, loading: false, error: new Error('Supabase client not configured') });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Catalog data fetch failed:', error);
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

export function useCategories() {
  return useAsync(fetchCategories, []);
}

export function useBrands() {
  return useAsync(fetchBrands, []);
}

export function useProducts(searchTerm) {
  return useAsync(() => fetchProducts(searchTerm), [searchTerm]);
}

// Home page "הנמכרים ביותר" rail: real curation (is_featured=true) with a
// graceful fallback to the first N published products -- see
// fetchHomeFeatured in catalogQueries.js.
export function useHomeFeatured(limit = 4) {
  return useAsync(() => fetchHomeFeatured(limit), [limit]);
}

// Product detail page (/product/:id). Resolves to `{ data: null }` (no
// error) for a missing/unpublished id -- ProductDetail.jsx renders its own
// not-found state when `data` is null and `loading` is false.
export function useProductById(id) {
  return useAsync(() => fetchProductById(id), [id]);
}
