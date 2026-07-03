# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A static landing page ("Acme Co." placeholder content) built with plain HTML/CSS/JS — no framework, no build step, no bundler. This is the user's first website project.

## Running locally

Node.js (LTS) is installed via winget, but is not on PATH for new shells — use the full path or prepend it manually:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
npx serve -l 5500
```

Site is then served at http://localhost:5500. Edits to `index.html`/`styles.css`/`script.js` are picked up on browser refresh — no restart needed.

## Structure

- `index.html` — all page markup/sections (nav, hero, features, testimonials, contact form, footer)
- `styles.css` — all styling; uses CSS custom properties defined in `:root` for colors/spacing, mobile nav breakpoint at 720px
- `script.js` — mobile nav toggle and contact form submit handler (currently just shows a status message client-side; no real backend/email sending is wired up)

## Notes

- Content is placeholder ("Acme Co.") — swap in real business name/copy when available.
- Contact form does not submit anywhere yet; it's a UI-only stub.
