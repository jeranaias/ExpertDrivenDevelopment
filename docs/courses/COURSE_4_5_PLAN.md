# Course 4.5 Implementation Plan — Advanced Workshop (Locked Tenant Reality)

**Status:** Approved 2026-05-27. Branch: `course-4-5-locked-tenant-reality`. Source-of-truth template: Course 3.5.

## 0. Premise

Course 4.5 is to Course 4 what Course 3.5 was to Course 3: a sibling track that preserves the pedagogy (centaur/cyborg, deliberate-failure beat, frontier discipline, assessment rubric) while pivoting the execution layer off Power Platform and onto single-file static HTML deployable to MCEN-reachable free public hosting.

**Key divergence from 3.5:** 4.5 is a **two-tool world**. Both **genai.mil** (enterprise default since Jan 2026 MARADMIN) and **Ask Sage** (IL5/IL6/Top Secret authorized; Azure Gov hosted; 150+ LLMs including GPT-4o, GPT o-series reasoning, Claude 3, Gemini Pro; ingests DOCX/PDF/JSON/CSV; API + Continue.dev integration) are first-class. Tool-selection is itself a 201-level skill the course teaches.

Slug convention: `advanced-reality`. Asset slug prefix: `week-4-5-`. Body class on the deck: `w4-5-deck` (verify deck.css before commit 3; fall back to `w4-deck` if no namespace exists).

## 1. Pedagogy Mapping (Module-by-Module)

### Module 1: Frontier Mapping for Your Domain (30 min)
**Verdict: Minor pivot, ~80% survives.**

- Frontier Map example table: restore the **two-column** Tool Handles table. New columns: `genai.mil Handles` (fast chat, drafting, code snippets, single-shot prompts) vs `Ask Sage Handles` (multi-file ingestion, reasoning models for architecture, CSV/JSON dataset analysis, API-driven verification). Drop CamoGPT entirely.
- Issue Tracking Format table: rewrite to three static-stack issues. Include one tool-selection issue: "AI iterates 47 times on multi-file refactor in genai.mil chat | static HTML | Meta-frontier | Switch to Ask Sage with file ingestion + reasoning model."
- Data Handling Reminder callout: both genai.mil AND Ask Sage are CUI-authorized; github.io is world-public; PII anonymized; CUI-level unit context acceptable.
- Instructor Prerequisite Check callout: pivots from "build a SharePoint list" to "deploy a single-file static HTML tool to a github.io URL." Include "explain when to escalate from genai.mil to Ask Sage" as a fifth check.

Carries forward verbatim: 19pp BCG-Harvard drop callout, deliverable definition, Moving Frontier column.

### Module 2: Complex Build — Multi-Component System (60 min)
**Verdict: FULL REWRITE. Heaviest lift.**

Power BI Unit Readiness Dashboard becomes a single-file static HTML Readiness Dashboard with hand-rolled SVG bars (no external deps) and three JSON data blobs.

**Stack:** one `.html` file, ~900 lines. Self-contained. Hand-rolled SVG bar/donut chart (~80 lines JS). Three JSON data sources (training, equipment, personnel) pasted as text or loaded from `<script type="application/json">`. localStorage persistence. Print-friendly. UNCLASSIFIED banners. Body class `readiness-dashboard`.

**Phase structure (now with explicit tool-choice beats):**

- **Phase 1: Data Architecture (Centaur, 15 min, Ask Sage with reasoning model).** Upload the three sample CSVs to Ask Sage, use Claude 3 or GPT o-series to propose the join model with knowledge of the real schema. Verification: students name three edge cases (orphaned EDIPIs, NULL training records, equipment unassigned).
- **Phase 2: Data Ingestion + Joining (Cyborg, 15 min).** Students choose: paste-and-parse with genai.mil (fast iteration) **or** upload CSVs to Ask Sage and have it generate the join code with real schema knowledge. The **mode-switch beat now embeds a tool-switch beat.** Deliberate failure target: AI writes O(n²) `array.find()` join that stalls on sample data, OR writes JSON.parse without try/catch.
- **Phase 3: Visualization (Centaur, 20 min).** The SVG-vs-Chart.js teaching beat lands. Prompt asks for "horizontal bar chart by company." With Ask Sage reasoning models, "no external deps" constraint is more reliably honored when stated in system prompt; with genai.mil chat models it gets violated. **The contrast is the lesson** — reasoning models honor constraints, chat models drift.
- **Phase 4: Verification + Brief Generation (10 min).** Upload generated readiness CSV and source CSV to Ask Sage; ask it to find discrepancies. Real cross-check, not just spot-check. Generate Commander's Readiness Snapshot (plain text, mirrors TEEP's S-3 Brief pattern).

**Debrief (verbatim from Course 4 + one new question):** Where did you switch modes? Where did you switch **tools**? Where did AI fail? If you rebuilt, what differently? Time with vs without AI?

### Module 3: Group Debugging (40 min)
**Verdict: FULL REWRITE of scenarios. Protocol survives.**

Debugging Clinic Protocol (Student Presentation 2 min → Group Diagnosis 3 min → Instructor Synthesis 2 min → Document Pattern, 7 min/problem) survives verbatim. So does Final Synthesis. So does "if students don't bring broken tools, use these scenarios" framing.

**Five replacement scenarios** (Course 4 has 3; we add 2 to widen the failure surface, including the Ask-Sage-driven Scenario 5):

1. **Fetch race / double-submit** on a counseling-tracker static page. Root cause: AI's debounce wraps click handler but form has both click + submit handlers. Frontier: context (AI didn't know about parallel handlers).
2. **Stale localStorage after schema change.** Schema version mismatch across browser tabs. Frontier: frontier (AI doesn't reason about cross-tab consistency / schema migration).
3. **CSS specificity collision + timezone bug.** Two stacked bugs. Specificity: context. Timezone: frontier (AI consistently misses date-comparison TZ gotchas).
4. **Event delegation on dynamic content.** Per-element handlers re-attach on every render but stale handlers from in-flight clicks intercept. Frontier: frontier (AI fails to suggest delegation without explicit prompting).
5. **Tool-selection failure (NEW).** Student used genai.mil chat for a complex multi-file refactor when Ask Sage with file ingestion + reasoning model was correct. 47 prompt iterations, never converges. Diagnosis: wrong tool. Frontier: **meta-frontier** (knowing when to switch tools IS the 201-level skill).

Each scenario follows the `<details><summary>Answer Key</summary>` structure (root cause, diagnosis questions, solution, frontier classification). ~30-50 lines each.

### Module 4: Verification & QA (30 min)
**Verdict: ~90% survives.**

QA Checklist verbatim. Timed QA Review with planted-errors AI-generated SOP verbatim (it's Marine admin content, platform-agnostic).

**Add one new verification protocol:** "For high-stakes outputs, run the same prompt through both genai.mil AND Ask Sage with a reasoning model — disagreements are flags." This is a real protocol Marines should learn.

GDPval callout (7-hour task, 1.4x faster, 1.6x cheaper) stays verbatim.

### Module 5: Teaching Methodology / Teach-Back (30 min)
**Verdict: ~95% survives.**

Permission Gap, Apprentice Problem, Protocol for Junior Marines, Structured Teach-Back, Peer Evaluation rubric all carry forward.

Concept list adds two entries: **"Layer separation (Spec / Prototype / Production)"** (from 3.5) and **"Tool selection (genai.mil vs Ask Sage)"** (new in 4.5).

### Module 6: Workflow Playbook (30 min)
**Verdict: ~90% survives.**

Template and completion criteria carry forward. Template gains a **"Which tool"** column (genai.mil chat / Ask Sage + model / both).

Add a second worked example: **Weekly Readiness Rollup** — Frequency weekly, Mode Centaur, Tool Ask Sage + Claude 3, Steps include "Human: export rosters from MOL → Ask Sage: upload CSVs, ask Claude to compute deltas vs last week → Human: review, brief CO." Anchors the playbook in the Ask-Sage reality.

### Assessment Rubric
**Verdict: ~85% survives.** Six criteria platform-agnostic. Complex Build descriptors swap Power BI references for single-file HTML. 5-of-6 Meets threshold stays.

## 2. File Inventory (11 New Files)

| Path | Est. lines | Purpose |
|---|---|---|
| `courses/advanced-reality.html` | ~1050 | Main course page. Mirrors `platform-reality.html`. |
| `decks/week-4-5-advanced-reality.html` | ~1000 | 35-40 slide deck. Body class `w4-5-deck`. |
| `decks/links/week-4-5-advanced-reality.html` | ~280 | Chat-paste links partner. |
| `decks/week-4-5-cheatsheet.html` | ~340 | Two-page instructor cheat sheet. |
| `decks/week-4-5-handouts.html` | ~1100 | Chat-paste pack, ~16 blocks (incl. 2 new Ask-Sage CSV upload blocks). |
| `facilitator/week-4-5-advanced-reality.html` | ~300 | One-page landscape facilitator pack + URL sheet. |
| `handouts/week-4-5-advanced-reality.html` | ~200 | One-page landscape student take-home. |
| `handouts/advanced-reality-handout.html` | ~360 | Live fill-in handout (3-col fill cards, printable). |
| `builds/readiness-dashboard.html` | ~900 | Reference Build for Module 2. Static HTML + hand-rolled SVG charts + 3 JSON sources + localStorage. |
| `resources/debugging-scenarios.html` | ~500 | NEW resource. Five Module 3 scenarios as standalone reusable page. |
| `resources/tool-selection-guide.html` | ~280 | NEW resource. Decision tree: when to use genai.mil vs Ask Sage. |

No new CSS files. Reuse `style.css`, `deck.css`, `cheatsheet.css`, `handout.css`, `pack.css`.

## 3. File Edits (Surface Pass — mirrors commit 5d5bcd6)

| File | Edit |
|---|---|
| `docs/index.html` | Add Course 4.5 card to home grid after Course 4. ~22 lines. |
| `docs/courses/index.html` | Add Course 4.5 card + update Builder Path note. ~35 lines. |
| `docs/courses/student/index.html` | Add Course 4.5 card to student catalog. ~30 lines. |
| `docs/decks/index.html` | Add Week 4.5 row. ~17 lines. |
| `docs/handouts/index.html` | Add Week 4.5 row. ~11 lines. |
| `docs/facilitator/index.html` | Add Week 4.5 row. ~7 lines. |
| `docs/courses/advanced.html` | Add companion-course pointer to 4.5. ~3 lines. |
| `docs/resources/capability-gap-map.html` | Add Course 4.5 badge alongside 3.5 badge; mention 4.5 Module 6 in "How to Use." ~3 lines. |
| `docs/resources/static-hosting-cheat-sheet.html` | Add Course 4.5 badge alongside 3.5 badge. ~1 line. |

Total edits: 9 files, ~130 lines.

## 4. Sequencing (5 Commits)

| # | Commit | Files | Estimate |
|---|---|---|---|
| 1 | **Add Course 4.5: Advanced Workshop (Locked Tenant Reality)** | builds/readiness-dashboard.html, courses/advanced-reality.html, resources/debugging-scenarios.html, resources/tool-selection-guide.html, handouts/advanced-reality-handout.html | Day 1 |
| 2 | **Course 4.5 polish pass** | Polish on above after self-review | Day 1-2 |
| 3 | **Add Week 4.5 slide deck and links partner** | decks/week-4-5-advanced-reality.html, decks/links/week-4-5-advanced-reality.html, courses/advanced-reality.html button add | Day 2 |
| 4 | **Week 4.5: cheatsheet, facilitator pack, handouts pack, multi-page student handout** | decks/week-4-5-cheatsheet.html, decks/week-4-5-handouts.html, facilitator/week-4-5-advanced-reality.html, handouts/week-4-5-advanced-reality.html | Day 2-3 |
| 5 | **Surface Course 4.5 across all six index pages** | 6 index pages + 3 reciprocal edits | Day 3 |

## 5. Voice & Style Constraints

- **No em-dashes.** Replace with periods, commas, restructure. Build them out from the start.
- **No CamoGPT.** Dead post-MARADMIN.
- **Both genai.mil AND Ask Sage are first-class.** Tool selection is itself a teachable skill. Note in course intro: "this course assumes access to both. If your tenant only has genai.mil, Ask Sage phases degrade gracefully to paste-and-summarize."
- **No Power Platform-specific prompts.** No Power Fx, DAX, M, Power Automate JSON, Integrate button, SharePoint connectors.
- **CSS reuse only.** No new stylesheets. Inline `<style>` page-specific tweaks following the `wk4-handouts`-style body-class pattern.
- **CUI guidance:** both genai.mil and Ask Sage are CUI-authorized. github.io is world-public the moment the repo is public. PII anonymized. CUI-level unit context (unit name, T&R refs, approval chain) acceptable.
- **UNCLASSIFIED banners** top and bottom of reference builds.
- **Print-friendly** every reference build, handout, facilitator pack.
- **100% offline after page load** for reference builds. No CDN, no external fonts, no external scripts.
- **No AI attribution** in commits per CLAUDE.md.

## 6. Open Questions (All resolved)

1. Module 2 build: **Readiness Dashboard** (preserves Course 4 parallel). ✓
2. Chart library: **Hand-rolled SVG**, becomes teaching beat. ✓
3. Module 3 scenarios: **Canned 5 scenarios + bring-your-own option.** ✓
4. PPTX: **Ships without PPTX** (matches 3.5 current state). ✓
5. Slug: `advanced-reality`. ✓
6. Tool-selection guide: **Separate resource file** (reusable beyond course). ✓
7. Body class: verify deck.css before commit 3. ✓

## 7. Critical Files (in build order)

1. `builds/readiness-dashboard.html` — highest stakes, Module 2 lives or dies here
2. `courses/advanced-reality.html` — canonical course page
3. `resources/debugging-scenarios.html` — Module 3 backbone
4. `resources/tool-selection-guide.html` — new 4.5-only artifact
5. `handouts/advanced-reality-handout.html` — live fill-in
6. `decks/week-4-5-advanced-reality.html` — student-facing deck
7. `decks/week-4-5-handouts.html` — instructor live-use pack
8. `decks/week-4-5-cheatsheet.html`
9. `facilitator/week-4-5-advanced-reality.html`
10. `handouts/week-4-5-advanced-reality.html`
11. `decks/links/week-4-5-advanced-reality.html`
