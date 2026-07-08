import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Contact.css';

const EMPTY_FORM = { fullName: '', phone: '', email: '', message: '' };

// Wired to the real `leads` table (supabase-local/supabase/migrations/
// 20260704173512_create_products_and_leads.sql), same pattern as the
// existing live site's script.js: `.insert({...})` with NO `.select()`
// chained. Chaining `.select()` after `.insert()` on `leads` fails with a
// permission error -- anon has insert-only access (no SELECT grant), and
// Postgres requires SELECT privilege to satisfy the `RETURNING` clause that
// `.select()` implies. Documented as a known landmine in ceo/qa.md's
// 2026-07-04 entry -- deliberately not hit here.
//
// Phone-number decision: `leads` already has a nullable `phone` column (see
// the migration) distinct from `name`/`email`/`message`, so this form's
// phone field maps directly to it -- no schema change or data-loss tradeoff
// needed here (the brief's "concatenate into message, or flag it" fallback
// wasn't necessary once the actual column list was checked).
export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!supabase) {
      setError('שגיאה: לא ניתן להתחבר לשרת כרגע. נסו שוב מאוחר יותר.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('leads').insert({
      name: form.fullName,
      phone: form.phone || null,
      email: form.email || null,
      message: form.message || null,
    });

    setSubmitting(false);

    if (insertError) {
      // eslint-disable-next-line no-console
      console.error('Lead submit failed:', insertError);
      setError('משהו השתבש בשליחת ההודעה. אפשר לנסות שוב, או ליצור קשר בדרך אחרת.');
      return;
    }

    setSent(true);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="container contact-page">
      <h1 className="contact-title">דברו איתנו</h1>
      <p className="contact-subtitle">שאלה על מוצר, ייעוץ לפני קנייה או תמיכה — אנחנו כאן.</p>

      <div className="contact-layout">
        <div className="contact-form-card">
          {sent ? (
            <div className="contact-success">
              <span className="contact-success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <h2 className="contact-success-title">ההודעה נשלחה</h2>
              <p className="contact-success-body">תודה! נחזור אליכם בהקדם, בדרך כלל תוך יום עסקים אחד.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <label className="contact-field">
                  <span>שם מלא</span>
                  <input value={form.fullName} onChange={handleChange('fullName')} placeholder="ישראל ישראלי" required />
                </label>
                <label className="contact-field">
                  <span>טלפון</span>
                  <input value={form.phone} onChange={handleChange('phone')} placeholder="050-0000000" />
                </label>
              </div>
              <label className="contact-field">
                <span>דוא״ל</span>
                <input type="email" value={form.email} onChange={handleChange('email')} placeholder="you@email.com" required />
              </label>
              <label className="contact-field">
                <span>במה נוכל לעזור?</span>
                <textarea value={form.message} onChange={handleChange('message')} placeholder="ספרו לנו קצת..." rows={4} required />
              </label>
              {error && <p className="contact-error">{error}</p>}
              <div>
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                  {submitting ? 'שולח...' : 'שליחת הודעה'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="contact-info-col">
          <InfoCard title="טלפון" value="03-555-0199" ltr icon={<PhoneIcon />} />
          <InfoCard title="דוא״ל" value="shalom@mangalist.co.il" ltr icon={<MailIcon />} />
          <InfoCard title="האולם שלנו" value="האומן 12, אזור התעשייה, ראשל״צ" icon={<PinIcon />} />
          <InfoCard title="שעות פעילות" value="א׳–ה׳ 09:00–19:00 · ו׳ 09:00–14:00" icon={<ClockIcon />} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value, icon, ltr }) {
  return (
    <div className="contact-info-card">
      <span className="contact-info-icon">{icon}</span>
      <div>
        <div className="contact-info-title">{title}</div>
        <div className="contact-info-value" dir={ltr ? 'ltr' : undefined}>
          {value}
        </div>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h2l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v2a2 2 0 0 1-2 2A16 16 0 0 1 4 5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
