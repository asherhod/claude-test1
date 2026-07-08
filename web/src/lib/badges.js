// Shared products.badge -> Hebrew label mapping. Factored out of
// ProductCard.jsx (per the CIO task brief for the Product-detail/Cart/
// About/Contact slice) so ProductDetail can reuse the exact same mapping
// instead of duplicating it. See the 20260706100000 DBA migration's column
// comment for the source of truth on valid `products.badge` codes.
export const BADGE_LABELS = {
  bestseller: 'הנמכר ביותר',
  new: 'חדש',
  classic: 'קלאסיקה',
};
