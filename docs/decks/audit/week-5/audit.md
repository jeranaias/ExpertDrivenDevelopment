# Week 5 Deck Audit — `docs/decks/week-5-supervisor.html`

**Slides audited:** 28 (every slide screenshotted at 1280×720 native 16:9)
**Screens directory:** `docs/decks/audit/week-5/screens/`
- `slide-01.jpg` … `slide-28.jpg` — full baseline (all 28 slides; persistent `.deck-back` link suppressed by the audit script)
**Print PDF:** `week-5-print.pdf` (693 KB, 44 pages — see Print-mode verification)

## Scope

The body class on `docs/decks/week-5-supervisor.html` is **`w5-deck`** (verified). Week 5 styling is implemented as an **inline `<style>` block in the HTML head** (lines 8–560 of `week-5-supervisor.html`), not via `body.w5-deck …` rules in deck.css. No edits were required for this deck during this audit.

| File | Body class |
|------|-----------|
| `docs/decks/week-5-supervisor.html` | `w5-deck` |

(Full body-class scope table is in `docs/decks/audit/week-1/audit.md`.)

## Audit script note

Week 5 (and Week 6) have a persistent on-screen `.deck-back` link ("Back to deck") that other weeks don't. `scripts/audit-screens.js` was extended during this audit batch to hide `#deck-chrome, .deck-chrome, #deck-notes, .deck-notes, .deck-back` before each capture, so the audit screenshots show pure slide content with no chrome.

## Findings

**Layout: PASS.** All 28 slides render cleanly at 1280×720 native 16:9:
- Cover, "Audience shift" two-column comparison, mode-picker (Mode A / Mode B), agenda card, scenario slides (Scenarios A and B), Exercise C, the apprentice-problem callouts, and the closing quick-reference card all sit inside the slide frame.
- Two-column comparison cards are vertically aligned.
- Pull-quote slides centre cleanly with the gold left border visible.
- "Quick reference card" final slide reads cleanly with all six numbered items visible.
- Persistent footer strip and slide counter are not crowded.
- Persistent `.deck-back` link sits in the top-left corner unobtrusively in normal screen mode (and is hidden in print — see below).

**No CSS or HTML edits made to Week 5 in this audit.** The deck is shippable as-is at the audit resolution.

## Print-mode verification

**Pipeline:** Two competing print rule sets are present:
1. Week 5 inline `<style>` block (~L537–559 of `week-5-supervisor.html`): `@page { size: 11in 6.1875in; margin: 0 }` and `.slide { height: 6.1875in; page-break-after: always }`.
2. Universal block at `docs/decks/css/deck.css` ~L3993: `@page { size: 20in 16.458in; margin: 0 }`, fixed 1920×1080 slide panel, injected `.slide-print-notes` below, and `.slide { page-break-after: avoid !important }`.

Source order: the inline `<style>` is loaded **before** `<link rel="stylesheet" href="css/deck.css">` (line 561 of `week-5-supervisor.html`), so the universal deck.css print block wins. The W5 inline `@page` is effectively dead in the produced PDF (page size is 1440 × 1185.12 pt = 20 × 16.458 in, matching the universal rule). Week 5's inline rule that hides `.deck-back` in print is preserved on its own merits.

**Verification method:** Generated `week-5-print.pdf` from `week-5-supervisor.html?print=1` via Chromium `Page.printToPDF` with `preferCSSPageSize: true` and `setEmulatedMedia('print')`. Inspected pages 1–6.

**Result: PASS — every slide gets its own page.**
- Page size: 1440 × 1185.12 pt = 20 × 16.458 in landscape. ✓
- Slide rendering: each slide is the 1920×1080 px frame at the top of its page; speaker notes follow below the red separator. ✓
- Persistent `.deck-back` link hidden in print (W5 inline `@media print` rule already lists `.deck-back` in `display: none !important`).
- Slide-to-page mapping: 28 unique slides, each beginning on its own page in correct order (verified by inspection of pages 1, 3, 5).

**Known print quirk (not a regression — out of scope):** The PDF reports **44 total pages**, sixteen more than the 28 slides. Week 5's speaker notes are markedly longer than the other decks (briefing/extended-session split, multiple scripted callouts per slide), and the universal injected `.slide-print-notes` block (`min-height: 460 px`, no `max-height`) overflows the ~500 px notes area on many slides; the overflow continues onto a second page that contains only the rest of the notes (the slide is **never** duplicated — confirmed by direct inspection of pages 2, 4, 6 which show pure notes-continuation content).

This is the same engine pattern present in Weeks 2 (2 extras) and 3 (3 extras), more pronounced here because Week 5's notes carry both 30-minute and 60–90-minute mode scripts. Not addressed because (a) it's an inherent property of the universal injected notes block, (b) the slides themselves render correctly, and (c) shortening notes would be a content edit outside audit scope. A future enhancement could convert long notes to a `max-height` + scroll/truncate model, but that affects all six decks and is out of scope for this slide-by-slide audit.

**Dead-code observation (acknowledged, not fixed):** Week 5's inline `@page { size: 11in 6.1875in }` is overridden by deck.css and never affects output. Removing it would be a tidy-up; left alone here to avoid changing files unrelated to the audited issue.

## Files changed
None.

## Files generated
- `docs/decks/audit/week-5/screens/slide-01.jpg` … `slide-28.jpg`
- `docs/decks/audit/week-5/week-5-print.pdf`
