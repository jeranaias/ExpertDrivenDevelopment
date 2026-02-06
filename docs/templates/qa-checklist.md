# Quality Assurance Review Checklist

*Expert-Driven Development SOP — Appendix B*

---

## Review Information

| Field          | Entry |
|----------------|-------|
| **Tool Name**  |       |
| **Date**       |       |
| **Developer**  |       |
| **Reviewer**   |       |

---

## Reviewer Qualification

*The reviewer must meet at least one of the following criteria:*

- [ ] Subject matter expert in the tool's functional domain
- [ ] Experienced developer with relevant technical background
- [ ] Designated QA reviewer within the organization
- [ ] Supervisor or team lead with oversight responsibility

**Reviewer qualification basis:** _______________________________________________

---

## 1. Functionality

| #   | Criterion                                                        | Pass | Fail | N/A | Notes |
|-----|------------------------------------------------------------------|------|------|-----|-------|
| 1.1 | All required functions listed in the Problem Definition work as intended |      |      |     |       |
| 1.2 | Error handling is in place (invalid inputs, missing data, edge cases)    |      |      |     |       |
| 1.3 | User interface is intuitive and requires minimal training               |      |      |     |       |
| 1.4 | Performance is acceptable (response times, processing speed)            |      |      |     |       |
| 1.5 | Outputs are accurate and formatted correctly                            |      |      |     |       |
| 1.6 | Tool handles expected data volumes without degradation                  |      |      |     |       |

---

## 2. User Testing

| #   | Criterion                                                        | Pass | Fail | N/A | Notes |
|-----|------------------------------------------------------------------|------|------|-----|-------|
| 2.1 | Minimum of 3 representative users have tested the tool                  |      |      |     |       |
| 2.2 | User feedback has been collected and documented                         |      |      |     |       |
| 2.3 | Critical feedback items have been addressed                             |      |      |     |       |
| 2.4 | Users can complete core tasks without developer assistance              |      |      |     |       |

**User Testers:**

| #  | Name | Role / Team | Date Tested | Feedback Summary |
|----|------|-------------|-------------|------------------|
| 1  |      |             |             |                  |
| 2  |      |             |             |                  |
| 3  |      |             |             |                  |

---

## 3. Documentation

| #   | Criterion                                                        | Pass | Fail | N/A | Notes |
|-----|------------------------------------------------------------------|------|------|-----|-------|
| 3.1 | **User Guide** is complete (purpose, access, how-to, FAQ)              |      |      |     |       |
| 3.2 | **Replication Guide** is complete (architecture, rebuild steps, prompts)|      |      |     |       |
| 3.3 | **Adaptation Guide** is complete (modification guidance, parameters)   |      |      |     |       |
| 3.4 | **Maintenance Guide** is complete (issues, updates, turnover)          |      |      |     |       |
| 3.5 | All documentation is written clearly for the intended audience         |      |      |     |       |
| 3.6 | Screenshots and examples are current and accurate                      |      |      |     |       |

---

## 4. Compliance

| #   | Criterion                                                        | Pass | Fail | N/A | Notes |
|-----|------------------------------------------------------------------|------|------|-----|-------|
| 4.1 | No unauthorized PII is collected, stored, or displayed                 |      |      |     |       |
| 4.2 | No unauthorized PHI is collected, stored, or displayed                 |      |      |     |       |
| 4.3 | Tool is deployed on an approved platform                               |      |      |     |       |
| 4.4 | Appropriate security controls are implemented                          |      |      |     |       |
| 4.5 | Privacy Impact Assessment (PIA) completed (if required)                |      |      |     |       |
| 4.6 | Data handling aligns with organizational policies                      |      |      |     |       |

---

## 5. Turnover Readiness

| #   | Criterion                                                        | Pass | Fail | N/A | Notes |
|-----|------------------------------------------------------------------|------|------|-----|-------|
| 5.1 | Tool is registered in the Tool Registry                                |      |      |     |       |
| 5.2 | A current maintainer has been designated                               |      |      |     |       |
| 5.3 | Documentation is stored in an accessible, shared location              |      |      |     |       |
| 5.4 | Maintainer has reviewed documentation and can support the tool         |      |      |     |       |
| 5.5 | Backup or contingency plan exists if the tool becomes unavailable      |      |      |     |       |

---

## Review Result

**Overall Result:**

- [ ] **Approved** — Tool meets all criteria and is cleared for deployment.
- [ ] **Revisions Required** — Tool must address the items below before re-review.

---

## Required Revisions

*If revisions are required, list each item that must be corrected before the tool can be approved.*

| #  | Item | Section Ref. | Description of Required Revision | Date Resolved |
|----|------|--------------|----------------------------------|---------------|
| 1  |      |              |                                  |               |
| 2  |      |              |                                  |               |
| 3  |      |              |                                  |               |
| 4  |      |              |                                  |               |
| 5  |      |              |                                  |               |

---

## Reviewer Approval

| Field              | Entry |
|--------------------|-------|
| **Reviewer Name**  |       |
| **Signature**      |       |
| **Date**           |       |

---

*This checklist must be completed and signed before any tool is deployed to production use. Retain as part of the tool documentation package.*
