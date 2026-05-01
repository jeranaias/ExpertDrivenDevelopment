# Week 4 Deck Audit — `docs/decks/week-4-advanced.html`

**Slides audited:** 38 (every slide screenshotted at 1280×720 native 16:9)
**Screens directory:** `docs/decks/audit/week-4/screens/`
- `slide-01.jpg` … `slide-38.jpg` — full baseline (all 38 slides)
- `slide-24-after.jpg` — after-state for the slide 24 fix
**Print PDF:** `week-4-print.pdf` (567 KB, 38 pages — clean 1:1 slide-to-page mapping)

## Scope

The body class on `docs/decks/week-4-advanced.html` is **`w4-deck`** (verified). All Week 4-scoped CSS lives at `body.w4-deck …` rules in `docs/decks/css/deck.css` (around lines 3000–3850). The fix below is gated to `body.w4-deck .slide[data-id="24"]` so it can affect **only** Week 4's slide 24.

| File | Body class |
|------|-----------|
| `docs/decks/week-4-advanced.html` | `w4-deck` |

(Full body-class scope table is in `docs/decks/audit/week-1/audit.md`.)

## Findings & Fixes

### Slide 24 — "Backup scenarios — if the room is light on real problems"
- **Before** (`screens/slide-24.jpg`): The slide presents four scenarios (A–D) in two stacked `.cols-2` grids of 1fr 1fr. Scenario B's body is taller than Scenario A's. With both grids declared `flex: 1; min-height: 0` (deck.css L3234–3240), each grid is allocated exactly half the available `.slide__body` height; Scenario B's content overflows that allocated row, and "Notice the through-line" (the row-2 right cell H3) renders **on top of** Scenario B's "Pattern: context gap …" line.
- **Cause:** Engine, not content. The `flex: 1; min-height: 0` on `.cols-2` (used universally by Week 4) plus the per-cell inline `style="font-size:26px"` makes natural content of one row exceed half the slide-body height at 1280×720; the second row's grid then visually overlaps the first.
- **Fix (CSS, scoped):** Added a slide-24-only override block in `docs/decks/css/deck.css` immediately after the universal `body.w4-deck .cols-2 .col p` rule. The override (a) lets each `.cols-2` size to its natural content (`flex: 0 0 auto`), (b) tightens the slide-body padding/gap, (c) trims H3 sizes, and (d) overrides the inline 26 px paragraph font with `font-size: 22px !important`. All selectors are gated by `body.w4-deck .slide[data-id="24"]` — they cannot affect any other slide or any other week.
- **After** (`screens/slide-24-after.jpg`): All four scenarios visible in clean 2 × 2 layout, no overlap, footer strip clear, comfortable margins.

```css
/* Slide 24 — backup scenarios: 4-cell layout overflows row 1 at 1280×720
   because both .cols-2 grids have flex:1; min-height:0 and the natural
   content of Scenario B exceeds half the available height. Scope a denser
   layout to this slide only. */
body.w4-deck .slide[data-id="24"] .slide__body { gap: 18px; padding-top: 64px; padding-bottom: 56px; }
body.w4-deck .slide[data-id="24"] .cols-2 { flex: 0 0 auto; gap: 48px; }
body.w4-deck .slide[data-id="24"] .cols-2 + .cols-2 { margin-top: 0; }
body.w4-deck .slide[data-id="24"] .cols-2 .col { gap: 8px; }
body.w4-deck .slide[data-id="24"] .cols-2 .col h3 { font-size: 28px; padding-bottom: 6px; margin-bottom: 4px; }
body.w4-deck .slide[data-id="24"] .cols-2 .col p { font-size: 22px !important; line-height: 1.35; }
```

### All other slides (1–23, 25–38)
**Layout: PASS.** Cover, four section-divider cards, content slides, code-callout slides, two-column scenario slides, big-stat slides, workshop/cue/break panels, and the synthesis slide all render cleanly at 1280×720. No overflow, no footer crowding, no element overlap.

## Print-mode verification

**Pipeline:** Universal `@media print` block in deck.css (page size `20in 16.458in`, fixed 1920×1080 slide panel + injected notes block).

**Verification method:** Generated `week-4-print.pdf` from `week-4-advanced.html?print=1` via Chromium `Page.printToPDF` with `preferCSSPageSize: true` and `setEmulatedMedia('print')`. Page count: **38 pages for 38 slides** — clean 1:1 mapping with no overflow continuation pages. Spot-checked page 24 specifically to confirm the slide-24 fix carries through to print: all four scenarios render cleanly at 1920×1080 with notes below the red separator (no overlap, no clipping).

**Result: PASS.** The slide-24 fix is selector-scoped (no `@media`-only rules), so it applies identically in screen and print contexts. Verified by direct inspection of print page 24.

## Out of scope (acknowledged but not fixed)

- Slide 24 typography is denser than the deck's defaults. This is a deliberate trade-off to fit four scenarios at 1280×720; on a 1920+ projector the slide is comfortable but the relative density remains. Could be addressed by an editorial trim of one scenario, but that is a content decision out of audit scope.

## Files changed

- `docs/decks/css/deck.css` — added the six-rule scoped block above (immediately after `body.w4-deck .cols-2 .col p, …`) gated to `body.w4-deck .slide[data-id="24"]`. No other rules touched.

## Files generated

- `docs/decks/audit/week-4/screens/slide-01.jpg` … `slide-38.jpg`
- `docs/decks/audit/week-4/screens/slide-24-after.jpg`
- `docs/decks/audit/week-4/week-4-print.pdf`

## Before/after

| Slide | Before | After |
|------:|--------|-------|
| 24    | `screens/slide-24.jpg` | `screens/slide-24-after.jpg` |
