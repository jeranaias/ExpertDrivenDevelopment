# Week 4 Deck Audit Report

**Deck:** `docs/decks/week-4-advanced.html` (38 slides)
**Scope:** Visual polish pass — overflow, clipping, broken images/links, contrast, alignment, typos, layout glitches, BREAK full-bleed, print-mode verification.
**Out of scope:** Content rewrites, restructuring, handouts page, other weeks.
**Engine fix policy:** Any deck.css/deck.js changes must be gated to `body.w4-deck`.

---

## Per-slide checklist (38 / 38 reviewed)

Each slide screenshotted at the deck's native 1920×1080 frame and saved to `screenshots/w4-audit/sNN.jpg`.

| # | Title | File | Result |
|---|---|---|---|
| 1 | Cover — Advanced Workshop | s01.jpg | clean |
| 2 | Where you are | s02.jpg | clean |
| 3 | What today proves | s03.jpg | clean |
| 4 | Module 1 section break (Frontier mapping) | s04.jpg | clean |
| 5 | The jagged frontier (Mollick) | s05.jpg | clean |
| 6 | Inside vs outside the frontier | s06.jpg | clean |
| 7 | The 19-point drop (study) | s07.jpg | clean |
| 8 | Frontier mapping protocol | s08.jpg | clean |
| 9 | Workshop — map your frontier | s09.jpg | clean |
| 10 | Examples table | s10.jpg | clean |
| **11** | **Share-out — round the room** | **s11.jpg** | **ISSUE → fixed** |
| 12 | Module 1 takeaway | s12.jpg | clean |
| 13 | Module 2 section break (Complex builds) | s13.jpg | clean |
| 14 | Centaur vs cyborg | s14.jpg | clean |
| 15 | Mode switching | s15.jpg | clean |
| 16 | Workshop — complex build setup | s16.jpg | clean |
| 17 | Build prompts list | s17.jpg | clean |
| 18 | Welcome back — debrief | s18.jpg | clean |
| 19 | Module 2 takeaway | s19.jpg | clean |
| 20 | BREAK (10 min) | s20.jpg | clean — gold body, footer chrome consistent with deck |
| 21 | Module 3 section break (Group debugging) | s21.jpg | clean |
| 22 | Debugging clinic protocol | s22.jpg | clean |
| 23 | Facilitation rules | s23.jpg | clean |
| 24 | Backup scenarios | s24.jpg | clean |
| 25 | Synthesis — what did the room just learn | s25.jpg | clean |
| 26 | Module 4 section break (Verification & QA) | s26.jpg | clean |
| 27 | QA reference card — five protocols | s27.jpg | clean |
| 28 | Workshop — find the five errors | s28.jpg | clean |
| 29 | Module 5 section break (Teaching others) | s29.jpg | clean |
| 30 | What you owe forward | s30.jpg | clean |
| 31 | Apprentice problem & four protocols | s31.jpg | clean |
| 32 | Workshop — teach one concept | s32.jpg | clean |
| 33 | Module 6 section break (Workflow playbook) | s33.jpg | clean |
| 34 | Finished playbook example | s34.jpg | clean |
| 35 | Workshop — build playbook | s35.jpg | clean |
| 36 | Reflection prompts | s36.jpg | clean |
| 37 | Certification path | s37.jpg | clean |
| 38 | Next week — Week 5 preview | s38.jpg | clean |

---

## Issues found and fixes applied

### Slide 11 — Share-out (the only issue)

**Before:** `s11_before.jpg` — title "Share-out — round the room" and the subhead "10 minutes · 90 seconds each · we are listening for patterns" rendered at browser default (~14px / unstyled), tiny and visually broken compared to every other content slide.

**Root cause:** `body.w4-deck .slide--shareout` block in `docs/decks/css/deck.css` defined `.panel`, `.panel h3`, and `.grid` rules but no `h2` or `.subhead` rules. The slide kind never inherited the `slide--content` typography.

**Fix:** Added two CSS rules in `docs/decks/css/deck.css` mirroring the `slide--content` h2 (76 px ink, weight 800, tight leading) and `.subhead` (32 px scarlet, weight 600). Both selectors gated to `body.w4-deck .slide--shareout` so no other deck or slide kind is affected.

**After:** `s11_after.jpg` — title and subhead now match every other content slide in the deck.

---

## Print-mode verification

- The `@media print` blocks in `docs/decks/css/deck.css` (lines 999, 1012, 2281, 2939, 3834, 3979, etc.) do not contain any selectors targeting `.slide--shareout`, so the new rules apply unchanged in print.
- `printDeck()` in `docs/decks/js/deck.js` adds `body.is-printing` and `.is-current/.is-active` to all slides — body retains `w4-deck`, so the new rules are active.
- One slide per page + speaker-notes aside layout untouched (no engine changes).

---

## Engine changes

None to `deck.js`. CSS-only addition in `deck.css`, scoped to `body.w4-deck .slide--shareout` per task policy.

---

## Summary

- 38 / 38 slides reviewed.
- 1 issue found (slide 11 typography).
- 1 fix applied, scoped to the Week 4 deck.
- Print mode verified unaffected.
- BREAK slide (20) full-bleed gold preserved.
- No content edits, no restructuring, no other-week impact.
