#!/usr/bin/env node
/**
 * Regenerate the copy-block bodies in docs/decks/week-6-handouts.html
 * from the validated prompts in heywood-inventory/docs/PROMPTS.md.
 *
 * Why this script exists:
 *   The Week 6 hand-out used to be transcribed from PROMPTS.md by hand,
 *   so any drift in the reference repo (a typo fix, a model name bump,
 *   an extra prompt) silently put the printed hand-out out of date.
 *   Running this script after editing PROMPTS.md re-syncs the two.
 *
 * Source of truth:
 *   heywood-inventory/docs/PROMPTS.md
 *
 * What this writes:
 *   Each `<pre class="copy-block__body" id="...">` block inside
 *   docs/decks/week-6-handouts.html is rewritten with the contents of
 *   the matching fenced code block in PROMPTS.md, HTML-escaped so the
 *   page renders verbatim. Everything outside those `<pre>` blocks
 *   (page header, hand-out intro, TOC, copy buttons, cue lines, footer,
 *   script) is left untouched.
 *
 * How an instructor regenerates the hand-out:
 *   1. Edit `heywood-inventory/docs/PROMPTS.md` (typo fix, model bump,
 *      extra prompt, whatever).
 *   2. Run:
 *        node scripts/build-week-6-handouts.js
 *      (or via npm:  `npm run build:week-6-handouts`)
 *   3. Eyeball the diff in `docs/decks/week-6-handouts.html` and commit
 *      both files together so the printed hand-out and the repo prompts
 *      ship in lockstep.
 *
 * If you add or remove a prompt:
 *   The script expects PROMPTS.md to contain exactly as many fenced
 *   code blocks as `COPY_BLOCK_IDS` below, in the same order. If the
 *   two diverge it fails loudly so the page never ships out of sync.
 *   When you intentionally add/remove a prompt, update COPY_BLOCK_IDS
 *   *and* the matching `<pre>` block in the hand-out HTML in the same
 *   change.
 */

const fs = require("node:fs");
const path = require("node:path");

const PROMPTS_PATH = path.resolve(
  __dirname,
  "..",
  "heywood-inventory",
  "docs",
  "PROMPTS.md",
);
const HANDOUT_PATH = path.resolve(
  __dirname,
  "..",
  "docs",
  "decks",
  "week-6-handouts.html",
);

// IDs of the `<pre class="copy-block__body">` elements in the hand-out,
// in the order their bodies appear as fenced code blocks in PROMPTS.md.
// Add/remove entries here when PROMPTS.md gains or loses a prompt.
const COPY_BLOCK_IDS = [
  "copy-m2-install",
  "copy-m2-scaffold",
  "copy-m3-p1",
  "copy-m3-p2",
  "copy-m3-p3",
  "copy-m4-p1",
  "copy-m4-p2",
  "copy-m4-p3",
  "copy-m5",
  "copy-m6-p1",
  "copy-m6-p2",
  "copy-m6-p3",
  "copy-m7-p1",
  "copy-m7-p2",
  "copy-m7-p3",
  "copy-m8-p1",
  "copy-m8-p2",
  "copy-m8-p3",
  "copy-m9-sqlite",
  "copy-m9-graph",
  "copy-m10",
  "copy-m10-azure",
];

// Extract the bodies of every ```...``` fenced code block in the
// markdown, in document order. The opening fence may carry an info
// string (```bash, ```go, etc.) — we ignore it. We anchor on line
// starts so a stray backtick inside a paragraph can't open a fence.
function extractFencedBlocks(markdown) {
  const fenceRe = /^```[^\n]*\n([\s\S]*?)\n```$/gm;
  const blocks = [];
  let match;
  while ((match = fenceRe.exec(markdown)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

function htmlEscape(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rewritePre(html, id, body) {
  const escapedId = id.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(
    `(<pre class="copy-block__body" id="${escapedId}">)[\\s\\S]*?(</pre>)`,
  );
  if (!re.test(html)) {
    throw new Error(
      `Could not find <pre class="copy-block__body" id="${id}"> in ${HANDOUT_PATH}`,
    );
  }
  // Preserve the hand-authored shape: opening tag, body, newline, </pre>.
  return html.replace(re, `$1${htmlEscape(body)}\n$2`);
}

function main() {
  const markdown = fs.readFileSync(PROMPTS_PATH, "utf8");
  const blocks = extractFencedBlocks(markdown);

  if (blocks.length !== COPY_BLOCK_IDS.length) {
    throw new Error(
      `Expected ${COPY_BLOCK_IDS.length} fenced code blocks in ` +
        `${PROMPTS_PATH}, found ${blocks.length}. ` +
        `If you intentionally added or removed a prompt, update ` +
        `COPY_BLOCK_IDS in this script and the matching <pre> block in ` +
        `${HANDOUT_PATH}, then re-run.`,
    );
  }

  let html = fs.readFileSync(HANDOUT_PATH, "utf8");
  for (let i = 0; i < COPY_BLOCK_IDS.length; i += 1) {
    html = rewritePre(html, COPY_BLOCK_IDS[i], blocks[i]);
  }

  fs.writeFileSync(HANDOUT_PATH, html);

  const rel = (p) => path.relative(process.cwd(), p);
  console.log(
    `Regenerated ${COPY_BLOCK_IDS.length} copy-block bodies in ` +
      `${rel(HANDOUT_PATH)} from ${rel(PROMPTS_PATH)}.`,
  );
}

main();
