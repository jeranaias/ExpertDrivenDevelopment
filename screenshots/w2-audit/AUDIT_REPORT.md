# Week 2 Deck Audit Report

**Deck:** `docs/decks/week-2-builder-orientation.html` (28 slides)
**Scope:** Visual polish pass — overflow, clipping under nav-chrome, broken images/links, contrast, alignment, typos, layout glitches, print-mode verification.
**Out of scope:** Content rewrites, restructuring, other weeks.
**Engine fix policy:** Any `deck.css` / `deck.js` changes must be gated to `body.w2-deck`.

---

## Per-slide checklist (28 / 28 reviewed)

Each slide screenshotted at the deck's native 1920×1080 frame (rendered through the workflow preview at 1280×720) and saved to `screenshots/w2-audit/sNN.jpg`.

| #  | Title                                              | File     | Result |
|----|----------------------------------------------------|----------|--------|
| 1  | Cover — Builder Orientation                        | s01.jpg  | **ISSUE → fixed** |
| 2  | Course context                                     | s02.jpg  | clean |
| 3  | Agenda — Five modules. Mostly hands-on.            | s03.jpg  | clean |
| 4  | Module 1 section break (From User to Builder)      | s04.jpg  | clean |
| 5  | User vs Builder mindset                            | s05.jpg  | clean |
| 6  | Quote — "Decompose before you build"               | s06.jpg  | clean |
| 7  | Decomposition framework intro                      | s07.jpg  | clean |
| 8  | Module 2 section break (Live Build)                | s08.jpg  | clean |
| 9  | What you're about to watch                         | s09.jpg  | clean |
| 10 | Exercise — Watch + Note                            | s10.jpg  | clean |
| 11 | Setup recap                                        | s11.jpg  | clean |
| 12 | Live build — switch windows now                    | s12.jpg  | **ISSUE → fixed** |
| 13 | Checkpoint — return from live build                | s13.jpg  | clean |
| 14 | BREAK (10 min)                                     | s14.jpg  | clean — gold full-bleed preserved |
| 15 | Module 3 section break (Student Build + Breaks)    | s15.jpg  | clean |
| 16 | Exercise — Build it yourself                       | s16.jpg  | clean |
| 17 | When something breaks — title                      | s17.jpg  | clean |
| 18 | Three windows. One loop.                           | s18.jpg  | **ISSUE → fixed** |
| 19 | A debug prompt has three pieces.                   | s19.jpg  | clean |
| 20 | Module 3 takeaway                                  | s20.jpg  | clean |
| 21 | Module 4 section break (Decomposition Framework)   | s21.jpg  | clean |
| 22 | Pick one real problem — exercise                   | s22.jpg  | clean |
| 23 | Decomposition worked example                       | s23.jpg  | clean |
| 24 | Centaur vs Cyborg primer                           | s24.jpg  | clean |
| 25 | Module 5 section break (Wrap-Up & Assignment)      | s25.jpg  | clean |
| 26 | Knowledge check                                    | s26.jpg  | clean |
| 27 | Assignment — Come to Course 3 with four things     | s27.jpg  | clean |
| 28 | Closing — Week 3 preview                           | s28.jpg  | **ISSUE → fixed** |

---

## Issues found and fixes applied

All four issues share a single root cause: shared deck-engine chrome
(`.deck-chrome`, fixed at `bottom: 1.2vh; right: 1.2vw`) overlays the
bottom-right area of every slide. Most Week 2 slides leave that area empty,
but four slides place content there. Per the engine-fix policy, every fix is
scoped to `body.w2-deck` so other weeks are unaffected.

### Slide 1 — Cover (`.slide--cover`)

- **Before:** `s01_before.jpg` — the OUTCOME cell value
  ("A working prototype + a real plan") in the bottom scarlet `.cover-meta`
  band was overlapped by the chrome buttons (PREV / 1·28 / NEXT / NOTES /
  FULL / PRINT).
- **Fix:** `body.w2-deck .slide--cover .cover-meta { padding: 40px 140px 96px 140px; }`
  (was `40px 140px`). Extending the band's bottom padding pushes the four
  cells up so the chrome strip sits inside the lower scarlet area instead
  of on top of text.
- **After:** `s01_after.jpg` — OUTCOME text reads cleanly above the chrome.

### Slide 12 — Live build park (`.slide--live-park`)

- **Before:** `s12_before.jpg` — `.park-foot` right cell
  ("RETURN CUE: PRESENTER SAYS 'BACK TO THE DECK.'") clipped under the chrome.
- **Fix:** `body.w2-deck .slide--live-park .park-foot { padding: 28px 140px 88px 140px; }`
  (was `28px 140px`). Same pattern: extra bottom padding on the dark footer
  band so the chrome strip falls below the text.
- **After:** `s12_after.jpg` — return-cue line reads cleanly above the chrome.

### Slide 18 — Three windows. One loop. (`.slide--breaks .br-banner`)

- **Before:** `s18_before.jpg` — the amber banner's two labels
  ("WHEN SOMETHING BREAKS · THE LOOP" left, "POWER APPS SHOWS · GENAI.MIL
  DIAGNOSES · YOU APPLY" right) wrapped to two lines each, leaving "LOOP"
  and "YOU APPLY" orphaned on a second line.
- **Fix:** Tightened the shared `.br-banner` rule so the longer slide-18
  labels fit on a single line at 1920 px frame width:
  `body.w2-deck .slide--breaks .br-banner { padding: 36px 96px; gap: 48px; letter-spacing: 0.18em; font-size: 18px; }`
  (was `padding: 36px 156px; gap: 64px; letter-spacing: 0.28em; font-size: 22px`).
  Slides 17 and 19 share the same selector and were re-checked — both still
  read cleanly with the slightly tighter banner.
- **After:** `s18_after.jpg` — both banner labels on one line, no orphans.

### Slide 28 — Closing (`.slide--closing`)

- **Before:** `s28_before.jpg` — `.cl-foot` right cell
  ("SEE YOU AT COURSE 3") clipped under the chrome.
- **Fix:** `body.w2-deck .slide--closing .cl-foot { padding: 28px 140px 88px 140px; }`
  (was `28px 140px`). Same pattern as Slide 12.
- **After:** `s28_after.jpg` — closing line reads cleanly above the chrome.

---

## Print-mode verification

- Affected slides (`.slide--cover`, `.slide--live-park`, `.slide--closing`)
  use `display: grid; grid-template-rows: ... auto` with the modified band as
  the `auto` bottom row, so extra bottom padding only shrinks the flexible
  middle row inside the fixed 1920×1080 slide frame. Slide dimensions stay
  intact in print.
- The Week-2 print block at `docs/decks/css/deck.css` line 2281
  (`@media print { body.w2-deck ... }`) explicitly sets
  `width: 1920px; height: 1080px; transform: none` per slide and hides
  `.deck-chrome`, `.notes`, `.hud`, `.help`. With chrome hidden, the
  extended dark/scarlet bands simply read as slightly thicker footers — no
  content is moved or clipped.
- The slide-18 `.br-banner` change is a pure typographic tightening and
  affects screen and print identically; the banner remains a single grid
  row above the body.
- No changes were made to `deck.js` or to any shared (non-w2-scoped) CSS,
  so the `P` shortcut path (`printDeck()` → `body.is-printing`, one slide +
  speaker-notes aside per page) is unchanged.

---

## Engine changes

None to `deck.js`. CSS-only edits in `docs/decks/css/deck.css`,
all four selectors gated to `body.w2-deck` per task policy:

- `body.w2-deck .slide--cover .cover-meta` — padding-bottom only
- `body.w2-deck .slide--live-park .park-foot` — padding-bottom only
- `body.w2-deck .slide--breaks .br-banner` — padding / gap / letter-spacing / font-size
- `body.w2-deck .slide--closing .cl-foot` — padding-bottom only

---

## Regression spot-checks

Three slides not flagged in the sweep were re-screenshotted after the fixes
to confirm no collateral damage:

- Slide 3 (Agenda) — clean
- Slide 14 (BREAK) — clean, gold full-bleed preserved
- Slide 22 (Pick one real problem) — clean

---

## Summary

- 28 / 28 slides reviewed.
- 4 issues found (slides 1, 12, 18, 28), all chrome-overlap or banner-wrap.
- 4 fixes applied, all CSS, all scoped to `body.w2-deck`.
- Print mode verified unaffected.
- BREAK slide (14) full-bleed gold preserved.
- No content edits, no restructuring, no other-week impact.
