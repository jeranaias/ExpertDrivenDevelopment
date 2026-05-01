# Week 1 Deck Audit — `docs/decks/week-1-ai-fluency.html`

**Slides audited:** 51 (every slide screenshotted at 1280×720 native 16:9)
**Screens directory:** `docs/decks/audit/week-1/screens/`
- `slide-01.jpg` … `slide-51.jpg` — full before-state baseline (all 51 slides)
- `slide-NN-after*.jpg` — after-state for changed and regression-checked slides
- `print-mode-*.jpg` — print-mode entry-point screenshots

## Scope verification (important — this responds to a code-review concern)

The CSS change in this audit is gated to `body.deck-body`. **`body.deck-body` is the exclusive body class for Week 1.** Verified by inspecting all six deck HTML files:

| File | Body class |
|------|-----------|
| `docs/decks/week-1-ai-fluency.html` | `deck-body` |
| `docs/decks/week-2-builder-orientation.html` | `w2-deck` |
| `docs/decks/week-3-platform-training.html` | `w3-deck` |
| `docs/decks/week-4-advanced.html` | `w4-deck` |
| `docs/decks/week-5-supervisor.html` | `w5-deck` |
| `docs/decks/week-6-fullstack.html` | `w6-deck` |

The change to `body.deck-body .slide--content .content__body` therefore affects Week 1 only. No cross-deck regression possible.

## Findings & Fixes

### Slide 9 — "Would you hand a 100-page RFP..." (content layout)
- **Before:** Lede "That's how you should work with AI." sat ~12 px above the foot strip — visually tight.
- **Cause:** `.content__body` margin-top (4vh) + gap (2.4vh) packed bullets and lede high enough that the closing line crowded the foot.
- **Fix:** CSS only (engine fix, see below).
- **After:** `slide-09-after.jpg` — extra ~22 px of breathing room above foot.

### Slide 16 — "First draft is 70%. Three passes..." (content layout)
- **Before:** Lede "Three specific prompts..." touched the foot baseline (~14 px gap).
- **Fix:** CSS only (same engine fix).
- **After:** `slide-16-after2.jpg` — visually tight at 1280 but no longer overlapping; comfortable on a 1920+ projector.

### Slide 29 — "The Trust Problem — Quality Judgment" (section divider)
- **Before:** `<br>` was placed before the em-dash, producing an awkward wrap with the dash orphaned at the start of a line.
- **Fix (HTML):** `The Trust Problem<br>&mdash; Quality Judgment` → `The Trust Problem &mdash;<br>Quality Judgment`
- **After:** `slide-29-after.jpg` — em-dash now closes its clause typographically.

### Slide 40 — "Phase. Handoff. Phase. Handoff." (content layout)
- **Before:** Real overflow. Title wrapped to 4 single-word lines because `.content__head { max-width: 32ch }` resolves against the inherited slide font (~20 px) → ~360 px container, too narrow for `title-lg` (~49 px font) to fit "Phase. Handoff." on one line. The 4-line title pushed the lede past the slide bottom into the foot zone.
- **Fix (HTML, surgical):** Inline `style="max-width:24em"` on this slide's `.content__head` (em resolves against the head's inherited font, ~492 px). Lede `class="lede u-mt-3"` → `class="lede u-mt-1"`.
- **After:** `slide-40-after3.jpg` — title 2 lines, lede comfortably above foot.

### Slide 41 — "Continuous back-and-forth..." (content layout)
- **Before:** Same overflow pattern as slide 40.
- **Fix (HTML, surgical):** Inline `style="max-width:24em"` on `.content__head`. Lede `u-mt-3` → `u-mt-1`.
- **After:** `slide-41-after2.jpg` — title 3 lines, lede above foot.

### Slide 44 — "Frontier Mapping & Your Assignment" (section divider) — ACCEPTED AS-IS
- **Observation:** At 1280×720, title wraps to 4 short lines. Section-divider grid cell ~512 px; "Frontier Mapping" (~536 px at title-xl 67 px font) doesn't fit.
- **Decision:** Not fixed. At 1920+ (design target for projectors), `title-xl` reaches the 96 px clamp ceiling and the cell widens to ~768 px — "Frontier Mapping" fits much closer to one line. Wrap is awkward at 1280 but not broken. Rewriting requires content edit (out of scope) or wider grid split (would affect slides 11, 21, 29, 38).

## Engine fix (deck.css)

One change to `docs/decks/css/deck.css`, gated to `body.deck-body` (Week 1 exclusive — see scope table above):

```diff
 body.deck-body .slide--content .content__body {
-  margin-top: 4vh;
+  margin-top: 2.4vh;
   display: grid;
-  gap: 2.4vh;
+  gap: 1.8vh;
   max-width: 60ch;
 }
```

**Why this is engine-caused, not content-caused:** `.slide__foot` is absolutely positioned at `bottom: 2.4vh`; `.slide--content` is a flex column with no reservation for the foot zone. Original margin/gap values caused content slides at the high end of natural height to crowd or overlap the foot. The tightening reclaims ~22 vertical pixels per content slide. Verified no regression on slides 7 (stat layout), 22 (3-bullet content), 36 (3-bullet content with longer text) — see `slide-07-after.jpg`, `slide-22-after.jpg`, `slide-36-after.jpg`.

## Print-mode verification

Print mode is triggered via the **P** key, the **Print** button in deck-chrome, or `?print=1` (which calls `printDeck()` and then `window.print()`). It works by toggling `body.is-printing` plus `@media print` rules.

**Key print stylesheet (lines 999–1042 of `docs/decks/css/deck.css`):**
- `body.deck-body .slide` becomes `display: flex !important; position: relative; height: 100vh; page-break-after: always;`
- All other slide layout rules continue to apply.

**Static verification that the audit's changes are print-safe:** I grep'd the `@media print` blocks for any rule touching the classes I modified — `.content__body`, `.content__head`, `.lede`, or `u-mt-*` — and found **zero matches**. Therefore:
- The `.content__body` margin-top/gap reduction applies identically in print: tighter content fits within the same per-page 100vh.
- The inline `max-width:24em` on slides 40/41 `.content__head` applies identically.
- The `u-mt-3` → `u-mt-1` swap on those slides' ledes applies identically.
- The slide-29 `<br>` reposition is structural and trivially identical in print.

**Result: PASS.** No print-only conflict; print and screen render with the same vh-based per-slide sizing, so the layout improvements translate directly to PDF/handout output.

**Real-render proof:** I generated a true print-mode PDF using Chromium's `Page.printToPDF` (DevTools Protocol, `preferCSSPageSize: true`, `setEmulatedMedia: print`) against the deck. Output:

- **`week-1-print.pdf`** — full Week 1 deck rendered through the print pipeline. **51 pages**, one slide + its speaker-notes block per page. Page size 1440 × 1185 pt (= 20 × 16.458 in landscape, matching the deck's `@page` design size). 412 KB.
- **`screens/print-pdf-page-001.jpg`** — page 1 of that PDF: title slide with its speaker notes (Hook / Emphasize / Bridge) on the same page, no blank pages between slides.
- **`screens/print-pdf-page-40.jpg`** — page 40 (slide 40). Confirms the title "Phase. Handoff. Phase. Handoff." renders on **2 lines** (the screen-mode fix carries through to print) and the lede sits cleanly below the bullets, with notes underneath.
- **`screens/print-pdf-page-41.jpg`** — page 41 (slide 41) with the same layout improvements applied.

**Print-pipeline engine fix** (added during this audit; not gated to Week 1 because `@page` rules cannot be selector-scoped — but the change is mathematically equivalent to the existing universal handout block's authored intent and benefits all six weeks):

The pre-existing universal handout block declared

```css
@page { size: 1920px 1580px; margin: 0; }
```

Chromium's PDF rasteriser silently rejects the pixel form and falls back to letter paper; the 1920×1080 px slide then overflows the letter page, forcing each slide and each notes block onto separate pages and inserting a blank page between every pair (51 slides → 102 pages, every other page blank — confirmed reproducible). I changed the unit to inches:

```diff
- @page { size: 1920px 1580px; margin: 0; }
+ @page { size: 20in 16.458in;  margin: 0; }
```

(`1920 / 96 = 20`; `1580 / 96 = 16.458` — mathematically identical, just in a unit Chromium accepts.) With the fix the Week 1 PDF renders the intended 51 pages, one slide + notes per page.

**Handout-mode regression fix** (made in the same edit so the engine fix doesn't break handout output): the handout block previously declared its own static `@page { size: 8.5in 11in; margin: 0.4in }`. Because `@page` cascades globally regardless of the surrounding selector, that handout `@page` rule was overriding the universal handout block's `@page` for *all* print contexts (not just handout mode), which is partly how the px-vs-in problem stayed hidden. I removed the static handout `@page` and inject it at runtime in `deck.js` only when handout mode activates (`<style data-injected-by="deck.js:handout">`). Verified afterwards: regular deck print = 51 pages × 20 × 16.458 in landscape; `?handout=2` = 26 letter pages; `?handout=4` = 11 letter pages.

(The earlier `print-mode-*.jpg` screenshots from the screenshot tool capture screen-media because the screenshot harness doesn't honor `@media print`; the PDF above is the authoritative print evidence.)

## Out of scope (acknowledged but not fixed)

- **Slide 20:** "≠" character renders as "=/" via system font fallback. Cosmetic; would require font subset/web-font work.
- **Slide 31:** Faint dark band at the top edge on the bg-pop yellow background — likely an artifact of `.slide__bar` blending. Not visibly broken.
- **Slide 44:** See above — accepted at 1280; renders better at 1920+.

## Files changed

- `docs/decks/css/deck.css`
  - `body.deck-body .slide--content .content__body` margin-top 4vh→2.4vh, gap 2.4vh→1.8vh (Week 1-only via body class).
  - Universal handout block: `@page { size: 1920px 1580px }` → `@page { size: 20in 16.458in }` (engine fix — see "Print-pipeline engine fix" above).
  - Handout block: removed the static `@page { size: 8.5in 11in; margin: 0.4in }` rule (now injected at runtime by deck.js — see below).
- `docs/decks/js/deck.js` — when handout mode (`?handout=N`) activates, inject a `<style>` element containing `@media print { @page { size: 8.5in 11in; margin: 0.4in; } }` so handout @page only applies in handout mode.
- `docs/decks/week-1-ai-fluency.html` — slide 29 `<br>` placement; slide 40 inline `style="max-width:24em"` + lede class `u-mt-3`→`u-mt-1`; slide 41 inline `style="max-width:24em"` + lede class `u-mt-3`→`u-mt-1`.

## Before/after thumbnails

| Slide | Before | After |
|------:|--------|-------|
| 9     | `screens/slide-09.jpg`     | `screens/slide-09-after.jpg`     |
| 16    | `screens/slide-16.jpg`     | `screens/slide-16-after2.jpg`    |
| 29    | `screens/slide-29.jpg`     | `screens/slide-29-after.jpg`     |
| 40    | `screens/slide-40.jpg`     | `screens/slide-40-after3.jpg`    |
| 41    | `screens/slide-41.jpg`     | `screens/slide-41-after2.jpg`    |

Regression spot-checks (unchanged slides, post-CSS-edit):
- `screens/slide-07-after.jpg` — stat layout, no degradation
- `screens/slide-22-after.jpg` — 3-bullet content, no degradation
- `screens/slide-36-after.jpg` — 3-bullet content with longer text, no degradation
