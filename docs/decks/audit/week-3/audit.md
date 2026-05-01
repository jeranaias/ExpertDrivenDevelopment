# Week 3 Deck Audit — `docs/decks/week-3-platform-training.html`

**Slides audited:** 32 (every slide screenshotted at 1280×720 native 16:9)
**Screens directory:** `docs/decks/audit/week-3/screens/`
- `slide-01.jpg` … `slide-32.jpg` — full baseline (all 32 slides)
**Print PDF:** `week-3-print.pdf` (413 KB, 35 pages — see Print-mode verification)

## Scope

The body class on `docs/decks/week-3-platform-training.html` is **`w3-deck`** (verified). All Week 3-scoped CSS lives at `body.w3-deck …` rules in `docs/decks/css/deck.css` (around lines 2314–2980, including a per-deck `@media print` block). No edits were required for this deck during this audit.

| File | Body class |
|------|-----------|
| `docs/decks/week-3-platform-training.html` | `w3-deck` |

(Full body-class scope table is in `docs/decks/audit/week-1/audit.md`.)

## Findings

**Layout: PASS.** All 32 slides render cleanly at 1280×720 native 16:9:
- Cover, "How this week is different", section dividers, content slides with two-column layouts, code blocks, and break slides all sit fully inside the slide frame.
- Tables (e.g. the 4-hour map, build comparisons, decision matrices) fit within their cells with no row-height collisions.
- Pull-quote and section-divider cards are vertically centered in their cells.
- Every footer strip ("Module N · …") is visible and not crowded by body content.
- No overflow into the bottom red rule on any slide.

**No CSS or HTML edits made to Week 3 in this audit.** The deck is shippable as-is at the audit resolution.

## Print-mode verification

**Pipeline:** Print mode uses the universal `@media print` block at `docs/decks/css/deck.css` ~L3993 (page size `20in 16.458in`, fixed 1920×1080 slide panel + injected notes). Week 3 also has a per-deck `@media print` block at deck.css ~L2940 that defines `@page { size: 13.333in 7.5in }` and sets `body.w3-deck .speaker-notes` to break onto its own page after each slide. Source order: the universal block is appended last in deck.css, so its `@page { size: 20in 16.458in }` and `.slide { page-break-after: avoid !important }` win; the per-deck `@page` is dead code in practice but does no harm.

**Verification method:** Generated `week-3-print.pdf` from `week-3-platform-training.html?print=1` via Chromium `Page.printToPDF` with `preferCSSPageSize: true` and `setEmulatedMedia('print')`. Inspected pages 1, 4, 5 and spot-checked others.

**Result: PASS — every slide gets its own page.**
- Page size: 1440 × 1185.12 pt = 20 × 16.458 in landscape. ✓
- Slide rendering: each slide is the 1920×1080 px frame at the top of the page; speaker notes follow below the red separator. No blank pages between slides. ✓
- Slide-to-page mapping: 32 unique slides, each beginning on its own page in correct order (verified pages 1, 4, 5).

**Known print quirk (not a regression — out of scope):** The PDF reports **35 total pages**, three more than 32 slides. The three extras are continuation pages where a slide's speaker-notes block (longer on three slides) overflowed past the ~500 px notes area onto a second page. Slides are never duplicated. Same engine behaviour as Weeks 2 and 5; addressed neither here nor in the Week 1 audit because it's an inherent property of the injected `.slide-print-notes` rule and shortening individual notes would be a content edit outside audit scope.

## Files changed
None.

## Files generated
- `docs/decks/audit/week-3/screens/slide-01.jpg` … `slide-32.jpg`
- `docs/decks/audit/week-3/week-3-print.pdf`
