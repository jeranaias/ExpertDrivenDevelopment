#!/usr/bin/env node
/**
 * Regenerate the Briefs Library cards inside docs/pdf/index.html.
 *
 * Source of truth:
 *   - Files on disk under docs/pdf/*.pdf  (authoritative for "what exists" and file size)
 *   - docs/pdf/manifest.json              (authoritative for grouping, titles,
 *                                          descriptions, audience, secondary
 *                                          links, and tag prefixes)
 *
 * What this writes:
 *   The block between <!-- BRIEFS:BEGIN --> and <!-- BRIEFS:END --> in
 *   docs/pdf/index.html is replaced with auto-generated cards. Everything
 *   outside the markers (header, breadcrumbs, callout, footer) is preserved.
 *
 * New PDFs:
 *   A PDF dropped into docs/pdf/ that is not yet listed in manifest.json
 *   still appears on the page, in a clearly-labeled "Uncategorized" group,
 *   so editors notice and add a proper description on the next pass.
 *
 * Manifest entries with no matching file:
 *   The build fails loudly so a stale manifest never ships a broken
 *   download link.
 *
 * Run:
 *   node scripts/build-briefs-library.js
 *   # or:  npm run build:briefs-library
 */

const fs = require("node:fs");
const path = require("node:path");

const PDF_DIR = path.resolve(__dirname, "..", "docs", "pdf");
const MANIFEST_PATH = path.join(PDF_DIR, "manifest.json");
const INDEX_PATH = path.join(PDF_DIR, "index.html");
const BEGIN_MARKER = "<!-- BRIEFS:BEGIN -->";
const END_MARKER = "<!-- BRIEFS:END -->";

function readManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

function listPdfs() {
  return fs
    .readdirSync(PDF_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();
}

function fileSizeKb(filename) {
  const bytes = fs.statSync(path.join(PDF_DIR, filename)).size;
  // Match the rounding the hand-written page used (KB rounded to nearest int).
  return Math.round(bytes / 1024);
}

function renderItem(item, sizeKb, opts) {
  const { cardClass, buttonClass } = opts;
  const tag = `${item.tagPrefix} &mdash; PDF, ${sizeKb} KB`;
  const downloadLabel = `Download PDF (${sizeKb} KB)`;
  const secondary = item.secondaryLink
    ? `\n                            <a href="${item.secondaryLink.href}" class="btn btn--secondary btn--sm">${item.secondaryLink.text}</a>`
    : "";
  return `                    <div class="${cardClass}" id="${item.id}">
                        <span class="card__tag">${tag}</span>
                        <h3 class="card__title">${item.title}</h3>
                        <p class="card__desc">${item.description}</p>
                        <p class="card__desc"><strong>Audience:</strong> ${item.audience}</p>
                        <div class="card__footer">
                            <a href="${item.file}" class="${buttonClass}" target="_blank" rel="noopener">${downloadLabel}</a>${secondary}
                        </div>
                    </div>`;
}

function renderGroup(group, items) {
  if (!items.length) return "";
  const heading = group.headingClass
    ? `                <h2 id="${group.id}" class="${group.headingClass}">${group.title}</h2>`
    : `                <h2 id="${group.id}">${group.title}</h2>`;
  const introClass = group.introClass || "mb-lg";
  const intro = `                <p class="${introClass}">${group.intro}</p>`;
  const cards = items
    .map((item) =>
      renderItem(item, fileSizeKb(item.file), {
        cardClass: group.cardClass || "card",
        buttonClass: group.buttonClass || "btn btn--secondary btn--sm",
      })
    )
    .join("\n\n");
  return `${heading}\n${intro}\n\n                <div class="card-grid card-grid--2">\n\n${cards}\n\n                </div>`;
}

function buildHtml(manifest) {
  const onDisk = new Set(listPdfs());
  const claimed = new Set();
  const sections = [];

  // Validate every manifest item points at an existing file before rendering
  // anything, so a stale manifest can't ship a broken download link.
  const missing = [];
  for (const group of manifest.groups) {
    for (const item of group.items) {
      if (!onDisk.has(item.file)) missing.push({ group: group.id, file: item.file });
    }
  }
  if (missing.length) {
    const lines = missing
      .map((m) => `  - ${m.file} (referenced by group "${m.group}")`)
      .join("\n");
    throw new Error(
      `manifest.json references PDFs that are not present in docs/pdf/:\n${lines}\n` +
        `Either restore the file or remove the entry from manifest.json.`
    );
  }

  for (const group of manifest.groups) {
    sections.push(renderGroup(group, group.items));
    for (const item of group.items) claimed.add(item.file);
  }

  const orphans = [...onDisk].filter((f) => !claimed.has(f));
  if (orphans.length && manifest.fallbackGroup) {
    const fallbackItems = orphans.map((file) => ({
      id: `uncategorized-${file.replace(/\.pdf$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      file,
      tagPrefix: "Needs description",
      title: file,
      description:
        "This PDF was discovered in <code>docs/pdf/</code> but has no entry in <code>docs/pdf/manifest.json</code>. Add a description and audience there to move it into a proper section.",
      audience: "Update <code>docs/pdf/manifest.json</code> to set the audience.",
    }));
    sections.push(renderGroup(manifest.fallbackGroup, fallbackItems));
    console.warn(
      `WARN: ${orphans.length} PDF(s) not in manifest.json (rendered under "Uncategorized"):\n` +
        orphans.map((f) => `  - ${f}`).join("\n")
    );
  }

  return sections.join("\n\n                <!-- ──────────────────────────────────── -->\n\n");
}

function injectIntoIndex(generated) {
  const html = fs.readFileSync(INDEX_PATH, "utf8");
  const beginIdx = html.indexOf(BEGIN_MARKER);
  const endIdx = html.indexOf(END_MARKER);
  if (beginIdx === -1 || endIdx === -1) {
    throw new Error(
      `Could not find ${BEGIN_MARKER} / ${END_MARKER} markers in ${path.relative(process.cwd(), INDEX_PATH)}. ` +
        `The script needs both markers to know where to write the cards.`
    );
  }
  if (endIdx < beginIdx) {
    throw new Error(`${END_MARKER} appears before ${BEGIN_MARKER} in ${INDEX_PATH}.`);
  }
  const before = html.slice(0, beginIdx + BEGIN_MARKER.length);
  const after = html.slice(endIdx);
  const block = `\n                <!-- Auto-generated by scripts/build-briefs-library.js from docs/pdf/manifest.json. Do not edit by hand — edit the manifest and rerun \`npm run build:briefs-library\`. -->\n\n${generated}\n\n                `;
  const next = `${before}${block}${after}`;
  if (next === html) {
    console.log("Briefs Library: no changes (already up to date).");
    return false;
  }
  fs.writeFileSync(INDEX_PATH, next);
  return true;
}

(function main() {
  const manifest = readManifest();
  const generated = buildHtml(manifest);
  const changed = injectIntoIndex(generated);
  const totalItems = manifest.groups.reduce((n, g) => n + g.items.length, 0);
  console.log(
    `Briefs Library: ${totalItems} manifest entries rendered into ` +
      `${path.relative(process.cwd(), INDEX_PATH)}${changed ? " (updated)" : ""}.`
  );
})();
