const fs = require('fs');

const replacements = [
  ['docs/resources/debugging-scenarios.html', [
    ['The timezone bug is Frontier: the AI consistently misses date-comparison timezone gotchas without explicit prompting.',
     'The timezone bug is Frontier: AI commonly produces date comparisons that ignore timezone semantics unless you prompt for it.'],
    ['The AI consistently writes per-element handlers and consistently fails to suggest delegation as the architecture fix without explicit prompting.',
     'AI commonly defaults to per-element handlers and rarely suggests delegation as the architecture fix unless you ask for it.'],
  ]],
  ['docs/decks/week-4-5-advanced-reality.html', [
    // Slogan-repetition fix: "Two independent axes" appears 3 times in deck (slides 4, 25, 39 region).
    // Trim to just the slide-4 intro and the Module 3 synthesis; remove from Module 5 framing.
    ['Course 4 students switch between centaur and cyborg. Course 4.5 students switch BOTH modes AND tools. Two independent axes.',
     'Course 4 students switch between centaur and cyborg. Course 4.5 students switch BOTH modes AND tools.'],
  ]],
  // Citation Verification: demote two-tool cross-check to supplementary
  ['docs/resources/citation-verification.html', [
    ['Same citation list pasted into BOTH genai.mil AND Ask Sage (with reasoning model).',
     '(Supplementary signal only; the authoritative check is Step 3 source lookup.) Same citation list pasted into BOTH genai.mil AND Ask Sage (with reasoning model).'],
  ]],
  // Tips and Tricks: Continue.dev section needs tenant-warning header
  ['docs/resources/tips-and-tricks.html', [
    ['<h2>4. IDE Integration (Continue.dev for Ask Sage)</h2>',
     '<h2>4. IDE Integration (Continue.dev for Ask Sage)</h2>\n                <div class="callout callout--warning">\n                    <p><strong>Tenant warning before you read further.</strong> On a standard MCEN duty workstation, VS Code making outbound API calls to Ask Sage will likely be blocked by AppLocker, endpoint protection, or outbound proxy policy. This section describes what becomes possible on a developer-tier endpoint where you have control over the editor and outbound traffic. Treat it as "what to ask for" rather than "what to deploy this week."</p>\n                </div>'],
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
      console.log('  NO MATCH in', file, ':', from.substring(0, 70));
    }
  }
  fs.writeFileSync(file, c);
  console.log(file, '-', n, 'replacements');
  total += n;
}
console.log('---');
console.log('Total:', total);
