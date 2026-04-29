# EDD Curriculum Quality Audit

**Date:** 29 April 2026
**Scope:** `TRAINING_CURRICULA_v5.md` (master), six instructor course pages in `docs/courses/`, five student companion pages in `docs/courses/student/`, plus the supporting plumbing (`certificate.html`, `progress.html`, `sop/index.html`, `js/`, `templates/`).
**Method:** Structured walkthrough of every page; rubric scoring against eight dimensions; cross-link / progress-tracking / JS-integration check; reconciliation of doctrine drift between the master markdown and the live site.

Severity legend: **[BLOCKER]** ships-stopper, **[MAJOR]** must-fix before deck production, **[MINOR]** quality issue worth fixing this pass, **[NIT]** stylistic / future polish.

---

## Ship List (top of doc)

These are the items that were applied in this audit pass before the six downstream deck tasks proceed:

1. **[BLOCKER] Broken prerequisite link.** `docs/courses/orientation.html:73` linked to a non-existent `fundamentals.html`. Course 1's actual file is `ai-fluency.html`. Any user clicking the prerequisite link from the Builder Orientation page received a 404. **Fixed.**
2. **[BLOCKER] Course 6 missing from progress + certificate machinery.** `progress.html` and `certificate.html` both hard-coded a five-course `COURSES` array. Students who completed `student/fullstack.html` had no way to see their progress or generate a certificate. The credential pathway diagram on `progress.html` also stopped at Course 4. **Fixed** (Course 6 added to both arrays; the pathway now extends through Full-Stack as a Bonus capstone).
3. **[BLOCKER] Student Full-Stack page had no completion checklist.** Every other student companion (`ai-fluency`, `orientation`, `platform`, `advanced`) carried both a `course-checklist` and a `knowledge-check` block. `student/fullstack.html` shipped only the JS includes — there was nothing for the checklist or quiz engines to bind to, so the course could never be marked complete and never produced a certificate. **Fixed** (added a 10-item completion checklist mirrored to the course's modules + a 6-question end-of-course knowledge check covering the Six Principles and the Cyborg pattern).
4. **[MAJOR] v5 master doc says "Five Courses"; site has six.** `TRAINING_CURRICULA_v5.md` and `docs/sop/index.html` both describe the program as five courses, but the live site adds Course 6: Full-Stack AI-Assisted Development as a Bonus capstone. **Reconciled** — see *Reconciliation* section below; the master MD now carries a v5.1 history entry that explicitly records Course 6 as a Bonus addition, headline counts updated, and the SOP page section 8 updated to "six courses (five core plus one Bonus capstone)."
5. **[MAJOR] SOP section 8 referenced a now-stale course count.** `docs/sop/index.html:1078` said *"five courses organized by audience and prerequisite chain."* **Fixed** to reflect the six-course structure with Course 6 as a Bonus capstone.

Items deferred (out of scope for this task / queued for follow-up):

- Regenerating the LaTeX/PDF artifacts in `docs/pdf/` to match the markdown change (`TRAINING_CURRICULA_v5.tex`, `SOP_Expert_Driven_Development_v5.tex`, `EDD_Executive_Brief.tex`, `EDD_RAI_Compliance_Brief.tex`). These are downstream artifacts and the source-of-truth `.md` is now correct.
- Building a Supervisor student companion (`student/supervisor.html`). Today the supervisor course exists only as a 30-minute instructor brief and is taken live; the audit treats this as an intentional design decision and not a defect, but flags it for future consideration.
- Adding instructor-side knowledge checks to `ai-fluency.html`, `orientation.html`, `platform.html`, `advanced.html`, and `fullstack.html`. The instructor pages currently rely on Exit Tickets (paper) and live build checkpoints; only `supervisor.html` has live KCs. This is a coherent design choice (instructor pages are scripts; student pages carry the auto-graded checks) and not a defect.

---

## Reconciliation: "Five Courses" (v5 markdown) vs. Six Courses (site)

The v5 master markdown describes the program as five courses (lines 6, 8, 118, 122, 661, 679, etc.). It was published February 2026. The live site adds a sixth course — Full-Stack AI-Assisted Development — as a Bonus capstone behind the four-course Builder Path. Course 6 is not a replacement for Course 4; it is an elective beyond it for builders whose problems exceed the Power Platform envelope.

**Decision (this audit):** rather than remove Course 6 from the site or freeze the master MD, the master doc is updated to acknowledge Course 6 as a v5.1 Bonus addition. Specifically:

- The "Five Courses, One Goal" section becomes "Six Courses, One Goal" with a brief Bonus row added to the table.
- Body copy that introduces the program is updated from "five courses" to "six courses" (or "five core courses plus one Bonus capstone" where the distinction matters).
- A new v5.1 row is appended to the Document History table explaining the Bonus addition.
- The full Course 6 syllabus remains on the site (`docs/courses/fullstack.html` and `docs/courses/student/fullstack.html`) — it is not duplicated into the master MD because the per-module instructor script is large and lives more naturally on the web. The MD's table-level summary is sufficient.
- The PDFs in `docs/pdf/` are out of scope for this task and remain at v5.0; they are downstream artifacts and will be regenerated separately.

This keeps the master MD authoritative on framework and counts, while letting the site carry the expanded capstone material.

---

## Cross-cutting findings

| # | Severity | Finding | Disposition |
|---|----------|---------|-------------|
| C1 | BLOCKER | `orientation.html:73` → `fundamentals.html` (404) | Fixed → `ai-fluency.html` |
| C2 | BLOCKER | `progress.html` `COURSES` array missing `fullstack-student` | Fixed (added entry, pathway extended) |
| C3 | BLOCKER | `certificate.html` `COURSES` array missing `fullstack-student` | Fixed (added entry) |
| C4 | BLOCKER | `student/fullstack.html` had no checklist or KC despite loading the JS | Fixed (added both) |
| C5 | MAJOR  | Master MD says "Five Courses" throughout | Fixed (count updated, history entry added) |
| C6 | MAJOR  | SOP page section 8 says "five courses" | Fixed |
| C7 | MINOR  | Bonus PDFs (`docs/pdf/*.tex`) still say "five courses" | Deferred — regenerable artifact, out of scope |
| C8 | MINOR  | No `student/supervisor.html` companion exists | Intentional — supervisor course is a 30-min live brief; flagged for future |
| C9 | MINOR  | `templates/` directory exists but the prior explore mistakenly reported it empty — five MD templates are in fact present (`development-journal`, `documentation-package-outline`, `problem-definition`, `qa-checklist`, `tool-registry-entry`). They are referenced from course bodies but not surfaced by `resources/templates.html`. | No change this pass; the templates exist and are correct. Surfacing is a separate UX item. |
| C10 | NIT   | `data-correct` attributes are scrubbed at runtime by `knowledge-check.js`, but the source is still readable to anyone who opens View Source. The JS file documents this as an accepted limitation and the 80% pass threshold + 2-minute submission gate + cooldown raise the bar above casual cheating. No action. | Documented |
| C11 | NIT   | `student/orientation.html:717` and `:722` link to `platform.html` and `advanced.html` from inside the `student/` directory — these are correct relative paths to the student companions, but a reader scanning the source might misread the target. Adding `student/` prefixes would make intent explicit. No action this pass. | Documented |

---

## Per-course rubric

Each course is scored on eight dimensions. Pass = meets bar for the audience and stage of the EDD program. Issues are tagged with severity.

### Course 1 — AI Fluency Fundamentals (`ai-fluency.html` + `student/ai-fluency.html`)

| Dimension | Score | Notes |
|---|---|---|
| Objectives | Pass | Six 201 skills, jagged frontier, centaur/cyborg, quality judgment — clearly stated up front, audience explicit ("all personnel"), no tool-building scope creep. |
| Structure & timing | Pass | 2 hours, six modules, agenda table on instructor page mirrors the v5 master. Module timings sum correctly. |
| Pedagogy | Pass | Red Pen Review (Module 4) is the keystone exercise and is preserved on both instructor and student pages. Mollick delegation equation introduced in Module 3. Centaur/cyborg in Module 5. |
| Accuracy | Pass | Research citations (Microsoft 80%, Dell'Acqua/BCG, Stanford/MIT, GDPval, UK Government, Mollick) match Appendix E of v5 master. DoW context (MARADMIN 018/26-style framing, January 2026 AI Strategy) consistent with master. |
| Audience fit | Pass | Instructor page has Say:/Ask:/Instructor note: blocks; student companion paraphrases without those scaffolds. Tone is plain-language, no jargon dropped without definition. |
| Assessments | Pass | Instructor: paper Exit Ticket (3 questions). Student: 18-question knowledge check across all six modules + 80% pass threshold. |
| Accessibility | Pass | Skip-link present, ARIA labels on nav, semantic headings, table captions where needed, contrast meets the site's overall design tokens. |
| Continuity | Pass | Closes with explicit handoff to Builder Orientation; references the same six-skill vocabulary used downstream. |

No blocker/major findings for Course 1.

### Course 2 — Builder Orientation (`orientation.html` + `student/orientation.html`)

| Dimension | Score | Notes |
|---|---|---|
| Objectives | Pass | "Move from user to builder" — clear, narrow, aligned with v5 master. |
| Structure & timing | Pass | 2 hours, five modules, buffer included, totals 120 min. Mirrors master. |
| Pedagogy | Pass | Live Equipment Tracker build (Module 2) + student build with peer review (Module 3) + decomposition framework (Module 4). The decomposition module is correctly identified as the make-or-break moment. |
| Accuracy | Pass | Build steps and prompt examples match what the platform actually produces; no fabricated capabilities. |
| Audience fit | Pass | Instructor page is heavy on "circulate, do not solve" guidance. Student companion is rewritten for self-paced reading. |
| Assessments | Pass on student side (15-question KC across five modules); instructor side relies on the live build itself as assessment. |
| Accessibility | Pass | Same baseline as Course 1. |
| Continuity | **[BLOCKER → Fixed]** | The Prerequisite link at line 73 pointed to `fundamentals.html`, which does not exist. Now points to `ai-fluency.html`. |

### Course 3 — Platform Training (`platform.html` + `student/platform.html`)

| Dimension | Score | Notes |
|---|---|---|
| Objectives | Pass | Hands-on Power Platform: SharePoint list, Power App, Power Automate flow. Three guided builds. |
| Structure & timing | Pass | The agenda is large (2,028 lines on the instructor page) but each module has explicit duration and the timings are consistent. |
| Pedagogy | Pass | Build #1 walked, Build #2 paired, Build #3 independent — classic I/We/You progression. The frontier-map update at the end is real deliverable, not busywork. |
| Accuracy | Pass | Step-by-step Power Platform UI references match current Microsoft naming as of the doc date. The validation logic example for the Leave Request form (boundary condition at exactly $500 / exactly the policy threshold) is a genuinely useful real-world bug class. |
| Audience fit | Pass | Instructor page contains screenshots and Say:/Ask: blocks; student page is self-paced. Both clearly assume Course 1 and 2 are complete. |
| Assessments | Pass | Student page carries an 18-question KC plus a completion checklist; instructor page uses build checkpoints. |
| Accessibility | Pass | Tables have headers, code blocks have copy buttons, images have alt text. |
| Continuity | Pass | Hands off cleanly to Advanced Workshop; references the same six 201 skills. |

### Course 4 — Advanced Workshop (`advanced.html` + `student/advanced.html`)

| Dimension | Score | Notes |
|---|---|---|
| Objectives | Pass | Move from individual to organizational capability. Frontier maps + workflow playbooks as deliverables (matches v5 master Appendix D template). |
| Structure & timing | Pass | 4 hours, six modules, break in the middle. Timings consistent. |
| Pedagogy | Pass | Timed QA review with five planted errors (fabricated reference, inconsistent timeline, bad numbers, etc.) is a strong calibration exercise. The 60-Second Teach exercise correctly used to identify future instructors. |
| Accuracy | Pass | Apprentice Problem statistics (entry-level postings down 35%, ages 22–25 down 13%) match the v5 master's Appendix E. |
| Audience fit | Pass | Explicitly requires at least one deployed tool; assumes section-leader-grade audience. |
| Assessments | Pass | Student page carries a 15-question KC + capstone (workflow playbook deliverable). |
| Accessibility | Pass | Same baseline. |
| Continuity | Pass | Sets up Course 6 as the optional next step for builders whose problems exceed Power Platform. |

### Course 5 — Supervisor Orientation (`supervisor.html`, no student companion)

| Dimension | Score | Notes |
|---|---|---|
| Objectives | Pass | Permission culture, evaluation framework, apprentice problem. The "highest-leverage 30 minutes" framing is preserved. |
| Structure & timing | Pass | Five modules totalling 30 minutes. |
| Pedagogy | Pass | Each module has a knowledge check (3 questions × 5 modules = 15 KC questions), unique among the instructor pages. The four evaluation questions are stated cleanly and are usable in the field. |
| Accuracy | Pass | Mollick "permission gap," DoW AI Strategy framing, Microsoft 80%, UK 25-min/day all consistent with master. |
| Audience fit | Pass | Tone is direct, supervisor-grade, no scaffolding. The "default answer should be yes, with appropriate review" line is the operative takeaway. |
| Assessments | Pass | Inline KCs replace a separate companion. |
| Accessibility | Pass | Same baseline. |
| Continuity | **[MINOR — flagged]** | No `student/supervisor.html` companion. Treated as intentional (the course is a 30-minute live brief) but worth a future consideration if supervisors ask for a self-paced version. |

### Course 6 — Full-Stack AI-Assisted Development (`fullstack.html` + `student/fullstack.html`)

| Dimension | Score | Notes |
|---|---|---|
| Objectives | Pass | "Direct AI to write code for you, verify, iterate." Six Principles enumerated (Conversation is the IDE, Scaffold→Flesh Out→Integrate, 3-Minute Rule, Incremental Deployment, Interface-First, plus the sixth in body). |
| Structure & timing | Pass | 8 hours, ten modules + assessment. Heavy course but the agenda is segmented and each module is self-contained. |
| Pedagogy | Pass | Builds an actual deployable Go + React + Docker app (Heywood TBS exemplar). The 3-Minute Rule is a useful guardrail against premature manual debugging of AI code. |
| Accuracy | Pass | Code examples are realistic; no claims about AI capability that exceed what current frontier models can do; the cloud-deployment path (Azure Container Apps) is tractable. |
| Audience fit | Pass | Explicitly Bonus / Elective; prerequisites include Advanced Workshop and at least one deployed tool. Reader is assumed to be already builder-fluent. |
| Assessments | **[BLOCKER → Fixed]** | The student page loaded `knowledge-check.js` and `course-progress.js` but had no checklist and no quiz block to bind to. Course was un-completable. **Fixed:** added a 10-item completion checklist (one item per module + capstone) and a 6-question Knowledge Check covering the Six Principles, the 3-Minute Rule, the Cyborg pattern at full-stack scale, and the deployment philosophy. |
| Accessibility | Pass | Same baseline; new KC and checklist follow the same pattern as the other student pages and inherit the same ARIA semantics. |
| Continuity | **[BLOCKER → Fixed]** | Course was structurally absent from `progress.html` and `certificate.html`. **Fixed:** Course 6 added to both `COURSES` arrays and to the credential pathway diagram. |

---

## Plumbing audit (cross-page)

### Knowledge-check JS (`docs/js/knowledge-check.js`)

- 80% pass threshold, 2-minute minimum-time gate, 30-second cooldown after a failed attempt, attempt history persisted under `edd_kc_attempts_{courseId}`.
- Anti-cheat: correct-answer indices are read from the DOM at init then `removeAttribute('data-correct')` is called; feedback HTML is captured and blanked until submission. Documented limitation: View Source still exposes answers.
- Dispatches a `edd-kc-pass` `CustomEvent` on success — used by `course-progress.js` to auto-tick the "Knowledge Check" checklist row.
- **No issues.**

### Course-progress JS (`docs/js/course-progress.js`)

- Reads `.course-checklist[data-course="..."]` blocks; persists state to `edd_checklist_{courseId}` as `{moduleId: bool}`.
- Auto-checks modules via `IntersectionObserver` as the user scrolls past — useful but not authoritative; final state always requires user action on the checkbox.
- Renders a progress bar and reveals the "Course Complete" callout when all items are checked.
- **No issues.**

### Certificate page (`docs/courses/certificate.html`)

- Hard-coded `COURSES` array. **[BLOCKER → Fixed]** Added `fullstack-student`.
- Generates a deterministic certificate ID (DJB2 hash of name + course + date), prints landscape letter, includes MCD-Monterey footer.
- **No remaining issues.**

### Progress dashboard (`docs/courses/progress.html`)

- Hard-coded `COURSES` array. **[BLOCKER → Fixed]** Added `fullstack-student` as Course 6.
- Pathway diagram. **[BLOCKER → Fixed]** Extended to include Course 6 as a Bonus branch off Advanced Workshop.
- Aggregates best KC score per course; exports a plain-text training record.
- **No remaining issues.**

### Templates (`docs/templates/`)

Five MD templates, all referenced from course bodies:

- `development-journal.md` — running notes for builds.
- `documentation-package-outline.md` — what a final tool documentation package looks like.
- `problem-definition.md` — pre-build problem framing.
- `qa-checklist.md` — used in Advanced Workshop Module 3.
- `tool-registry-entry.md` — for publishing tools to the registry.

Templates are content-correct and cited from the courses; no defects this pass.

### User identity JS (`docs/js/user-identity.js`)

- Stores `edd_user` in localStorage; offers a clear-profile control that nukes `edd_user`, all `edd_checklist_*`, and all `edd_kc_*` keys with explicit confirmation.
- **No issues.**

### Enhancements JS (`docs/js/enhancements.js`)

- Back-to-top, reading progress bar, copy buttons on code/prompt blocks. **No issues.**

---

## Verification (post-fix)

After applying the blocker/major fixes:

- All inter-course links resolve (no remaining references to a nonexistent `fundamentals.html`).
- `progress.html` and `certificate.html` recognize all six courses.
- `student/fullstack.html` is now structurally complete (checklist + KC), so a student can finish Course 6 and pull a certificate.
- The master MD and SOP page agree with the site on the course count.
- The site continues to serve cleanly via the Replit workflow on port 5000; no regressions observed in `knowledge-check.js`, `course-progress.js`, or `certificate.html` JS.

The six downstream deck tasks can proceed.
