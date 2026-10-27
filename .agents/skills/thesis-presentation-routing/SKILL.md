---
name: thesis-presentation-routing
description: Use when turning a graduation thesis, master's dissertation, capstone, or vocational internship report into a defense presentation; identifies the local institution rules, research method, discipline-family blueprint, and confidence before authoring slides.
---

# Thesis Presentation Routing

Before populating `src/data/`, read [`docs/THESIS_PRESENTATION_ROUTER.md`](../../../docs/THESIS_PRESENTATION_ROUTER.md) and the profile data in `src/thesis/`.

## Required steps

1. Extract institution, faculty/institute, department, specialty, degree, thesis title, abstract, keywords, study design, and allotted defense time from the supplied document. Mark missing fields; never infer institution or degree from topic.
2. Search the exact institution/faculty's current official defense guide. Prefer an official PDF/web page from the department. Distinguish manuscript formatting instructions from oral-defense instructions.
3. Use `getInstitutionalGuidance()` for documented rules, and respect its scope/status. A legacy or undated source must be labelled and confirmed; never silently treat it as current. If no local guide exists, report that, rather than presenting another institution's procedure as universal.
4. Use `routeThesisMethodology()` to suggest a profile. The 245 listed specialty labels are routing examples, not an exhaustive official catalogue: an unlisted specialty is not unsupported. Use the MESRS domain, the specialty's meaning, the thesis objective and its methods to map it semantically; if it fits more than one family, ask before choosing. The result is only a routing hint: read the thesis itself, choose its actual work mode (experiment, survey, software, design, legal/document analysis, placement, etc.), combine compatible modules, and preserve the thesis's valid argument structure.
5. Build a concise slide-by-slide outline with one purpose and one evidence-bearing visual per slide. Give more space to the actual contribution, results or artifact than to generic background. Match the known time limit; there is no assumed universal slide-per-minute rule.
6. Tell the user the chosen profile, local-rule status, confidence, and any missing fact that could change the plan. If confidence is low, ask one focused clarification before finalizing.

## Non-negotiable safeguards

- Do not fabricate hypotheses, sample sizes, statistical significance, results, citations, approvals, implementation status, or institutional requirements.
- Keep clinical/pupil/participant data anonymized; do not expose secrets from a company/internship.
- For legal work, verify law/case references and their current status.
- For engineering/software, distinguish simulation from field testing and prototype from production.
- For visual design/architecture, prioritize readable authored plans and artifacts, not generic statistics.
- If no suitable profile is clear, use `general-research` temporarily and ask; do not pretend the router is an AI model or an official standard.
