import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import './Header.css';

// Copy note (flagged, not fixed here -- Marketing's call per
// redesign-architecture-plan.md §7): the design's header sub-label reads
// "יבואן מורשה Char-Broil" ("authorized Char-Broil importer"). The brand
// lock is Char-Broil + Napoleon, so this line may need Marketing's
// correction -- left as-authored from the design handoff, per the plan's
// explicit instruction to route this copy question to Marketing rather than
// Dev silently rewriting brand-facing copy.
const SUB_LABEL = 'יבואן מורשה Char-Broil';

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 'header-nav-link' + (isActive ? ' is-active' : '')}
      end={to === '/'}
      onClick={onClick}
    >
      {children}
    </NavLink>
  );
}

export default function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Close the mobile nav whenever the route changes (e.g. a link inside it
  // was activated) so it never stays open over the next page.
  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  const closeNav = () => setIsNavOpen(false);

  return (
    <header className="site-header">
      <div className="header-announcement">
        משלוח חינם בהזמנה מעל ₪1,000 · שירות והרכבה עד הבית
      </div>
      <div className="header-main container">
        <NavLink to="/" className="header-logo" aria-label="מנגליסט - לעמוד הבית">
          <span className="header-logo-mark">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 14.5h14M6 17.5h12" />
              <path d="M5 14.5c0 3 3.1 5 7 5s7-2 7-5" />
              <path stroke="var(--amber)" d="M12 4c1.2 2 .6 3-.3 4.1-.8 1-1.6 2-1.6 3.2a1.9 1.9 0 0 0 3.8 0c0-.8-.3-1.5-.8-2.2" />
            </svg>
          </span>
          <span className="header-logo-text">
            <span className="header-wordmark">מנגליסט</span>
            <span className="header-sublabel">{SUB_LABEL}</span>
          </span>
        </NavLink>

        <button
          type="button"
          className={'header-nav-toggle' + (isNavOpen ? ' is-open' : '')}
          aria-label={isNavOpen ? 'סגירת ניווט' : 'פתיחת ניווט'}
          aria-expanded={isNavOpen}
          aria-controls="header-nav"
          onClick={() => setIsNavOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav id="header-nav" className={'header-nav' + (isNavOpen ? ' is-open' : '')}>
          <NavItem to="/" onClick={closeNav}>בית</NavItem>
          <NavItem to="/shop" onClick={closeNav}>החנות</NavItem>
          <NavItem to="/about" onClick={closeNav}>הסיפור שלנו</NavItem>
          <NavItem to="/contact" onClick={closeNav}>צור קשר</NavItem>
        </nav>

        <div className="header-actions">
          <button type="button" className="header-cart-btn" onClick={() => navigate('/cart')} aria-label="סל הקניות">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="20" r="1.3" />
              <circle cx="18" cy="20" r="1.3" />
              <path d="M2.5 3.5h2.4l2.1 11.6a1.4 1.4 0 0 0 1.4 1.15h8.4a1.4 1.4 0 0 0 1.4-1.1L20.5 7.2H5.3" />
            </svg>
            {count > 0 && <span className="header-cart-badge">{count}</span>}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/shop')}>
            לקנייה
          </button>
        </div>
      </div>
    </header>
  );
}
