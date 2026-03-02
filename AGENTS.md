# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static documentation website** (GitHub Pages) with no build tools, package managers, or backend services. The site is served from the `/docs` directory.

### Running locally

Serve the site with any static HTTP server pointed at `/docs`:

```
python3 -m http.server 8000 --directory docs
```

The site will be available at `http://localhost:8000/`.

### Architecture notes

- Pure HTML, CSS, and vanilla JavaScript — no transpilation or bundling step.
- Client-side JavaScript in `docs/js/` handles UI enhancements, course progress tracking (via `localStorage`), knowledge checks, and user identity.
- No linting, testing, or build commands exist in this repository. There are no `package.json`, `Makefile`, or CI scripts.
- The interactive **EDD Toolkit** (`/toolkit/`) uses JS for expandable prompt sections, copy-to-clipboard, sidebar navigation, and search.

### Content guidelines

All content must be **UNCLASSIFIED**. See `SECURITY.md` and `.github/CONTRIBUTING.md` for full rules.
