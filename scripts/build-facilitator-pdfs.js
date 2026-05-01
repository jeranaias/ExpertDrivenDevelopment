#!/usr/bin/env node
/**
 * Build the six Facilitator Pack PDFs.
 *
 * Renders each `docs/facilitator/week-N-<slug>.html` to a one-page
 * landscape PDF at `docs/facilitator/pdf/week-N-<slug>.pdf` using
 * headless Chromium via puppeteer-core.
 *
 * Prerequisites:
 *   - Chromium installed at $PUPPETEER_EXECUTABLE_PATH or one of the
 *     well-known paths probed below (the project's Nix shell installs
 *     `chromium` system-wide; `which chromium` is preferred).
 *   - The static site reachable on $SITE_URL (default http://localhost:5000).
 *     Run `python3 serve.py` (the "Start application" workflow) first.
 *
 * Run:
 *   node scripts/build-facilitator-pdfs.js
 *   # or:  npm run build:facilitator-pdfs
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync } = require("node:child_process");
const puppeteer = require("puppeteer-core");

const SITE_URL = process.env.SITE_URL || "http://localhost:5000";
const OUT_DIR = path.resolve(__dirname, "..", "docs", "facilitator", "pdf");
// Deck-side prompt hand-out PDFs (multi-page Letter-portrait renders of the
// `docs/decks/week-N-handouts.html` pages). Currently only Week 6 ships a
// prompt hand-out; sibling weeks have a follow-up task to add their own,
// at which point new entries can be appended below.
const DECK_HANDOUTS_OUT_DIR = path.resolve(__dirname, "..", "docs", "decks", "pdf");

// On Linux, headless Chromium falls back to DejaVu Sans for the pack's
// Helvetica / Arial / Segoe UI font stack. DejaVu's wider metrics cause
// text to wrap more aggressively and bullets tip past the bottom of the
// fixed-height pack frame. The fix is to point fontconfig at a
// metric-compatible substitute and alias the pack's font stack to it.
//
// Preference order:
//   1. Liberation Sans   — designed to be metric-compatible with Arial,
//                          which is exactly what macOS Chrome falls back
//                          to when it can't find Helvetica. This produces
//                          the closest match to what authors see when
//                          they print from their own browser.
//   2. Noto Sans         — close-enough fallback if Liberation isn't
//                          installed.
// We do this at script runtime so the project doesn't have to commit any
// per-machine font paths.
function setupFontFallback() {
  // Probe order:
  //   1. Nix store  — local Replit / Nix shells (preferred when available).
  //   2. Standard Linux font dirs — covers vanilla Ubuntu, including the
  //      `ubuntu-latest` GitHub Actions runner that powers the auto-rebuild
  //      workflow. Without this branch CI would fall back to DejaVu Sans
  //      and the packs would overflow the one-page frame.
  const findNixFontDir = (namePat, subdir, sentinelPat) => {
    const nixStore = "/nix/store";
    if (!fs.existsSync(nixStore)) return null;
    // Pick the highest-version directory matching `<hash>-<name>-<ver>` so
    // we deterministically prefer e.g. liberation-fonts-2.1.5 over 2.1.0.
    const candidates = fs
      .readdirSync(nixStore)
      .filter((d) => namePat.test(d))
      .sort()
      .reverse()
      .map((d) => path.join(nixStore, d, "share", "fonts", subdir))
      .filter((p) => fs.existsSync(p) && fs.readdirSync(p).some((f) => sentinelPat.test(f)));
    return candidates[0] || null;
  };

  const findStandardFontDir = (paths, sentinelPat) => {
    for (const p of paths) {
      if (fs.existsSync(p) && fs.readdirSync(p).some((f) => sentinelPat.test(f))) {
        return p;
      }
    }
    return null;
  };

  const liberationDir =
    findNixFontDir(
      /^[a-z0-9]+-liberation-fonts-\d/,
      "truetype",
      /^LiberationSans-Regular\.ttf$/
    ) ||
    findStandardFontDir(
      [
        "/usr/share/fonts/truetype/liberation",
        "/usr/share/fonts/truetype/liberation2",
        "/usr/share/fonts/liberation",
      ],
      /^LiberationSans-Regular\.ttf$/
    );
  // Match only the main `noto-fonts-<version>` package, not side packages
  // like noto-fonts-emoji / -cjk / -extra (no Latin face we can alias).
  const notoDir =
    findNixFontDir(
      /^[a-z0-9]+-noto-fonts-\d/,
      "noto",
      /^NotoSans\[/
    ) ||
    findStandardFontDir(
      ["/usr/share/fonts/truetype/noto", "/usr/share/fonts/noto"],
      /^NotoSans-Regular\.ttf$/
    );

  let dir = null;
  let family = null;
  if (liberationDir) { dir = liberationDir; family = "Liberation Sans"; }
  else if (notoDir)  { dir = notoDir;       family = "Noto Sans"; }
  else return null;

  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${dir}</dir>
  ${[
    "Helvetica Neue",
    "Helvetica",
    "Arial",
    "Segoe UI",
    "Roboto",
    "-apple-system",
    "BlinkMacSystemFont",
    "sans-serif",
  ]
    .map(
      (f) =>
        `<alias binding="strong"><family>${f}</family><prefer><family>${family}</family></prefer></alias>`
    )
    .join("\n  ")}
</fontconfig>
`;
  const confPath = path.join(os.tmpdir(), "facilitator-pdf-fontconfig.xml");
  fs.writeFileSync(confPath, conf);
  process.env.FONTCONFIG_FILE = confPath;
  return family;
}

const PACKS = [
  { week: 1, slug: "ai-fluency",            file: "week-1-ai-fluency.html" },
  { week: 2, slug: "builder-orientation",   file: "week-2-builder-orientation.html" },
  { week: 3, slug: "platform-training",     file: "week-3-platform-training.html" },
  { week: 4, slug: "advanced",              file: "week-4-advanced.html" },
  { week: 5, slug: "supervisor",            file: "week-5-supervisor.html" },
  { week: 6, slug: "fullstack",             file: "week-6-fullstack.html" },
];

// Deck-side prompt hand-out pages. These differ from the Facilitator Packs
// above in two ways: (1) they live under `docs/decks/` and target a normal
// portrait reading flow rather than a fixed Letter-landscape one-pager, and
// (2) they're allowed to span multiple pages — the source HTML can have a
// dozen copy blocks. The shipped print stylesheet inside each page already
// hides the on-screen chrome (site header, copy buttons, jump links, etc.)
// and preserves the slide-number pills, cue lines, and `<pre>` formatting,
// so as with the packs above we deliberately don't inject any extra CSS
// here — we just point Chrome at the URL and ask for a Letter-portrait
// print. Output filenames mirror the source basename so deck pages can
// link to `pdf/<basename>.pdf` next to themselves.
const DECK_HANDOUTS = [
  { week: 6, file: "week-6-handouts.html" },
];

function findChromium() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  try {
    return execSync("command -v chromium", { encoding: "utf8" }).trim();
  } catch (_) {}
  for (const candidate of [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
  ]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(
    "Could not locate Chromium. Set PUPPETEER_EXECUTABLE_PATH or install `chromium`."
  );
}

async function ensureServerUp() {
  const probe = `${SITE_URL}/facilitator/index.html`;
  try {
    const res = await fetch(probe);
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    throw new Error(
      `Site not reachable at ${probe} (${err.message}). ` +
      `Start the static server first (python3 serve.py) and retry.`
    );
  }
}

// The tighten-pass that used to be injected here at PDF time now lives
// in the shipped `docs/facilitator/css/pack.css` `@media print` block
// (so the in-browser print preview behaves identically to this PDF
// output, which is the whole point of task #60). Nothing extra is
// injected here any more — we just point Chrome at the URL and ask
// for a Letter-landscape print.
async function renderPack(browser, pack) {
  const url = `${SITE_URL}/facilitator/${pack.file}`;
  const outPath = path.join(OUT_DIR, `week-${pack.week}-${pack.slug}.pdf`);
  const page = await browser.newPage();
  try {
    // Match viewport to Letter-landscape minus 0.32in margins (10.36in × 7.86in
    // at 96 DPI) so the pack renders at its print width before we ask for the
    // PDF. Without this the headless default 800px viewport forces text to
    // wrap more than the print preview the authors target, and the pack
    // overflows onto a second page.
    await page.setViewport({ width: 1056, height: 816, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    // Give layout a tick to settle after media-type emulation so the
    // measurements puppeteer hands to the PDF renderer reflect the
    // print-mode metrics.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    // Render the pack onto a Letter-landscape page with the same 0.32in
    // margins the in-browser print preview targets. We deliberately do
    // NOT pass `scale` — the shipped `@media print` CSS already sizes
    // `.pack-page` to fit safely on both Letter and A4, and any
    // additional puppeteer-side scaling would inflate the layout
    // viewport and re-introduce the overflow we just engineered out.
    await page.pdf({
      path: outPath,
      format: "Letter",
      landscape: true,
      printBackground: true,
      margin: { top: "0.32in", right: "0.32in", bottom: "0.32in", left: "0.32in" },
    });
  } finally {
    await page.close();
  }
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`  ✓ week-${pack.week}-${pack.slug}.pdf (${sizeKb} KB)`);
}

// Render a deck-side prompt hand-out page to a Letter-portrait,
// multi-page PDF under `docs/decks/pdf/`. Same Chromium and font
// fallback as the packs above; differs only in viewport (portrait
// width) and the lack of a `landscape: true` flag on `page.pdf()`.
async function renderDeckHandout(browser, handout) {
  const url = `${SITE_URL}/decks/${handout.file}`;
  const outPath = path.join(DECK_HANDOUTS_OUT_DIR, handout.file.replace(/\.html$/, ".pdf"));
  const page = await browser.newPage();
  try {
    // Letter-portrait minus 0.5in margins (7.5in × 10in at 96 DPI) so the
    // page renders at its print width before we ask for the PDF.
    await page.setViewport({ width: 720, height: 960, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.pdf({
      path: outPath,
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
    });
  } finally {
    await page.close();
  }
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`  ✓ ${path.basename(outPath)} (${sizeKb} KB)`);
}

(async () => {
  const usedFont = setupFontFallback();
  if (usedFont) console.log(`Font fallback:  ${usedFont}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(DECK_HANDOUTS_OUT_DIR, { recursive: true });
  await ensureServerUp();
  const executablePath = findChromium();
  console.log(`Using Chromium: ${executablePath}`);
  console.log(`Source URL:    ${SITE_URL}/facilitator/`);
  console.log(`Output dir:    ${path.relative(process.cwd(), OUT_DIR)}/`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
    ],
  });
  try {
    for (const pack of PACKS) {
      await renderPack(browser, pack);
    }
    if (DECK_HANDOUTS.length > 0) {
      console.log(`Source URL:    ${SITE_URL}/decks/`);
      console.log(`Output dir:    ${path.relative(process.cwd(), DECK_HANDOUTS_OUT_DIR)}/`);
      for (const handout of DECK_HANDOUTS) {
        await renderDeckHandout(browser, handout);
      }
    }
  } finally {
    await browser.close();
  }
  const total = PACKS.length + DECK_HANDOUTS.length;
  console.log(`Done. ${total} PDFs written (${PACKS.length} packs + ${DECK_HANDOUTS.length} deck hand-outs).`);
})().catch((err) => {
  console.error(`\nERROR: ${err.message}\n`);
  process.exit(1);
});
