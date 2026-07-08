import './ImagePlaceholder.css';

// Generic placeholder box for anywhere the design uses an <image-slot> with
// no real photography behind it yet (README: "Product images: <image-slot>
// placeholders -- supply real product photography ... replace with <img> in
// production"). No product/category photography exists in this slice, so
// every image area renders one of these instead of a broken <img> tag.
export default function ImagePlaceholder({ label, className = '' }) {
  return (
    <div className={'image-placeholder ' + className} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5-9 9" />
      </svg>
      {label && <span>{label}</span>}
    </div>
  );
}
