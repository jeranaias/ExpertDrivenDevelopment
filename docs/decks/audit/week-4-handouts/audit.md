# Week 4 Hand-Outs Audit — `docs/decks/week-4-handouts.html`

**Page audited:** Single-page facilitator hand-out with four chat-paste blocks (frontier-map starter, SOP QA-drill excerpt, teach-back template, workflow-playbook template) plus a facilitator-only QA answer key.
**Audit artefacts:** `print.pdf` (full 5-page print render), `print-page-1.jpg`, `print-page-3.jpg` (representative pages — full set in `.local/audit/wk4-handouts/`).

## Scope verification

All CSS and JS changes that override default behaviour are gated to `body.wk4-handouts`. That body class is exclusive to this page — verified by ripgrep:

```
$ rg -l 'wk4-handouts' docs/
docs/decks/week-4-handouts.html
```

This is the only hand-outs page in the deck set (`week-1-ai-fluency.html`, `week-2-builder-orientation.html`, `week-3-platform-training.html`, `week-4-advanced.html`, `week-5-supervisor.html`, `week-6-fullstack.html` are all decks; only Week 4 ships a hand-outs companion). No cross-page regression possible.

All edits are inline in `docs/decks/week-4-handouts.html` (style block, body class, script block, and one HTML region). No shared CSS or JS modified.

## Findings & fixes

### 1. Print render: orphan blank pages and clipped tables (engine bug)

- **Before:** Headless print produced 12 pages. Three of them were near-empty: each `<pre class="copy-block__body">` had `break-inside: avoid` from the global stylesheet, and several blocks were just over a single page tall — so an entire page would be left blank to push the pre to the next page, with the block's header + cue stranded above the gap. The widest pre (`frontier-map`, ~130 chars) wrapped mid-row at ~80 chars under the global `white-space: pre-wrap`, breaking ASCII column alignment.
- **Cause:** Hand-outs blocks are tall vertical pre's; the global print rule keeping them atomic was designed for short snippets, not full templates.
- **Fix (CSS, scoped to `body.wk4-handouts`, `@media print`):**
  - `.copy-block__body` — `white-space: pre !important` (preserve column alignment), `font-size: 6.5pt`, `line-height: 1.45`, `padding: 0.5em 0.6em`, `page-break-inside: auto !important` (allow body to flow across pages).
  - `.copy-block__header` + `.copy-block__cue` — `break-after: avoid` (glue header/cue to body so they don't strand).
  - `@page { margin: 1.2cm }` — gives the 6.5pt mono table its required width with headroom.
  - Tightened `.page-header`, `.handout-intro`, `.breadcrumb` margins so block 1 starts higher on page 1.
- **After:** **5 pages**, no blank pages, all tables aligned, no right-edge clipping. Page break boundaries: end of frontier-map block / end of SOP block / start of teach-back template / mid-template / end of workflow-playbook block. See `print-page-1.jpg` (table now fits to 130 chars wide), `print-page-3.jpg` (answer key visible expanded; teach-back template starts cleanly under it).
- **Font sizing rationale:** 6.5pt mono ≈ 5.2 px advance. Frontier-map's widest line is 130 chars → 676 px. Letter-portrait minus 1.2cm margins = ~725 px usable, minus pre padding ≈ 718 px text area. ~40 px of headroom; nothing clipped.

### 2. Facilitator answer key not present in print (engine bug)

- **Before:** The QA-drill answer key sat inside a `<details>` element. When closed on screen, Chromium's shadow DOM hides the children — and headless `--print-to-pdf` does **not** reliably fire `beforeprint`, so a JS handler that flips `open` to true cannot rescue it for the printed copy. With `open` baked into the markup, the page's own load script would close it before headless capture. Result: page 3 of the print rendered an empty pink `<details>` shell with no answer key.
- **Fix (HTML + CSS + JS):** Replaced the `<details>` with a custom collapsible I fully control via CSS, so the print stylesheet can force-show it without depending on the JS event:
  - HTML: `<button class="answer-key__toggle" aria-controls="…" aria-expanded="false">` + `<aside class="callout callout--instructor answer-key__panel" hidden>`. ARIA + `hidden` attribute drive the state.
  - CSS (screen): toggle is a pill-style button using existing instructor-callout colours; rotating chevron icon when expanded; `:focus-visible` outline for keyboard users.
  - CSS (`@media print`, scoped to `body.wk4-handouts`): `.answer-key__toggle { display: none !important }` and `.answer-key__panel[hidden] { display: block !important }` — no JS required for print.
  - JS: a click handler on `.answer-key__toggle` toggles `aria-expanded`, `hidden`, and the button label ("Show…" ↔ "Hide…"). Removed the obsolete `<details data-default-closed>` close-on-load and `beforeprint`/`afterprint` open/restore handlers.
- **After:** Answer key collapsed by default on screen; expands on click with proper ARIA semantics; **always visible in print** regardless of screen state (verified in `print-page-3.jpg`).

### 3. Inaccurate intro copy

- **Before:** Print fallback intro promised the page prints in "one or two clean pages" — physically impossible given block content (~5 letter pages of templates).
- **Fix (HTML, copy):** Rewrote the second paragraph of the intro to truthfully describe the print behaviour: "this page prints clean — copy buttons and nav are hidden, the four copy-blocks each flow naturally across pages, and the QA-drill answer key auto-expands so it's on the printed copy."

### 4. Body class for engine-change scoping

- **Before:** Page body was `class="site-wrapper"`. Adding any print/screen overrides without a hook would risk affecting other pages that share the global stylesheet.
- **Fix (HTML):** Added `wk4-handouts` to the body class. All overrides above are written as `body.wk4-handouts ...` selectors. Verified the class appears nowhere else in `docs/`.

## Items checked and accepted as-is

- **Internal links:** "Back to Week 4 Slide Deck" → `week-4-advanced.html`, "Course 4 Instructor Page" → `../courses/advanced.html`, breadcrumb → `../`, `../courses/`, `../courses/advanced.html`. All resolve relative to `docs/decks/`. No images on this page.
- **Contrast:** All text uses the existing site palette (instructor-callout red on cream, body text on white, dark slide-style headers on white). Existing palette already meets WCAG AA — no changes needed.
- **Typos / proofread:** Read every block top-to-bottom. No spelling or grammar issues found in the templates or instructional copy.
- **Mobile / small screens:** Existing media queries in `docs/css/style.css` and the inline block already collapse the 3-column copy-block grid to single column under 768 px. Untouched.
- **Favicon 404:** Pre-existing site-wide; not in scope.

## Files changed

- `docs/decks/week-4-handouts.html` (single file)
  - `<body class>` — added `wk4-handouts`.
  - Inline `<style>` — added `.answer-key*` screen styles; rewrote the `@media print` block (font-size, white-space, page-break behaviour for `.copy-block__body`; print-only force-show for `.answer-key__panel[hidden]`; tightened header margins; `@page { margin: 1.2cm }`).
  - HTML — replaced the QA-drill `<details>` with `.answer-key` button + panel pattern.
  - HTML — rewrote the "Print fallback" intro paragraph.
  - Inline `<script>` — replaced `<details>`-close + beforeprint/afterprint handlers with the `.answer-key__toggle` click handler.

No other files in the repo were modified.

## Print verification command

```
chromium --headless --disable-gpu --no-sandbox \
  --print-to-pdf=print.pdf --no-pdf-header-footer \
  http://localhost:5000/decks/week-4-handouts.html
pdftoppm -r 130 -jpeg print.pdf print-page
```

Result: 5 pages, all blocks intact and column-aligned, answer key visible on page 3.
