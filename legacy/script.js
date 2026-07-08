const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

// Real backend wiring (replaces the old client-side-only stub): inserts a row
// into the `leads` table of the local self-hosted Supabase instance. The
// public anon key is safe to use here by design -- Postgres RLS on `leads`
// (see supabase-local/supabase/migrations/) allows public INSERT only, no
// public SELECT/UPDATE/DELETE, so this key can never be used to read or
// tamper with other people's submissions.
const supabaseClient =
  window.supabase && window.SUPABASE_CONFIG
    ? window.supabase.createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey)
    : null;

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!supabaseClient) {
    status.textContent = 'שגיאה: לא ניתן להתחבר לשרת כרגע. נסו שוב מאוחר יותר.';
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  const { error } = await supabaseClient.from('leads').insert({
    name: form.name.value,
    email: form.email.value,
    message: form.message.value,
  });

  submitButton.disabled = false;

  if (error) {
    console.error('Lead submit failed:', error);
    status.textContent = 'משהו השתבש בשליחת הפנייה. אפשר לנסות שוב, או ליצור קשר בדרך אחרת.';
    return;
  }

  status.textContent = 'תודה על הפנייה! נחזור אליכם בהקדם.';
  form.reset();
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll reveal: fade-up elements marked `.reveal` as they enter the viewport.
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

// Note: Direction B ("Workshop Ledger") deliberately drops the magnetic-pull CTA
// hover effect used elsewhere — a button that glides toward the pointer reads as
// soft/lifestyle, whereas this direction's buttons should feel like a mechanical
// press (handled entirely in CSS via :active { transform: scale(0.97) }).
