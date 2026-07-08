# Tidhar App — Design System

A design system for the **Tidhar (תדהר)** homeowner app. Tidhar is a leading
Israeli real-estate developer and construction company; this app is the
customer-facing product that accompanies apartment buyers through and after
handover — tracking construction faults ("פניות"/"תקלות"), scheduling
tradesperson visits, storing apartment documents, and surfacing the company's
flagship promise: **"10 שנות אחריות על הדירה שלכם"** (10 years of warranty on
your home).

The product is **Hebrew-first and fully right-to-left**, built for mobile
(360px design frame). This system captures its real visual language: two
brand greens over warm-neutral greys, fully-rounded pill buttons, generous
white cards, soft-tint status tags, and vertical progress timelines.

## Source of truth

- **Figma:** `Tidhar_app_Client.fig` (mounted). Key pages: `Design-system`
  (UI KIT + tokens), `App - UI Design` (the app screens), `Web - Meetings`,
  `Marketing`. Token values, component geometry and colors here are
  transcribed verbatim from that file's UI KIT frame and real components
  (Button, Tag, Checkbox, Chip sets).
- The Figma "UI KIT" frame lists the canonical brand color and type samples;
  its color names are partly mislabeled ("Yellow"→green, "Main blue"→teal),
  so this system uses corrected, descriptive token names.

---

## CONTENT FUNDAMENTALS

**Language & direction.** Everything is Hebrew, RTL. Numbers, dates
(DD.MM.YY) and file names stay LTR inside the RTL flow. Time ranges appear as
`16:00–12:00` (source ordering).

**Voice.** Warm, reassuring, plain-spoken and second-person plural — the app
speaks *to* the homeowner ("הדירה שלכם", "שלום, דנה"). Copy is short and
functional in the UI (button labels, status tags) and more emotive in
marketing moments (the warranty hero). It projects **responsibility,
craftsmanship and calm** — never salesy or exclamatory.

**Casing & punctuation.** Hebrew has no case. Headings and body use sentence
rhythm; the geresh/gershayim conventions are respected (`דוא״ל`, `וולץ׳`).
Buttons are verb-first ("עדכון סטטוס פנייה", "להורדת התקנון המלא").

**Emoji.** None. The brand does not use emoji in product UI.

**Examples (verbatim from the app):**
- Hero: *"לראשונה בישראל · 10 שנות אחריות על הדירה שלכם"*
- Section titles: *"פרטי התקלה"*, *"סטטוס התקדמות"*, *"תיאור התקלה"*
- Tags: *"דחוף"*, *"פנייה פתוחה"*, *"לביצוע עד 15/03"*, *"בוצע"*
- CTA: *"להורדת תקנון האחריות המלא"*

---

## VISUAL FOUNDATIONS

**Color.** Two greens carry the brand: a **deep forest green `#004434`** for
primary actions, links, chips and "done" states, and a **muted teal `#255454`**
for the logo, hero surfaces and secondary outlines. A **mid-green `#4A9462`**
is the everyday accent (timeline dots, progress fills). Everything else is a
warm-neutral grey ramp (`#F0F0F1` app background → `#FFFFFF` cards → `#000B15`
ink). Logo facets give the accent palette: amber `#FFB548`, coral `#E53E51`,
sky `#96B7E5`, gold `#F4B85D`.

**Type.** Primary face is **Almoni DL AAA** (commercial Hebrew sans), with
**Assistant** as a secondary UI face. Since Almoni isn't freely
distributable, the system substitutes **Assistant** (Google) everywhere — a
close geometric-humanist Hebrew/Latin match. Scale: 36 display → 24 H2 → 20
H3 → 18 title → 16 body → 14 label → 12 caption. Headings and controls are
**Bold (700)**; body is Regular. Line-height ~100% on buttons/tags, ~1.4 body.

**Backgrounds.** Flat colour — the app sits on `#F0F0F1`, content on white
cards. No gradients in UI (the only "rich" surface is the solid-teal hero
card). No photographic full-bleed backgrounds in the app; marketing uses
warm, natural photography (people, apartments, daylight).

**Cards.** White, **16px** radius (24px for hero/sheets), padded 20px, with a
**very soft** shadow (`0 4px 24px rgba(0,11,21,.06)`) — no borders. Cards
stack with a 20px gap down the feed.

**Buttons.** Fully-rounded **pills** (`radius 200`). Primary = solid green,
white bold label; secondary = white with a 2px inset green/teal outline;
tertiary = underlined green text. Sizes 33/40/48px. Focus = 2px black inset
ring; a `raised` variant adds `0 4px 8px rgba(0,0,0,.16)` for sticky CTAs.

**Tags/pills.** Soft-tint capsule (12% brand tint or pale solid) with
saturated text, fully rounded, 4×8 padding, optional 16px leading icon.

**Corners & shape.** Pills for interactive controls; 16–24px for containers;
4.8px for checkboxes; circles for avatars/icon buttons.

**Motion.** Understated. 150ms ease colour/shadow transitions on
hover/press; 300ms width ease on progress; no bounces or decorative loops.
Hover slightly darkens/tints; press uses a subtle scale (buttons) — the
product favours stillness and clarity over flourish.

**Borders & dividers.** Hairline `1px var(--border-subtle)` between list rows;
1–1.2px inset "borders" via box-shadow on inputs/checkboxes (so they don't
shift layout). Timeline connectors are 2px dashed grey.

**Elevation.** Only two real levels — resting card shadow and a raised
floating-button shadow. Bottom sheets use an upward shadow.

**Transparency/blur.** Sparingly — 12% brand tints for tag backgrounds; no
heavy glass/blur.

---

## ICONOGRAPHY

The app uses the **Vuesax "linear" icon set** (thin ~1.5px stroke, 24px grid,
rounded caps) — clock, tick-circle, arrows, chevrons, calendar, download,
bell, etc. It also uses a handful of custom line glyphs (building, key,
wrench). Icons are monochrome and inherit text colour (`currentColor`); the
active/brand state tints them green.

**In this system:** Vuesax is not on a public CDN, so the UI kit substitutes
hand-matched 24px line icons (`ui_kits/tidhar-app/icons.jsx`) at the same
weight and grid. For new work, the closest CDN substitute is **Iconsax** (the
open successor to Vuesax) or **Lucide/Feather** at ~1.5px stroke — flagged as
a substitution. No emoji, no filled icon families, no unicode-glyph icons.

The **logo** is an isometric building mark (green roof + amber/coral/sky
facets) on a teal rounded square, with the תדהר wordmark below. The version in
`assets/logo/tidhar-appicon.svg` is a **faithful recreation** — replace it
with the official exported asset for production.

---

## INDEX / MANIFEST

**Root**
- `styles.css` — global entry (imports only). Link this one file.
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill wrapper.

**tokens/** — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`,
`base.css` (curated API) + `fig-tokens.css` (raw Figma Variables, kept for
parity).

**components/** — reusable primitives:
- `actions/` — **Button**, **IconButton**
- `forms/` — **TextField**, **Checkbox**, **Radio**, **Switch**, **Chip**
- `display/` — **Card** / **CardHeader**, **Tag**, **Avatar**, **ListRow**,
  **SectionHeader** / **Divider**
- `feedback/` — **Timeline**, **ProgressBar**
- `navigation/` — **TopBar**, **NavBar**

**ui_kits/tidhar-app/** — interactive RTL home + fault-status recreation
(`index.html`, `screens.jsx`, `icons.jsx`).

**foundations/** — specimen cards (Colors, Type, Spacing, Brand).

**assets/logo/** — recreated app-icon logo.

## COVERAGE & SCOPE (intentional)

The source `.fig` reports **846 component families**; this system implements
**19 real primitives** and intentionally skips the rest. This is a scope
decision, not an omission:

- **Legacy / archive pages are excluded.** `Old` alone holds 491 frames;
  `Marketing`, `Web - Meetings`, `Moodboard`, `Video`, `Lottie-Animation` and
  `UX-Concept` add hundreds more experimental, one-off or superseded sets.
  These are not part of the shipping homeowner app.
- **The icon set is counted as ~1,900 "families"** (one per glyph). It is
  handled as an *icon system* (documented in ICONOGRAPHY + substituted line
  icons in the UI kit), not as ~1,900 components.
- **Duplicate/variant sets collapse.** The file has many near-identical
  "Button", "Card Task", "Container", "Crads Arcive" sets across pages; this
  system consolidates them into single, clean primitives.

**What IS built** = the primitives the live app is actually assembled from:
Button, IconButton, TextField, Checkbox, Radio, Switch, Chip, Card/CardHeader,
Tag, Avatar, ListRow, SectionHeader, Divider, Timeline, ProgressBar, TopBar,
NavBar, Tabs.

**Next batches** (see project todos): Skeleton, Dialog/Popup, Badge, CardTask,
CardsContainer, Story, Carousel, Bezel/StatusBar — built on request against the
real app surfaces the user prioritizes.
