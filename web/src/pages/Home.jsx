import { Link, useNavigate } from 'react-router-dom';
import { useCategories, useHomeFeatured } from '../hooks/useCatalog.js';
import ProductCard from '../components/ProductCard.jsx';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import './Home.css';

// Display-only labels for known category slugs (README §Home "5 clickable
// image tiles"). The set of TILES rendered is fully data-driven from the
// live `categories` table (per CIO task brief) -- this map only supplies a
// nicer caption for slugs we recognize; unknown/future categories still
// render correctly with just their real `name` and no caption.
const CATEGORY_NOTES = {
  'gas-grills': 'הצתה מיידית',
  'charcoal-grills': 'הטעם הקלאסי',
  smokers: 'לואו אנד סלואו',
  'portable-grills': 'לשטח ולמרפסת',
  accessories: 'כל התוספות',
};

export default function Home() {
  const navigate = useNavigate();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: featured, loading: featuredLoading } = useHomeFeatured(4);

  return (
    <div>
      {/* HERO (split variant, per README §Home) */}
      <section className="container home-hero-wrap">
        <div className="home-hero">
          <div className="home-hero-text">
            <span className="home-hero-pill">משלוח חינם מעל ₪1,000</span>
            <h1 className="home-hero-headline">
              אֵשׁ אמיתית.
              <br />
              טעם בלתי נשכח.
            </h1>
            <p className="home-hero-body">
              גרילי הגז, המנגלים והמעשנות של Char-Broil האמריקאית — עם טכנולוגיית TRU-Infrared™, הרכבה עד הבית ואחריות
              יבואן רשמי.
            </p>
            <div className="home-hero-actions">
              <button type="button" className="btn btn-primary btn-lg btn-raised" onClick={() => navigate('/shop')}>
                לצפייה בגרילים
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/about')}>
                הסיפור שלנו
              </button>
            </div>
          </div>
          <div className="home-hero-media">
            <ImagePlaceholder label="גררו לכאן תמונת גריל ראשית" />
          </div>
        </div>
      </section>

      {/* TRUST BAR -- generic marketing content, not data-driven */}
      <section className="container home-trust-wrap">
        <div className="home-trust-grid">
          <TrustItem title="משלוח חינם" caption="בהזמנה מעל ₪1,000" icon={<TruckIcon />} />
          <TrustItem title="עד 25 שנות אחריות" caption="על מבערי סדרת Professional" icon={<ShieldIcon />} />
          <TrustItem title="החזרה תוך 30 יום" caption="בלי שאלות מיותרות" icon={<RefreshIcon />} />
          <TrustItem title="ייעוץ מקצועי" caption="צוות שמבין באש" icon={<HeadsetIcon />} />
        </div>
      </section>

      {/* CATEGORIES -- data-driven from the live `categories` table */}
      <section className="container home-section">
        <div className="home-section-head">
          <div>
            <h2 className="home-section-title">קונים לפי קטגוריה</h2>
            <p className="home-section-subtitle">מצאו את הגריל שמתאים בדיוק לחצר שלכם</p>
          </div>
        </div>
        {!categoriesLoading && (!categories || categories.length === 0) ? (
          <p className="home-empty-note">קטגוריות יתווספו בקרוב.</p>
        ) : (
          <div className="home-categories-grid">
            {(categories || []).map((c) => (
              <div key={c.id} className="home-category-tile" onClick={() => navigate(`/shop?category=${encodeURIComponent(c.slug)}`)}>
                <div className="home-category-image">
                  <ImagePlaceholder label="תמונה" />
                </div>
                <div className="home-category-body">
                  <span className="home-category-label">{c.name}</span>
                  {CATEGORY_NOTES[c.slug] && <span className="home-category-note">{CATEGORY_NOTES[c.slug]}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED -- curated is_featured=true rail, falling back to "first N
          published products" until a row is flagged featured (see
          fetchHomeFeatured in lib/catalogQueries.js) */}
      <section className="container home-section">
        <div className="home-section-head">
          <div>
            <h2 className="home-section-title">הנמכרים ביותר</h2>
            <p className="home-section-subtitle">מה שהחצרות בישראל הכי אוהבות</p>
          </div>
          <Link to="/shop" className="home-section-link">
            לכל המוצרים ←
          </Link>
        </div>
        {!featuredLoading && (!featured || featured.length === 0) ? (
          <p className="home-empty-note">אין עדיין מוצרים זמינים להצגה.</p>
        ) : (
          <div className="home-featured-grid">
            {(featured || []).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* STORY STRIP -- static marketing content */}
      <section className="container home-section">
        <div className="home-story">
          <div className="home-story-text">
            <span className="home-story-eyebrow">מאז 2009</span>
            <h2 className="home-story-headline">
              אנחנו לא מוכרים גרילים.
              <br />
              אנחנו מוכרים ערבים שנזכרים.
            </h2>
            <p className="home-story-body">
              כל מוצר נבחר, נבדק ומורכב על ידי אנשים שבאמת מבינים באש. אנחנו כאן גם אחרי הקנייה — עם חלפים, ייעוץ
              ותמיכה.
            </p>
            <div className="home-story-cta">
              <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/about')}>
                קראו עלינו
              </button>
            </div>
          </div>
          <div className="home-story-stats">
            <StatTile value="15" label="שנות ניסיון" />
            <StatTile value="40K+" label="לקוחות מרוצים" />
            <StatTile value="4.9" label="דירוג ממוצע" />
            <StatTile value="48ש׳" label="משלוח מהיר" />
          </div>
        </div>
      </section>

      {/* NEWSLETTER -- UI-only, no backend (per CIO task brief) */}
      <section className="container home-section">
        <div className="home-newsletter">
          <div className="home-newsletter-text">
            <h2>מתכונים, טיפים והטבות</h2>
            <p>הצטרפו לרשימה וקבלו 10% הנחה על ההזמנה הראשונה.</p>
          </div>
          <form
            className="home-newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input type="email" placeholder="כתובת הדוא״ל שלכם" required />
            <button type="submit" className="btn btn-primary btn-lg">
              הרשמה
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function TrustItem({ title, caption, icon }) {
  return (
    <div className="home-trust-item">
      <span className="home-trust-icon">{icon}</span>
      <div>
        <span className="home-trust-title">{title}</span>
        <span className="home-trust-caption">{caption}</span>
      </div>
    </div>
  );
}

function StatTile({ value, label }) {
  return (
    <div className="home-stat-tile">
      <div className="home-stat-value">{value}</div>
      <div className="home-stat-label">{label}</div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h13v11H1z" />
      <path d="M14 7h4l3 3v4h-7z" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 0z" />
      <path d="M20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 0z" />
    </svg>
  );
}
