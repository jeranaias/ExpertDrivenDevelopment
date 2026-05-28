const fs = require('fs');

const replacements = [
  // ===== FACTUAL FIXES =====
  // Prompt Library: MCO 1610.7 is FITREP order; use MCRP 6-10B for junior-Marine counseling
  ['docs/resources/marine-prompt-library.html', [
    ['per MCO 1610.7 series.\n', 'per MCRP 6-10B (Marine Corps Counseling Program).\n'],
    ['per MCO 1610.7 series. Format requested:', 'per MCRP 6-10B (Marine Corps Counseling Program). Format requested:'],
    ['that align with marked attributes and survive Reviewing Officer review per MCO 1610.7 series', 'that align with marked attributes and survive Reviewing Officer review per MCO 1610.7 series (the Performance Evaluation System Manual; verify current revision letter)'],
    ['SECNAV M-5210.1', 'SECNAV M-5210.2'],
    ['{SUMMARY / COMPANY-GRADE / FIELD-GRADE / SPCM REFERRED}', '{COMPANY-GRADE NJP / FIELD-GRADE NJP / REFERRED TO COURTS-MARTIAL}'],
  ]],
  // Tool Selection Guide: fabricated stats + IL hedging + cost framing + 150+ models
  ['docs/resources/tool-selection-guide.html', [
    ['Tool selection is itself a skill, and it is the skill that lets a Marine ship a counseling statement in three minutes instead of thirty.', 'Tool selection is itself a skill. Picking the wrong tool costs prompt iterations and review time even when the output is technically correct.'],
    ['Chat models drift after roughly 6 to 8 iterations. Reasoning models hold the thread longer.', 'Chat models tend to drift in long multi-file work as the context window fills. Reasoning models hold the thread longer in practice, though the exact iteration count varies by task and prompt complexity.'],
    ['<strong>Citation verification.</strong> Ask Sage hallucinates MCO paragraph numbers more than 10% of the time even when it gets the MCO right.', '<strong>Citation verification.</strong> Ask Sage hallucinates MCO paragraph numbers frequently, even when it gets the MCO right.'],
    ['150+ LLMs including', '150+ models including'],
    ['150+ models: GPT-5, GPT-5 reasoning, Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5, Gemini 2.5, Llama 4, Mistral, Cohere.', "150+ models. Today's lineup includes the current Claude Opus and Sonnet families, GPT-5 plus reasoning variants, Gemini 2.5, and Llama 4. Available models drift; check the picker in your tenant."],
    ['Azure Government hosted. 150+ models including GPT-5 plus GPT-5 reasoning variants, Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5, Gemini 2.5, Llama 4 (Scout and Maverick), and Mistral.', 'Azure Government or AWS GovCloud hosted (depending on the customer enclave). 150+ models including current Claude Opus and Sonnet, GPT-5 plus reasoning variants, Gemini 2.5, and Llama 4 Scout where available.'],
    ['Reasoning models (GPT-5 reasoning, Claude Opus 4.7)', 'Reasoning models (current Claude Opus, GPT-5 reasoning)'],
    ['IL5/IL6/Top Secret/FedRAMP High authorized.', 'FedRAMP High and IL5 authorized in the default enclave; IL6 and Top Secret available through separate enclaves with separate provisioning.'],
    ['IL5/IL6/Top Secret.', 'IL5 default; IL6 / TS via separate enclaves.'],
    ['Opus 4.7 is the most expensive model the tenant exposes. Reserve it for tasks where the reasoning premium pays for itself', 'Current Claude Opus is the heaviest model the tenant exposes. Reserve it for tasks where the reasoning premium pays for itself in fewer turns and better outputs'],
    ['Do not default to Opus 4.7 for tasks Sonnet 4.6 or Haiku 4.5 would handle. The bill scales with use, and there is a real budget constraint at the tenant level.', 'Do not default to Opus for tasks the workhorse Sonnet or a fast Haiku model would handle. Heavier reasoning models are slower and more quota-heavy; on bulk-seat tenants the budget pressure is real even when individual Marines do not see per-token billing.'],
    ['Forty Marines documenting the same blocked connector with beneficiary counts is a policy case.', 'A cohort of Marines documenting the same blocked connector with beneficiary counts is a policy case.'],
    ['Department of War rebrand', 'Department of War secondary-name authorization'],
  ]],
  // Tips and Tricks: stats + leverage AI-tells + voice
  ['docs/resources/tips-and-tricks.html', [
    ['Marines write better when they talk first. The voice draft captures the actual story; the AI polish converts it to the required format. Time saved: 3x to 5x writing time on a typical FITREP block.', 'Marines write better when they talk first. The voice draft captures the actual story; the AI polish converts it to the required format. Real time saved varies, but most Marines who adopt this workflow report meaningful cuts to first-draft time on long-form prose.'],
    ['<strong>For citations: do the actual lookup.</strong> AI hallucinates paragraph numbers about 10% of the time even when it gets the MCO right.', '<strong>For citations: do the actual lookup.</strong> AI hallucinates paragraph numbers often enough that any cited paragraph is unverified until you check the source.'],
    ['highest-leverage habits', 'highest-value habits'],
    ['Compounding Returns', 'How the Habits Stack'],
  ]],
  // Citation Verification: URL fixes + 10% stat + anthropomorphism
  ['docs/resources/citation-verification.html', [
    ['Marine-Net publications library. Public-facing index at marines.mil/Marine-Corps-Publications.', 'Marine Corps publications library. Public-facing index at marines.mil/News/Publications. The Marine Corps Publications Electronic Library (MCPEL) is the searchable index.'],
    ['DON Issuances at secnav.navy.mil.', 'DON Issuance Portal at doni.documentservices.dla.mil (DLA hosts the official directives library for SECNAVINST and OPNAVINST).'],
    ['DoD Issuances at esd.whs.mil.', 'DoD Issuances at esd.whs.mil/DD/issuances. The Washington Headquarters Services directives library is the authoritative source for DoDIs, DoDDs, and DoDMs.'],
    ['uscode.house.gov.', 'uscode.house.gov/browse/prelim@title10 for Title 10 USC. The Office of the Law Revision Counsel is the authoritative source.'],
    ['AI hallucinates citations more often than it hallucinates facts.', 'AI hallucinates citations frequently. The cost of wrong citations in signed documents is higher than the cost of wrong facts in informal ones.'],
    ['AI loves citations. It loves looking authoritative.', 'AI is prone to citing sources. Citations make AI output look authoritative, which compounds the risk when they are wrong.'],
  ]],
  // Course page: GDPval reframe + 35% qualifier
  ['docs/courses/advanced-reality.html', [
    ['1.4x faster and 1.6x cheaper. The review step is where value is created. The two-tool cross-check', '1.4x faster and 1.6x cheaper at expert parity on roughly half of tasks tested. Treat human review as the discipline that captures value; the two-tool cross-check'],
    ['Entry-level job postings dropped 35 percent from 2023 to 2025.', 'Entry-level job postings in AI-exposed roles dropped roughly 35 percent from 2023 to 2025 (Mollick et al. analysis of postings data; verify against the current paper before quoting in a brief).'],
  ]],
  // Deck: GDPval + 35% qualifier
  ['docs/decks/week-4-5-advanced-reality.html', [
    ['The GDPval study found human review is where value is created (1.4x faster, 1.6x cheaper with review).', 'The GDPval study showed AI-assisted workflows matched expert quality on roughly half of tasks and ran 1.4x faster / 1.6x cheaper at expert parity in those scenarios.'],
    ['Mollick: workers using AI but hiding it. Entry-level postings dropped 35% from 2023 to 2025.', 'Mollick: workers using AI but hiding it. Entry-level postings in AI-exposed roles dropped roughly 35% from 2023 to 2025.'],
    ['Lead with the stats: workers hiding their AI use (Mollick), entry-level postings down 35% (2023 to 2025).', 'Lead with the stats: workers hiding their AI use (Mollick research), entry-level postings in AI-exposed roles down roughly 35% from 2023 to 2025.'],
  ]],
];

let total = 0;
for (const [file, edits] of replacements) {
  if (!fs.existsSync(file)) { console.log('MISSING:', file); continue; }
  let c = fs.readFileSync(file, 'utf8');
  let n = 0;
  for (const [from, to] of edits) {
    const parts = c.split(from);
    if (parts.length > 1) {
      c = parts.join(to);
      n += parts.length - 1;
    } else {
      console.log('  NO MATCH in', file, ':', from.substring(0, 60));
    }
  }
  fs.writeFileSync(file, c);
  console.log(file, '-', n, 'replacements');
  total += n;
}
console.log('---');
console.log('Total:', total);
