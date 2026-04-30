# EDD Weekly Deck — Design System

This note documents the shared visual identity for the six instructor-led
weekly decks (Course 1 through Course 6). Week 1 (`week-1-ai-fluency.html`)
establishes the system; Weeks 2–6 inherit it by linking the same
`css/deck.css` and `js/deck.js` and reusing the layouts described below.

The system was deliberately built to match the Expert-Driven Development
site (`docs/css/style.css`) so the decks feel native to the program.

---

## Use case — what the decks have to survive

- **Microsoft Teams screen-share at 1080p.** The presenter shares the
  browser window in full-screen. Slides must be legible to viewers
  watching on a 13" laptop with mediocre Teams compression.
- **Live click-through, presenter narrates.** The slides carry visuals
  and structure; the presenter carries the narration. Speaker notes are
  in `<aside class="notes">` on every slide — hidden in presentation
  mode, toggled with `N`, included in print export.
- **Two-hour module structure.** ~50 slides, ~2 min/slide on average,
  with section dividers that show module timing so the presenter and
  the room stay calibrated.

---

## Palette

The palette is two USMC accents on a paper/ink ground. No other hues.

| Role | Hex | Usage |
|---|---|---|
| **Scarlet** | `#CC0000` | Primary accent. Section number, knowledge-check border, key bullets, hero stat. |
| **Scarlet (dark)** | `#a30000` | Hover / depth on scarlet. |
| **Gold** | `#F5D130` | Secondary accent. Exercise slide background, eyebrow text on dark, gold rule. |
| **Gold (dark)** | `#d4b11a` | Gold legible on light backgrounds. |
| **Ink** | `#1a1a1a` | Primary text. Dark slide backgrounds (cover, section, closing). |
| **Paper** | `#ffffff` | Default light slide background. |
| **Paper (warm)** | `#faf9f6` | Stat slide and debrief background; subtle warmth, never plain white. |
| **Rule** | `#e5e3dd` | Card borders, table rules. |

Rules:

- Never plain white (`#fff`) without a brand bar at the top — every slide
  shows scarlet/gold somewhere so the deck reads as one piece.
- Exercise slides invert: gold ground, ink text. The colour change is the
  signal to the presenter and the room: stop clicking, start an activity.
- Section dividers use ink ground with a giant scarlet module number; the
  module duration is a gold pill so the room can see "Module 3 — 15 min".

---

## Typography

| Tier | Use | Size (vw scaled) | Weight |
|---|---|---|---|
| `.title-xxl` | Cover hero | 7.2vw / 140px max | 900 |
| `.title-xl`  | Section divider, big stat label | 5.2vw / 96px max | 800 |
| `.title-lg`  | Slide title | 3.8vw / 68px max | 800 |
| `.title-md`  | Sub-headline | 2.4vw / 40px max | 700 |
| `.lede`      | Pull statement under title | 2.1vw / 36px max | 500 |
| `.subtitle`  | Supporting copy | 1.9vw / 32px max | 400 |
| body / list  | Bullets | 1.85vw / 30px max | 400 |
| `.eyebrow`   | Section / module label | 0.95rem | 700 |

Font stack: Inter as the preferred face, falling back to `Helvetica Neue`,
`-apple-system`, `BlinkMacSystemFont`, and `Segoe UI`. We do **not** load
a web font — the system stack guarantees the deck renders identically on
every Marine's laptop, with no font-flash during a Teams share. Visual
distinction comes from weight (900/800/700/500/400) and size scale, not
from a custom font.

Rules:

- Max two weights per slide.
- Tight tracking on display sizes (`-0.025em` on `.title-xxl`).
- Body line-height 1.35–1.45.
- Never centre body copy. Centre only big stats and quotes.

---

## Reusable slide layouts

Every slide is a `<section class="slide slide--<layout>">` containing a
`<div class="slide__bar">`, the slide content, an optional
`<aside class="notes">` for the speaker, and a `<div class="slide__foot">`
with the course tag and the slide number. The other five weekly decks
should reuse these layouts verbatim.

| Class | Purpose | When to use |
|---|---|---|
| `slide--cover` | Title / opener | First slide of every deck. |
| `slide--section` | Module divider with module number + duration pill | Once per module. |
| `slide--content` | Title + bullets workhorse | Most teaching slides. |
| `slide--two` | Two-column compare / before-after | 101 vs 201, two examples side-by-side. |
| `slide--stat` | One enormous number + supporting copy | Anchor a research finding. |
| `slide--quote` | Big pull statement | Once or twice per deck for emphasis. |
| `slide--image` | Half-image / half-copy hero | Section openers when an image earns its place. |
| `slide--exercise` | **Gold ground.** Activity instructions + timing | Whenever the room is doing something, not the presenter talking. |
| `slide--check` | Knowledge-check Q + reveal | Once per module, end of module. |
| `slide--debrief` | Side-by-side reveal of "what was wrong / what was right" | After exercises. |
| `slide--recap` | Three-cell takeaways grid | End of section, end of course. |
| `slide--grid` | Agenda + skill matrix | Agenda slide + six-skill overview. |
| `slide--closing` | Ink ground, big "where next" | Last slide. |

The layout taxonomy is the contract for the rest of the program. Weeks 2–6
must use these classes only — no new layouts unless the system is updated
and this note is updated with it.

### Allowed utilities

A small set of utility classes is provided for spacing fine-tuning. These
exist so slide HTML stays free of inline `style=""` attributes — keep it
that way.

| Class | Effect | When to use |
|-------|--------|-------------|
| `u-mt-1` | `margin-top: 1.4vh` | Tight gap between two body paragraphs in the same block. |
| `u-mt-2` | `margin-top: 2vh` | Standard gap before a follow-up `.lede`. |
| `u-mt-3` | `margin-top: 2.4vh` | Larger gap before a `.lede` or `.subtitle` that follows a heading group. |
| `u-mt-4` | `margin-top: 4vh` | Section-level gap (e.g. before a recap grid). |
| `u-text-mute` | `color: var(--c-text-mute)` | Single text element that should read as secondary. |
| `u-pct-small` | `font-size: 0.5em; font-weight: 700` | The `%` glyph next to a giant number. |

**Rule:** if you reach for a sixth utility, add a layout class to
`deck.css` and document it here instead. No `style="…"` in slide HTML.

---

## Required structure (every slide)

```html
<section class="slide slide--<layout>" id="slide-<n>">
  <div class="slide__bar"></div>

  <!-- slide-specific content -->

  <div class="slide__foot">
    <span class="foot__course">Course 1 · Week 1 · AI Fluency Fundamentals</span>
    <span class="foot__num"></span>
  </div>

  <aside class="notes">
    <p>What to say. What to emphasize. What to ask the room.
       Transition to next slide.</p>
  </aside>
</section>
```

`foot__num` is filled in automatically by `deck.js` (NN / TT). `notes` is
rendered to the floating panel when `N` is pressed and printed in the
print stylesheet for handout export.

---

## Speaker-notes voice

Speaker notes are a script the presenter reads, not a summary of the
slide. Every set of notes covers four things:

1. **Hook** — what to say to start.
2. **Emphasis** — the one phrase to land hard.
3. **Engagement** — a question to throw at the room (or, for exercise
   slides, the timing/cue).
4. **Bridge** — one sentence that connects this slide to the next.

Keep them under ~80 words. The presenter is reading peripherally while
talking; long blocks fail.

---

## Navigation contract (in deck.js)

| Key | Action |
|---|---|
| `→` / `Space` / `PgDn` / left-click | Next slide |
| `←` / `PgUp` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| Number + `Enter` | Jump to slide N |
| `N` | Toggle speaker-notes panel |
| `F` | Toggle fullscreen |
| `P` | Print / save as PDF (one slide per page + notes) |

The same controller works for every weekly deck. Do not fork it.

---

## File layout

```
docs/decks/
├── index.html                          ← landing page with deck cards
├── DESIGN.md                           ← this file
├── css/deck.css                        ← single canonical stylesheet
├── js/deck.js                          ← single canonical controller
├── week-1-ai-fluency.html              ← Week 1 (the design contract)
├── week-2-builder-orientation.html     ← Week 2
├── week-3-platform-training.html       ← Week 3
├── week-4-advanced.html                ← Week 4
├── week-5-supervisor.html              ← Week 5
└── week-6-fullstack.html               ← Week 6
```

Every deck links the same `css/deck.css` and `js/deck.js`. There are
**no per-deck stylesheets or controllers** — the previous `shared/`,
root `deck.css`, root `deck.js`, and `week-2/` directories were
removed when this contract was finalized.

---

## How weeks 2–6 share the canonical CSS

Each weekly deck declares its own body class so the canonical stylesheet
can apply per-week compatibility rules without cross-week interference:

| Week | `<body class="…">` | Notes |
|---|---|---|
| 1 | `deck-body` | Establishes the contract; rules are scoped to this class. |
| 2 | `w2-deck` | 1920×1080 fixed frame, JS-scaled. Compat layer in `deck.css`. |
| 3 | `w3-deck` | 1920×1080 fixed frame, JS-scaled. Compat layer in `deck.css`. |
| 4 | `w4-deck` | 1920×1080 fixed frame, JS-scaled. Compat layer in `deck.css`. |
| 5 | `w5-deck` | Self-scaling (CSS `aspect-ratio`); inline `<style>` for components. |
| 6 | `w6-deck` | Self-scaling (CSS `aspect-ratio`); inline `<style>` for components. |

Universal selectors (`.deck-chrome`, `.deck-notes`, `.notes`,
`.speaker-notes`, the `:root` palette tokens, and the universal
`@media print` block) are **unscoped** so every deck inherits them.

To create a new weekly deck:

1. Copy `week-1-ai-fluency.html` to `week-N-<slug>.html`.
2. Update `<title>` and the cover-slide eyebrow / title.
3. Update `slide__foot .foot__course` to the new course label.
4. Replace slide bodies; **keep the layout classes**.
5. Keep `<link rel="stylesheet" href="css/deck.css">` and
   `<script src="js/deck.js" defer></script>`.
6. Re-author the `<aside class="notes">` block on every slide.
7. Update `decks/index.html` to add the new deck card.
8. Add a deck link in the matching `docs/courses/<slug>.html` page.

If a new layout is genuinely needed, add it to `deck.css`, document it in
this file, then use it. No bespoke per-deck styles inside the HTML — the
whole point of this system is that the six decks look like one program.

---

## Print / Download as PDF

Every deck ships with a universal print stylesheet (in `css/deck.css`
under the `UNIVERSAL PRINT STYLESHEET` header) that lays out one slide
per page in landscape 16:9 (13.333" × 7.5") followed by its speaker
notes on the next page.

To export a deck:

1. Open the deck in Chrome or Edge.
2. Press `P` from inside the deck, or use **File → Print** /
   `Ctrl+P` / `Cmd+P`.
3. In the print dialog, set **Destination** to *Save as PDF*.
4. Set **Layout** to *Landscape*, **Margins** to *None*, and tick
   *Background graphics*.
5. Click **Save**.

There is no separate PDF file in the repository — the print stylesheet
generates the handout on demand from the live HTML.
