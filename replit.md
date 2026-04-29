# Expert-Driven Development

## Overview
A static GitHub Pages site providing open-source AI-assisted development training for DoW personnel. The site contains training courses, an SOP, an interactive toolkit, tools, and downloadable templates.

## Project Type
Static HTML/CSS/JS site (originally hosted via GitHub Pages from the `docs/` directory).

## Project Structure
- `docs/` — site root (HTML pages, CSS, JS, PDFs, course materials)
- `docs/decks/` — instructor-led weekly decks served from the static site (HTML slide decks for Microsoft Teams screen-share).
  - `docs/decks/shared/deck.css` — shared deck visual identity (palette, layouts, speaker-notes pane, HUD)
  - `docs/decks/shared/deck.js` — shared deck controller (keyboard nav, hash deep-linking, 1920×1080 auto-scaling, fullscreen, speaker-notes toggle)
  - `docs/decks/week-1-ai-fluency.html` — Course 1 (AI Fluency Fundamentals) deck, 51 slides
  - `docs/decks/week-2-builder-orientation.html` — Course 2 (Builder Orientation) deck, 28 slides
  - `docs/decks/DESIGN.md` — shared design system and navigation contract documentation.
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
