# Handoff: Mangalist (מנגליסט) — BBQ E-commerce Website

## Overview
A complete Hebrew, fully right-to-left e-commerce website for **מנגליסט**, an Israeli retailer of BBQ grills, smokers and accessories (authorized Char-Broil and Napoleon dealer). The design covers the entire shopping journey: homepage, product listing with filters, product detail, cart + checkout, about, and contact.

## About the Design Files
The files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, **not production code to copy directly**. Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, Next.js, etc.) using its established patterns and libraries. If no environment exists yet, choose an appropriate modern stack (e.g. Next.js + React) and implement the designs there.

The two `.dc.html` files contain the full markup (inline styles) and a `<script data-dc-script>` block at the bottom containing all business logic, product data, and state handling — read both.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows and copy are final. Recreate pixel-perfectly. All copy is Hebrew; the entire UI must render `dir="rtl"`.

## Design Tokens ("Fire & Heat" theme)
Base system: Tidhar App Design System (warm-neutral greys + soft cards), with brand tokens re-pointed to ember/flame tones.

Colors:
- Primary action / links / footer / badges: `#A62B12` (deep ember)
- Deep text on warm tint: `#7C1E0B`
- Hero + logo surface: `#571F10` (burnt umber)
- Mid accent: `#E2691F` (flame orange); soft accent `#E8853B`; pale warm fill `#FBEAE0`
- Success/soft tint backgrounds: `rgba(226,105,31,0.14)`
- Accents: amber `#FFB548`, gold `#F4B85D`, coral `#E53E51` (cart badge), sky `#96B7E5`
- Ink `#000B15`; secondary text `#525862`; tertiary `#717171`; borders `#D1D5DB`; hairline `#EBEBEB`; app background `#F0F0F1`; section fill `#F5F5F5`/`#F7F7F7`; cards `#FFFFFF`

Typography — family: "Assistant" (Google Fonts, Hebrew), weights 400/500/700/800:
- Hero headline 50–56px/1.06 weight 800 · page titles 36px · section titles 30px · card titles 17px/1.28 bold · body 15–18px/1.4–1.65 · labels 13–14px · captions 11–12px

Spacing: 4px base scale (4/8/12/16/20/24/32/40). Content max-width 1200px, 24px page gutters.

Radii: cards 16px; hero/sheets 24px; inputs 8px; inner tiles 12px; buttons/chips/tags fully-rounded pills (200px); circles for icon buttons.

Shadows: resting card `0 4px 24px rgba(0,11,21,.06)`; raised CTA `0 4px 8px rgba(0,0,0,.16)`; card hover `0 14px 34px rgba(0,11,21,.11)` + `translateY(-3px)`.

Motion: understated — 150ms ease color/shadow transitions; no bounces.

## Screens / Views
Single-page app with 6 views switched in state (`view`: home | shop | product | cart | about | contact). Shared sticky header + footer.

### Shared header (sticky, white, hairline bottom)
- Announcement bar: full-width ember `#A62B12`, white bold 13px, centered: "משלוח חינם בהזמנה מעל ₪1,000 · שירות והרכבה עד הבית"
- Logo (right, RTL start): 42px circle `#571F10` containing white 1.6px-stroke half grill-grate with amber flame rising above (SVG in source); wordmark "מנגליסט" 22px/800 + sub-label "יבואן מורשה Char-Broil" 11px tertiary
- Center nav: בית / החנות / הסיפור שלנו / צור קשר — bold 16px, active = ember
- Left: cart icon button (42px grey-75 circle) with coral count badge; primary pill button "לקנייה"

### Home
1. **Hero (variant "split", default)**: burnt-umber `#571F10` 24px-radius card, grid 1.02fr/.98fr, min-height 460px. Right column: white-on-14%-white amber pill "משלוח חינם מעל ₪1,000"; headline 50px/800 white "אֵשׁ אמיתית.\nטעם בלתי נשכח."; body 18px rgba(255,255,255,.82) mentioning Char-Broil TRU-Infrared™; buttons: primary pill (raised) "לצפייה בגרילים" + white secondary pill "הסיפור שלנו". Left column: full-bleed product photo. (Alternate "centered" variant exists in source.)
2. **Trust bar**: 4 white cards in a row — free shipping / up-to-25-year burner warranty / 30-day returns / expert advice; each 44px warm-tint circle icon + bold 15px title + 13px caption.
3. **Categories**: heading "קונים לפי קטגוריה" + 5 clickable image tiles (גז, פחמים, מעשנות, ניידים, אביזרים) → open shop filtered.
4. **Featured**: heading "הנמכרים ביותר" + link "לכל המוצרים ←" + 4 product cards.
5. **Story strip**: ember `#A62B12` 24px card: amber eyebrow "מאז 2009", white 34px headline, body, secondary button; left side 2×2 stat tiles (rgba(255,255,255,.08)): 15 שנות ניסיון / 40K+ לקוחות / 4.9 דירוג / 48ש׳ משלוח (amber 34px numerals).
6. **Newsletter**: white 24px card — heading, 10%-discount body, inline email input + "הרשמה" pill.

### Shop (החנות)
- H1 + subtitle; category filter chips (selected = solid ember pill, unselected = white outlined pill, 30px tall)
- Filter toolbar (white card): model search input with magnifier icon (placeholder "חיפוש דגם — למשל Professional, Kettle..."), vendor select (כל היצרנים / Char-Broil / Weber / Napoleon), price-range select (עד ₪1,000 / ₪1,000–₪2,500 / מעל ₪2,500), sort select (מומלץ / price asc / desc). 44px controls, 8px radius, 1px inset border.
- Result count ("N מוצרים") + tertiary underlined "ניקוי סינון" when any filter active
- Product grid: 4 columns, 20px gap

### Product card (reusable component — see ProductCard.dc.html)
White 16px-radius card, hover lift. 4:3 image area (grey-75 placeholder) with optional ember badge pill top-start (e.g. "הנמכר ביותר", "חדש", "קלאסיקה"). Body: vendor·category caption 12px, title 17px bold (min-height 44px, clickable), price 21px/800 ember, full-width small pill button "הוספה לסל" with cart icon.

### Product detail
Back link "חזרה לחנות" (chevron). Two columns: left — square main image (24px radius card) + 3 square gallery thumbs; right — white 24px card: vendor·category + badge tag, name 32px/800, price 30px ember, description 16px/1.65, spec table (label/value rows with hairlines), quantity stepper (pill track, 38px circle +/− buttons), large raised primary button "הוספה לסל · ₪total", warm-tint note strip with shield icon (shipping/assembly/warranty).

### Cart + checkout (סל הקניות)
- Empty state: centered white card, grey cart icon, "הסל שלכם ריק", CTA "מעבר לחנות"
- Full: grid 1.5fr/1fr. Left: line items (84px thumb, name, unit price, qty stepper, line total, trash icon; hairline dividers) + shipping form card (שם מלא/טלפון/דוא״ל/עיר + full-width כתובת; 48px inputs, label above)
- Right (sticky): order summary — subtotal, shipping ("חינם" in ember when subtotal ≥ ₪1,000, else ₪49), total 26px/800 ember, raised primary "לתשלום מאובטח", lock icon + "תשלום מאובטח · Visa · Mastercard · Bit"
- Order success: centered card, warm-tint check circle, "ההזמנה התקבלה!", CTA "להמשך קנייה"

### About (הסיפור שלנו)
Burnt-umber hero card (text + photo), 3 value cards (icon circle + title + body), ember CTA band "מוכנים להדליק את האש?" with secondary button.

### Contact (דברו איתנו)
Grid 1.3fr/1fr: form card (name/phone, email, multiline message, "שליחת הודעה"; success state with check) + 4 info cards (phone 03-555-0199, email shalom@mangalist.co.il, showroom address, hours; LTR direction for phone/email).

### Footer
Ember `#A62B12`, white text. 4 columns: brand (logo + blurb), חנות links, מידע links, contact info. Bottom bar: "© 2026 מנגליסט גרילים בע״מ" + payment methods. Link color rgba(255,255,255,.72).

## Interactions & Behavior
- View switching scrolls to top; active nav link tinted ember
- Add to cart from card (+1) or detail (selected qty, then navigates to cart); cart badge shows total quantity
- Cart: +/− steppers (removing at 0), trash removes line; totals and free-shipping threshold (₪1,000) recompute live
- Shop filters compose: category ∧ vendor ∧ price range ∧ text search (name substring, case-insensitive), then sort; "ניקוי סינון" resets all
- Checkout "לתשלום מאובטח" → clears cart, shows success (wire to real payment later)
- Contact submit → success message
- Card hover: lift + stronger shadow (150ms)

## State Management
`view`, `cart` (map id→qty), `sel` (selected product id), `qty` (detail stepper), `filter` (category), `q` / `vendor` / `priceR` / `sort` (shop toolbar), `orderDone`, `contactSent`, `form` (name/phone/email/address/city/msg). Product catalog is a static array of 17 items in the script block of `Mangalist Store.dc.html` — each: id, vendor, name, cat, price (ILS), badge, desc, specs[[k,v]…]. Prices reflect real Israeli market ranges; verify before launch.

## Assets
- Logo: inline SVG (grill grate + amber flame in a `#571F10` circle) — in both HTML files
- Icons: inline SVG line icons, 24px grid, ~1.6px stroke, round caps (cart, search, flame, shield, truck, trash, +/−, chevron, phone, mail, pin, clock, lock). Closest library: Iconsax or Lucide at 1.5px stroke.
- Product images: `<image-slot>` placeholders — supply real product photography (white/neutral background, 4:3 for cards, square for detail)
- Font: Assistant — https://fonts.google.com/specimen/Assistant (loaded via `_ds/.../tokens/fonts.css`)

## Files
- `Mangalist Store.dc.html` — the full site (all 6 views, header/footer, logic + product data in the bottom script block)
- `ProductCard.dc.html` — reusable product card component
- `image-slot.js` — image placeholder web component (design-time only; replace with `<img>` in production)
- `_ds/…` — design-system token CSS (colors/typography/spacing/base) and component bundle the prototypes load. The fire-theme overrides live in each HTML file's `<style>` block and supersede the green brand tokens in `colors.css`.

Open `Mangalist Store.dc.html` in a browser (serve the folder, e.g. `npx serve`) to explore the working prototype.
