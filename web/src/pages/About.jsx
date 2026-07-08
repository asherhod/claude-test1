import { useNavigate } from 'react-router-dom';
import ImagePlaceholder from '../components/ImagePlaceholder.jsx';
import './About.css';

// Static copy/layout per README "About (הסיפור שלנו)" + the prototype's
// isAbout block -- no Supabase wiring needed (per CIO task brief). Copy here
// is generic company-story content, not brand-specific, so no Char-Broil/
// Napoleon-only correction is needed (see the brief's copy note); if any
// Weber/Broil-King mention were spotted it would be flagged to Marketing
// rather than reworded here -- none was found in this section's source copy.
export default function About() {
  const navigate = useNavigate();

  return (
    <div>
      <section className="container about-hero-wrap">
        <div className="about-hero">
          <div className="about-hero-text">
            <span className="about-hero-eyebrow">הסיפור שלנו</span>
            <h1 className="about-hero-headline">
              התחלנו ממנגל אחד
              <br />
              בחצר האחורית
            </h1>
            <p className="about-hero-body">
              ב-2009 פתחנו חנות קטנה עם חלום גדול: שכל משפחה בישראל תוכל לצלות כמו מקצוענים. היום אנחנו הבית של עשרות
              אלפי חובבי אש.
            </p>
          </div>
          <div className="about-hero-media">
            <ImagePlaceholder label="תמונת החנות / הצוות" />
          </div>
        </div>
      </section>

      <section className="container about-values-wrap">
        <h2 className="about-values-title">מה שמנחה אותנו</h2>
        <div className="about-values-grid">
          <ValueCard
            title="רק ציוד שנבדק"
            body="כל מוצר עובר אצלנו מבחן אש אמיתי לפני שהוא מגיע אליכם. אם לא צלינו עליו — לא נמכור אותו."
            icon={<FlameIcon />}
          />
          <ValueCard
            title="כאן גם אחרי הקנייה"
            body="חלפים, ייעוץ ותמיכה טכנית לאורך כל חיי המוצר — כי גריל טוב מלווה אתכם שנים."
            icon={<ShieldIcon />}
          />
          <ValueCard
            title="אנשים שמבינים"
            body="הצוות שלנו הם צלייני בשר אמיתיים. תשאלו אותנו הכול — משליטה בחום ועד בחירת פחם."
            icon={<HeadsetIcon />}
          />
        </div>
      </section>

      <section className="container about-cta-wrap">
        <div className="about-cta">
          <div className="about-cta-text">
            <h2>מוכנים להדליק את האש?</h2>
            <p>גלו את מבחר הגרילים, המעשנות והאביזרים שלנו.</p>
          </div>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/shop')}>
            למעבר לחנות
          </button>
        </div>
      </section>
    </div>
  );
}

function ValueCard({ title, body, icon }) {
  return (
    <div className="about-value-card">
      <span className="about-value-icon">{icon}</span>
      <h3 className="about-value-title">{title}</h3>
      <p className="about-value-body">{body}</p>
    </div>
  );
}

function FlameIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13a4 4 0 1 0 8 0c0-3-2-5-4-8-2 3-4 5-4 8Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M7 13v5H6a2 2 0 0 1-2-2v-3zM17 13v5h1a2 2 0 0 0 2-2v-3z" />
    </svg>
  );
}
