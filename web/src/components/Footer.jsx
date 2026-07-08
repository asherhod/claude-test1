import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-cols container">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 14.5h14M6 17.5h12" />
                <path d="M5 14.5c0 3 3.1 5 7 5s7-2 7-5" />
                <path stroke="var(--amber)" d="M12 4c1.2 2 .6 3-.3 4.1-.8 1-1.6 2-1.6 3.2a1.9 1.9 0 0 0 3.8 0" />
              </svg>
            </span>
            <span className="footer-wordmark">מנגליסט</span>
          </div>
          <p className="footer-blurb">
            גרילים, מעשנות ואביזרים לחצר. משנת 2009 אנחנו מדליקים את האש למאות אלפי בתים בישראל.
          </p>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">חנות</span>
          <Link to="/shop">כל המוצרים</Link>
          <Link to="/shop?category=gas-grills">גרילי גז</Link>
          <Link to="/shop">מעשנות</Link>
          <Link to="/shop">אביזרים</Link>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">מידע</span>
          <Link to="/about">הסיפור שלנו</Link>
          <Link to="/contact">צור קשר</Link>
          <span>משלוחים והחזרות</span>
          <span>אחריות</span>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">נשמח לעזור</span>
          <span>טלפון · 03-5550199</span>
          <span>דוא״ל · shalom@mangalist.co.il</span>
          <span>א׳–ה׳ · 09:00–19:00</span>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner container">
          <span>© {year} מנגליסט גרילים בע״מ · כל הזכויות שמורות</span>
          <span>Visa · Mastercard · PayPal · Bit</span>
        </div>
      </div>
    </footer>
  );
}
