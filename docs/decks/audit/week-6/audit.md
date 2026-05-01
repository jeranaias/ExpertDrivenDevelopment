# Week 6 Deck Audit — `docs/decks/week-6-fullstack.html`

**Slides audited:** 58 (every slide screenshotted at 1280×720 native 16:9)
**Screens directory:** `docs/decks/audit/week-6/screens/`
- `slide-01.jpg` … `slide-58.jpg` — full baseline (all 58 slides; persistent `.deck-back` link suppressed by the audit script)
**Print PDF:** `week-6-print.pdf` (1681 KB, 58 pages — clean 1:1 slide-to-page mapping)

## Scope

The body class on `docs/decks/week-6-fullstack.html` is **`w6-deck`** (verified). Week 6 styling is implemented as an **inline `<style>` block in the HTML head** (lines 8–673 of `week-6-fullstack.html`), not via `body.w6-deck …` rules in deck.css. No edits were required for this deck during this audit.

| File | Body class |
|------|-----------|
| `docs/decks/week-6-fullstack.html` | `w6-deck` |

(Full body-class scope table is in `docs/decks/audit/week-1/audit.md`.)

## Audit script note

Week 6 (and Week 5) have a persistent on-screen `.deck-back` link ("Back to deck") that other weeks don't. `scripts/audit-screens.js` was extended during this audit batch to hide `#deck-chrome, .deck-chrome, #deck-notes, .deck-notes, .deck-back` before each capture, so the audit screenshots show pure slide content with no chrome.

## Findings

**Layout: PASS.** All 58 slides render cleanly at 1280×720 native 16:9. Week 6 is the largest deck in the program (full-stack capstone, 10 build modules + framing/closing) and uses a wide variety of slide layouts:

- **Cover & section dividers** (slides 1, 50, 54): big-type, vertically centered, no clipping.
- **Build-module split slides** (e.g. 8, 11, 19, 27, 32, 37, 41, 45): two-pane layout with module number/eyebrow on the dark left and title + badges + lede on the right — ratios held, no overlap.
- **Architecture-status slides** (e.g. 5, 17, 26, 31, 35, 40, 44, 48): four-row L1/L2/L3/L4 stack with status-card on the right — vertical alignment perfect across all variants (built, lit, deepened, packaged).
- **Build-framing content slides** with red "▶ WHAT WE'RE ADDING" badge + side card (e.g. 9, 18, 23, 28, 33, 38, 42, 46): bullet list and card sit at equal heights, no foot-bar collision.
- **Editor-handoff slides** with the red "▶ SWITCH TO THE EDITOR" pill and big yellow/white headline (e.g. 10, 15, 21, 25, 29, 34, 39, 43, 47): vertically centered, headline doesn't wrap awkwardly.
- **Break slides** (16, 22, 36): big "15 min" / "10 min" centered numerals, supporting line beneath.
- **Reference / answer-key tables** (slide 49) and **rubric tables** (slide 51): wide tables fit within the slide frame, columns aligned, no clipping.
- **Closing slides** (54–58): journey-grid, three-commitments callout, resources, and the "You wrote the requirements. AI wrote the code. You shipped the container." finale all render cleanly with the dark-with-gold-glow finale slide intact.

Persistent `.deck-back` link sits in the top-left corner unobtrusively (and is hidden in print — see below).

**No CSS or HTML edits made to Week 6 in this audit.** The deck is shippable as-is at the audit resolution.

## Print-mode verification

**Pipeline:** Two competing print rule sets are present:
1. Week 6 inline `<style>` block (~L666–672 of `week-6-fullstack.html`): `@page { size: landscape; margin: 0.4in }` plus per-element `page-break-after: always` rules.
2. Universal block at `docs/decks/css/deck.css` ~L3993: `@page { size: 20in 16.458in; margin: 0 }`, fixed 1920×1080 slide panel, injected `.slide-print-notes` below.

Source order: the inline `<style>` is loaded **before** `<link rel="stylesheet" href="css/deck.css">`, so the universal deck.css block wins. Resulting page size: 1440 × 1185.12 pt = 20 × 16.458 in landscape (matches the universal rule).

**Verification method:** Generated `week-6-print.pdf` from `week-6-fullstack.html?print=1` via Chromium `Page.printToPDF` with `preferCSSPageSize: true` and `setEmulatedMedia('print')`. Inspected page 1 and verified the page count.

**Result: PASS — clean 1:1 mapping.** **58 PDF pages for 58 slides.** No overflow continuation pages, no blank pages. Each slide renders as the 1920×1080 px frame at the top of its page with speaker notes below the red separator. Page size matches the universal print spec.

Week 6 has the cleanest print result in the audit batch (Weeks 2 and 3 each had a small number of notes-overflow continuation pages; Week 5 had 16). That's because Week 6's per-slide notes are bullet-style and short enough to fit within the ~500 px notes area below each 1080 px slide panel.

**Dead-code observation (acknowledged, not fixed):** Week 6's inline `@page { size: landscape; margin: 0.4in }` is overridden by deck.css and never affects output. Removing it would be a tidy-up; left alone to avoid changing files unrelated to the audited issue.

## Files changed
None.

## Files generated
- `docs/decks/audit/week-6/screens/slide-01.jpg` … `slide-58.jpg`
- `docs/decks/audit/week-6/week-6-print.pdf`
