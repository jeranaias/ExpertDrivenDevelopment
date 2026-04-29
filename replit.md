# Expert-Driven Development

## Overview
A static GitHub Pages site providing open-source AI-assisted development training for DoW personnel. The site contains training courses, an SOP, an interactive toolkit, tools, and downloadable templates.

## Project Type
Static HTML/CSS/JS site (originally hosted via GitHub Pages from the `docs/` directory).

## Project Structure
- `docs/` — site root (HTML pages, CSS, JS, PDFs, course materials)
- `docs/decks/` — instructor-led weekly decks served from the static site (HTML slide decks for Microsoft Teams screen-share). All six decks now share a single canonical `css/deck.css` and `js/deck.js`. Each deck declares its own `<body class>` (`deck-body`, `w2-deck`, `w3-deck`, `w4-deck`, `w5-deck`, `w6-deck`) so per-week styles live side-by-side without conflict. Features keyboard/click nav, hash deep-linking, speaker-notes pane (`N`), fullscreen (`F`), print/PDF export (`P`, one slide per page + speaker notes), and 1920×1080 auto-scaling for Weeks 2/4 (Week 1 is viewport-relative; Week 3 sizes its `.deck` to `100svw/100svh`; Weeks 5/6 self-scale via CSS `aspect-ratio`).
  - `docs/decks/index.html` — landing page; cards link to all six decks plus a "Download as PDF" instruction block.
  - `docs/decks/css/deck.css` — single canonical stylesheet (Week 1 contract scoped to `body.deck-body`, Weeks 2/3/4 compat scoped per-week, universal chrome + print stylesheet at top/bottom).
  - `docs/decks/js/deck.js` — single canonical controller (keyboard nav, hash deep-linking, 1920×1080 auto-scaling for Weeks 2/4, fullscreen, speaker-notes toggle, `P` to print).
  - `docs/decks/week-1-ai-fluency.html` — Course 1 (AI Fluency Fundamentals), 51 slides.
  - `docs/decks/week-2-builder-orientation.html` — Course 2 (Builder Orientation), 28 slides, ~2-hour runtime (renamed from `week-2/index.html`).
  - `docs/decks/week-3-platform-training.html` — Course 3 (Platform Training), 32 slides, 4-hour runtime.
  - `docs/decks/week-4-advanced.html` — Course 4 (Advanced Workshop), 38 slides, 4-hour runtime.
  - `docs/decks/week-4-handouts.html` — Week 4 facilitator hand-out pack: chat-paste-ready blocks (frontier-map starter for Slide 10, AI-generated SOP QA drill for Slide 28, workflow playbook blank template for Slide 35) with copy buttons, slide-number pills, cue lines, and a print fallback. Linked from the Week 4 deck cover footer and the Course 4 instructor page.
  - `docs/decks/week-5-supervisor.html` — Course 5 (Supervisor Orientation), 28 slides; dual-mode (30-min briefing or extended joint session).
  - `docs/decks/week-6-fullstack.html` — Course 6 (Full-Stack AI-Assisted Development), 57 slides, 8-hour capstone.
  - `docs/decks/DESIGN.md` — shared design system, body-class scoping table, navigation contract, and PDF export instructions.
  - Each `docs/courses/<slug>.html` page links to its matching deck via "Open Week N Slide Deck."
- `pdf/` — top-level reference PDFs
- `templates/` — downloadable templates
- `serve.py` — local Python static file server used by the Replit workflow

## Replit Setup
- **Workflow:** "Start application" runs `python3 serve.py` on port 5000.
- `serve.py` serves the `docs/` directory on `0.0.0.0:5000` and disables HTTP caching for development so changes appear immediately in the proxied preview.
- **Deployment:** Configured as `static` with `publicDir = "docs"`.

## Notes
- No backend, database, or build step. Pure static files.
- The only request that 404s is `/favicon.ico`, which the upstream repo does not include.

## Weekly Decks (Microsoft Teams, 16:9)
Self-contained HTML slide decks that mirror the EDD visual identity (USMC Scarlet `#CC0000`, Gold `#F5D130`, warm gray, near-black) inline. Each deck supports keyboard nav (← →, Space, Home/End), `N` toggles a speaker-notes overlay, `F` fullscreen, `P` print (one slide per page), `?` for help. Speaker notes are layered with parallel `[BRIEFING]` / `[JOINT]` / `[TRANSITION]` tracks so the same deck supports both the tight 30-min briefing and the extended joint session.

- `docs/decks/week-5-supervisor.html` — Course 5 (Supervisor Orientation), 28 slides (cover, audience-shift framing, two delivery modes, agenda, core-message centerpiece, 5 module dividers + content, 3 decision exercises with paired debriefs, apprentice-problem centerpiece with Mollick quote + −35% / −13% / 5–10 yr stats, supervisor quick-reference 3×3 card, approved tools, links to `docs/pdf/EDD_Executive_Brief.pdf` and `docs/pdf/EDD_RAI_Compliance_Brief.pdf`, Week 6 preview, leadership-commitment close).
