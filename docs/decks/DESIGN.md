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
should use these classes by preference; the per-week extensions below are
recognised forks where genuinely different content earned a new layout.

### Per-week layout extensions (W2-W6 forks)

These layouts were created in the original per-week decks before the
canonical taxonomy stabilised. They live in `deck.css` under their week's
`body.wN-deck` scope. New decks should not add to this list — promote a
genuinely new layout to the canonical table above instead.

| Week | Class | Purpose |
|---|---|---|
| W2 | `slide--live-build` | Pre-live-build framing slide (rules + tooling, before presenter switches to GenAI.mil). |
| W2 | `slide--live-park` | "Parking" screen visible while presenter is in the build window. |
| W2 | `slide--breaks` | "When something breaks" three-slide debug-loop sequence. |
| W2 | `slide--checkpoint` | Return-from-build debrief framing. |
| W2 | `slide--knowledge` | Module-end knowledge check (W2 variant of `slide--check`). |
| W2 | `slide--break` | Hard 10-minute break screen. |
| W4 | `slide--workshop` | Hard timeboxed workshop activity (15-min build, etc.). Gold ground. |
| W4 | `slide--shareout` | Post-workshop share-out / synthesis slide. |
| W4 | `slide--cue` | "Switch to your tool now" hand-off slide, sister to W2 `slide--live-park`. |
| W4 | `slide--reference` | Reference-card slide (large data table or matrix). |
| W4 | `slide--facilitation` | Instructor-facing facilitation block. |
| W4 | `slide--break` | Hard break screen (W4 variant). |
| W5 | `cover` (no `slide--` prefix) | W5 cover; predates the canonical naming. |
| W5 | `divider` | W5 module divider. |
| W5 | `closing` | W5 closing slide. |
| W6 | `slide--build` | Build-module framing (10 modules in W6 cycle). |
| W6 | `slide--editor` | "Switch to editor" hand-off (W6 variant of W2 `slide--live-park`). |
| W6 | `slide--break` | Lunch / mid-day break (W6). |

### Week 3 alternative naming

Week 3 uses an `layout-*` prefix instead of `slide--*` for every layout
class (`layout-cover`, `layout-content`, `layout-two`, `layout-section`,
`layout-frame`, `layout-switch`, `layout-debrief`, `layout-quiet`,
`layout-break`, `layout-agenda`, `layout-worktime`, `layout-preview`,
`layout-closing`). This was the historical naming when W3 was first
authored. **The class names are retained for legacy reasons; future decks
should use the canonical `slide--*` prefix.** The CSS for each
`layout-*` class lives under `body.w3-deck` in `deck.css`.

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
| `code-chip` | Inline `<code>` chip on light grounds | Tool / file / command names in body copy (replaces W6 inline `<code style>` pattern). |
| `code-chip--gold` | Gold-on-dark variant of `code-chip` | Inline code on the W6 editor cue / build banner (ink ground). |
| `agenda-pill` | Compact uppercase muted timing pill | Agenda-slide timing markers (e.g. "15 min · talking"). |
| `agenda-pill--hot` | Scarlet bold variant of `agenda-pill` | Live-build / hands-on agenda rows. |
| `eyebrow--scarlet` | Scarlet-tinted `.eyebrow` modifier | Column headers and small-caps section labels in W2/W3. |
| `sr-only` | Screen-reader-only utility (clip + abs-position) | Live-region announcement targets and off-screen labels. |

The canonical utility classes (`u-mt-*`, `u-text-mute`, `u-pct-small`)
are now unscoped so every weekly deck can use them. Helper classes
introduced for specific decks (`code-chip`, `agenda-pill`,
`eyebrow--scarlet`) are also unscoped — promote any pattern that hits
≥3 occurrences across decks to a class here instead of inlining it.

**Rule:** if you reach for a sixth utility for a one-off, add a layout
class to `deck.css` and document it here instead. No `style="…"` in
slide HTML beyond the absolute one-off (target: <10 inline `style=""`
attributes per deck).

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

### Multi-mode speaker notes (W5 pattern)

Week 5 ships in two delivery modes — a 30-minute leadership briefing or
an extended joint session — from the same deck. To support both without
forcing the presenter to switch decks, each W5 slide's `<aside class="notes">`
contains three labelled blocks:

```html
<aside class="notes">
  <div class="notes-mode notes-mode--briefing">
    <span class="tag">Briefing — 30 min</span>
    <p>What to say in the short briefing.</p>
  </div>
  <div class="notes-mode notes-mode--joint">
    <span class="tag">Joint Session — extended</span>
    <p>What to say if builders are in the room.</p>
  </div>
  <div class="notes-mode notes-mode--transition">
    <span class="tag">Transition</span>
    <p>One sentence into the next slide.</p>
  </div>
</aside>
```

The `.notes-mode--briefing | --joint | --transition` modifier classes
control the colour-coded left border (scarlet / gold / grey) so the
presenter can scan and pick the right block live. Print rendering is
handled by the universal print stylesheet — each block becomes a
colour-tinted boxed paragraph below its slide thumbnail in the PDF
handout.

Other weekly decks should not adopt this pattern unless they ship in
multiple delivery modes; the canonical four-bullet hook/emphasis/
engagement/bridge prose is the default.

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

---

## Accessibility

The deck system is built for sighted, mouse/keyboard, screen-reader,
and reduced-motion users alike. The contract:

- **Visible focus rings.** Every interactive element in the deck chrome
  (`.deck-chrome button, .deck-chrome a`) gets a 3px gold focus ring on
  `:focus-visible`. Don't override this in per-week styles.
- **Reduced motion.** A global `@media (prefers-reduced-motion: reduce)`
  block in `deck.css` collapses every `animation-duration` and
  `transition-duration` to ~0ms. New animations should respect this
  automatically; if a transition is decorative, no extra work is needed.
- **Live region for slide changes.** `deck.js` injects a hidden
  `<div id="deck-announce" class="sr-only" aria-live="polite">` inside
  the deck chrome on init. Every call to `show(i)` writes
  `Slide N of T, <slide title>` into it so screen-reader users hear a
  spoken announcement on every navigation.
- **`.sr-only` utility.** Standard clip + position-absolute pattern,
  available globally in `deck.css`. Use it for off-screen labels and
  live-region targets; don't reach for `display:none` (which AT skip).
- **Slide titles.** Every slide should have a heading or a `data-title`
  attribute so the live region has something useful to announce.
