# QA Review Checklist

**EDD SOP — Appendix B — Phase 3: Quality Assurance**

The formal quality gate before deployment. All criteria must pass before the tool can ship. A qualified reviewer (SME, experienced developer, or supervisor) completes this checklist.

---

## Review Information

| Field           | Value |
|-----------------|-------|
| Tool Name       |       |
| Review Date     |       |
| Developer       |       |
| Reviewer        |       |

---

## 1. Functionality

| # | Criterion | Pass / Fail | Notes |
|---|-----------|-------------|-------|
| 1 | All required functions work as intended | | |
| 2 | Error handling is present for the obvious failure modes (empty input, bad data, network failure) | | |
| 3 | UI is intuitive for the target user — they can find the function without guidance | | |
| 4 | Performance is acceptable at expected data volumes | | |
| 5 | Outputs are accurate (verified against ground truth or hand calculation) | | |
| 6 | Tool handles realistic data volumes (not just the demo dataset) | | |

---

## 2. User Testing

| # | Criterion | Pass / Fail | Notes |
|---|-----------|-------------|-------|
| 1 | Minimum 3 users have tested the tool | | |
| 2 | User feedback was collected and documented | | |
| 3 | Critical feedback items have been addressed | | |
| 4 | Users can complete the core task independently — no developer hand-holding | | |

---

## 3. Documentation

| # | Criterion | Pass / Fail | Notes |
|---|-----------|-------------|-------|
| 1 | User Guide is complete and matches the deployed tool | | |
| 2 | Replication Guide is detailed enough that another developer could rebuild from scratch | | |
| 3 | Adaptation Guide identifies what can be changed and what must not | | |
| 4 | Maintenance Guide covers the obvious break/fix and update scenarios | | |
| 5 | Writing is clear — no unexplained jargon, no internal codenames without definition | | |
| 6 | Screenshots are current (match the deployed tool, not an old version) | | |

---

## 4. Compliance

| # | Criterion | Pass / Fail | Notes |
|---|-----------|-------------|-------|
| 1 | No unauthorized PII or PHI in prompts, training data, or storage | | |
| 2 | Tool runs on an approved platform per the EDD Approved Tools list | | |
| 3 | Required security controls are in place (auth, access, audit, encryption) | | |
| 4 | PIA completed if PHI / sensitive PII is handled | | |
| 5 | Data classification labels applied where required | | |
| 6 | No CUI in commercial (non-DoD) AI tool conversations | | |

---

## 5. Turnover Readiness

| # | Criterion | Pass / Fail | Notes |
|---|-----------|-------------|-------|
| 1 | Tool is registered in the organizational Tool Registry | | |
| 2 | A maintainer has been designated and acknowledged the role | | |
| 3 | Documentation is accessible to maintainer and target users (not on developer's personal drive) | | |
| 4 | Backup or rollback plan exists in case deployment goes wrong | | |
| 5 | Sunset criteria are documented — when should this tool be retired? | | |

---

## Review Result

- [ ] **Approved for deployment** — all criteria pass.
- [ ] **Revisions required** — list specific items below.

**Specific items requiring revision (if applicable):**

1.
2.
3.

**Reviewer signature:** _______________________   **Date:** ____________

---

_Template version 1.0 — Expert-Driven Development — UNCLASSIFIED_
