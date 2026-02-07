<div align="center">

<h1>Expert-Driven Development</h1>
<h3>Open-Source AI-Assisted Development Training for DoW Personnel</h3>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Classification](https://img.shields.io/badge/Classification-UNCLASSIFIED-green.svg)](#classification)
[![Docs](https://img.shields.io/badge/docs-live-blue.svg)](https://jeranaias.github.io/ExpertDrivenDevelopment/)

[**View Training Site**](https://jeranaias.github.io/ExpertDrivenDevelopment/) | [**Read the SOP**](pdf/SOP_Expert_Driven_Development_v5.pdf) | [**Download PDFs**](pdf/)

</div>

---

## Overview

Expert-Driven Development (EDD) is a methodology that teaches domain experts to build institutional software using AI as scaffolding, not as an end-state dependency. It is designed for military instructors, staff NCOs, officers, and DoW civilians who have real problems to solve but no coding background. This repository contains the complete training curriculum (five courses covering every role from first-time AI users to experienced builders to supervisors), the Standard Operating Procedure, an interactive toolkit, and downloadable templates. Everything here is open-source, unclassified, and ready to use.

## The Problem

Domain experts understand their problems better than anyone, but they cannot build the solutions themselves. Traditional software development requires contractors, months of lead time, and significant budgets. The people closest to the problem remain disconnected from the tools that could solve it.

## The Solution

EDD uses AI as scaffolding to let domain experts build, document, and maintain their own tools on approved platforms. The tools outlast the AI -- they are standard applications running on standard infrastructure, not black-box AI products. One instructor built a system serving 440 users in 30 hours at zero cost.

## Four-Layer Framework

| Layer | Name | Purpose |
|:-----:|:-----|:--------|
| 1 | **Train** | Develop AI-fluent builders through structured coursework |
| 2 | **Build** | Create institutional tools using AI-assisted development |
| 3 | **Document** | Ensure continuity, replication, and knowledge transfer |
| 4 | **Scale** | Spread capability organically across the organization |

## Training Courses

| Course | Duration | Audience | Outcome |
|--------|----------|----------|---------|
| **AI Fluency Fundamentals** | 2 hours | All personnel | Understand six 201 skills, recognize the jagged frontier, map AI into workflow |
| **Builder Orientation** | 2 hours | Aspiring builders | Build a working prototype, apply task decomposition and iterative refinement |
| **Platform Training** | 4 hours | Builders | Build 3 complete tools on Power Platform using centaur and cyborg patterns |
| **Advanced Workshop** | 4 hours | Experienced builders | Map the frontier, build verification protocols, teach others |
| **Supervisor Orientation** | 30 minutes | Leadership | Create permission culture, evaluate proposals, understand apprentice problem |

## Quick Start

This is a GitHub Pages site served from the `/docs` directory. All training materials, resources, and tools are available directly through the live site.

1. **Visit the Training Site** -- Access all courses, resources, and tools at [jeranaias.github.io/ExpertDrivenDevelopment](https://jeranaias.github.io/ExpertDrivenDevelopment/)

2. **Start with Course 1** -- Complete AI Fluency Fundamentals to understand the six core skills and recognize the jagged frontier.

3. **Follow the Builder Pathway** -- Progress through Courses 2-4 to develop institutional tools, or direct leadership to Course 5.

4. **Use the Resources** -- Access the prompt library, FAQ, templates, and interactive toolkit from the site.

## Proof of Concept

- **MCD Tutoring Application** -- 440 users, 30 hours to build, $0 cost, ATO approved
- **DonDocs (Marine Coders)** -- 300 unique users/day on MCEN, MIU recognized
- **Tanaghum** -- ILR-calibrated Arabic listening lessons, built in 2 days, in use by MLIs
- **Harakat** -- Arabic diacritization system, 0.68% DER
- **Mutawazin** -- Arabic typing proficiency trainer

## Course Pathways

**Universal Pathway** (All Personnel):
- Course 1: AI Fluency Fundamentals → Course 5: Supervisor Orientation (leadership)

**Builder Pathway**:
- Course 1: AI Fluency Fundamentals → Course 2: Builder Orientation → Course 3: Platform Training → Course 4: Advanced Workshop

## Student Course Materials

The repository includes student-facing versions of Courses 1-4, designed to work as both self-paced courses and in-person companion materials. These simplified versions focus on hands-on exercises and are located at `docs/courses/student/`. There is no student version of Course 5 (Supervisor Orientation), as it is leadership-focused and delivered as a briefing.

## Repository Structure

```
ExpertDrivenDevelopment/
├── .github/                    # Community files
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   ├── CONTRIBUTING.md         # Contribution guidelines
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/                       # GitHub Pages site (live at jeranaias.github.io/ExpertDrivenDevelopment)
│   ├── index.html              # Site home page
│   ├── about.html              # About EDD methodology
│   ├── courses/                # Training course pages
│   │   ├── index.html          # Course catalog
│   │   ├── ai-fluency.html     # Course 1: AI Fluency Fundamentals
│   │   ├── orientation.html    # Course 2: Builder Orientation
│   │   ├── platform.html       # Course 3: Platform Training
│   │   ├── advanced.html       # Course 4: Advanced Workshop
│   │   ├── supervisor.html     # Course 5: Supervisor Orientation
│   │   └── student/            # Student-facing course materials
│   │       ├── index.html      # Student course catalog
│   │       ├── ai-fluency.html # Student version of Course 1
│   │       ├── orientation.html # Student version of Course 2
│   │       ├── platform.html   # Student version of Course 3
│   │       └── advanced.html   # Student version of Course 4
│   ├── resources/              # Supporting resources
│   │   ├── index.html          # Resources home
│   │   ├── faq.html            # Frequently asked questions
│   │   ├── prompt-library.html # Curated prompt templates
│   │   └── templates.html      # Project templates
│   ├── sop/
│   │   └── index.html          # Standard Operating Procedure
│   ├── toolkit/
│   │   └── index.html          # Interactive EDD Toolkit
│   ├── css/
│   │   └── style.css           # Site styles
│   ├── pdf/                    # Downloadable PDFs
│   └── templates/              # Markdown templates
├── LICENSE                     # MIT License
├── README.md
└── SECURITY.md                 # Security and classification policy
```

## Contributing

Contributions are welcome from all DoW personnel. Please read the [Contributing Guide](.github/CONTRIBUTING.md) before submitting issues or pull requests.

> **All contributions must be UNCLASSIFIED.** Do not submit CUI, PII, FOUO, or classified material under any circumstances.

## Classification

All materials in this repository are **UNCLASSIFIED // Distribution Unlimited**. No CUI, PII, FOUO, or classified information is permitted in any file, issue, pull request, or discussion. See [SECURITY.md](SECURITY.md) for details.

## License

This project is licensed under the [MIT License](LICENSE).

## Point of Contact

**SSgt Jesse C. Morgan**
Marine Corps Detachment, Presidio of Monterey
Defense Language Institute Foreign Language Center
[jesse.morgan@dliflc.edu](mailto:jesse.morgan@dliflc.edu)
