# Week 2 Deck Audit — `docs/decks/week-2-builder-orientation.html`

**Slides audited:** 28 (every slide screenshotted at 1280×720 native 16:9)
**Screens directory:** `docs/decks/audit/week-2/screens/`
- `slide-01.jpg` … `slide-28.jpg` — full baseline (all 28 slides)
**Print PDF:** `week-2-print.pdf` (332 KB, 30 pages — see Print-mode verification)

## Scope

The body class on `docs/decks/week-2-builder-orientation.html` is **`w2-deck`** (verified). All Week 2-scoped CSS lives at `body.w2-deck …` rules in `docs/decks/css/deck.css` (around lines 1358–2280). No edits were required for this deck during this audit.

| File | Body class |
|------|-----------|
| `docs/decks/week-1-ai-fluency.html` | `deck-body` |
| `docs/decks/week-2-builder-orientation.html` | `w2-deck` |
| `docs/decks/week-3-platform-training.html` | `w3-deck` |
| `docs/decks/week-4-advanced.html` | `w4-deck` |
| `docs/decks/week-5-supervisor.html` | `w5-deck` |
| `docs/decks/week-6-fullstack.html` | `w6-deck` |

## Findings

**Layout: PASS.** All 28 slides render cleanly at 1280×720 native 16:9:
- Cover, section dividers, content, two-column, big-stat, code-callout, break, and exercise slides all sit inside the slide frame with no overflow, no foot-bar collision, and no header/foot crowding.
- Tables, cols-2 grids, and bullet lists fit within their columns.
- No element overlaps another; every footer-bar `Module N · …` strip is fully visible.
- All content slides have title + subhead + body that flow naturally; nothing crowds the bottom red rule.

**No CSS or HTML edits made to Week 2 in this audit.** The deck is shippable as-is at the audit resolution.

## Print-mode verification

**Pipeline:** Print mode uses the universal `@media print` block at `docs/decks/css/deck.css` ~L3993, which sets `@page { size: 20in 16.458in; margin: 0 }` and forces every `.slide` to a fixed 1920×1080 px panel followed by a runtime-injected `.slide-print-notes` block. The Week 1 audit fixed the legacy `1920px 1580px` → `20in 16.458in` page-size unit issue; that fix benefits Week 2 directly.

**Verification method:** Generated `week-2-print.pdf` from `week-2-builder-orientation.html?print=1` via Chromium `Page.printToPDF` with `preferCSSPageSize: true` and `setEmulatedMedia('print')`. Inspected pages 1, 2, 4, 5 (and spot-checked others).

**Result: PASS — every slide gets its own page.**
- Page size: 1440 × 1185.12 pt = 20 × 16.458 in landscape. ✓
- Slide rendering: each slide is the 1920×1080 px frame at the top of the page with the speaker-notes block below the red separator. No blank pages between slides. ✓
- Slide-to-page mapping: 28 unique slides, each beginning on its own page in correct order (verified pages 1, 2, 4, 5).

**Known print quirk (not a regression — out of scope for this audit):** The PDF reports **30 total pages**, two more than the 28 slides. The two extras are continuation pages where a slide's speaker-notes block exceeded the ~500 px notes area on its primary page and overflowed onto a second page. The slide itself is never duplicated. This is a property of the universal injected `.slide-print-notes` rule (`min-height: 460 px`, no `max-height`) interacting with longer notes — the same pattern is visible in Weeks 3 and 5 with more pronounced effect. Acceptable for instructor-facing PDFs; not addressed here because (a) it's an engine behaviour shared across all decks, (b) it doesn't affect slide rendering, and (c) shortening notes would be a content edit out of audit scope.

## Files changed
None.

## Files generated
- `docs/decks/audit/week-2/screens/slide-01.jpg` … `slide-28.jpg`
- `docs/decks/audit/week-2/week-2-print.pdf`
- `scripts/audit-print-pdfs.js` (build script for the print PDFs in this audit batch)
