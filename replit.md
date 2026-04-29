# Expert-Driven Development

## Overview
A static GitHub Pages site providing open-source AI-assisted development training for DoW personnel. The site contains training courses, an SOP, an interactive toolkit, tools, and downloadable templates.

## Project Type
Static HTML/CSS/JS site (originally hosted via GitHub Pages from the `docs/` directory).

## Project Structure
- `docs/` — site root (HTML pages, CSS, JS, PDFs, course materials)
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
