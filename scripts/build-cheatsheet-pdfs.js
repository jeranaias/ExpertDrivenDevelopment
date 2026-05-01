#!/usr/bin/env node
/**
 * Build the six Instructor Cheat Sheet PDFs.
 *
 * Renders each `docs/decks/week-N-cheatsheet.html` to a two-page
 * portrait PDF at `docs/decks/pdf/week-N-cheatsheet.pdf` using
 * headless Chromium via puppeteer-core.
 *
 * Mirrors `scripts/build-facilitator-pdfs.js` and
 * `scripts/build-handout-pdfs.js`: same Chromium discovery, same
 * Liberation-Sans / Noto-Sans fontconfig fallback. The cheat sheets
 * are designed to print to **two** US-Letter portrait pages (the
 * shipped `@media print` block in each cheat sheet HTML already
 * sets `@page { size: Letter portrait; margin: 0.4in; }`), so the
 * one-page guard used by the handout builder is replaced by an
 * exact two-page assertion.
 *
 * Prerequisites:
 *   - Chromium installed at $PUPPETEER_EXECUTABLE_PATH or one of the
 *     well-known paths probed below (the project's Nix shell installs
 *     `chromium` system-wide; `which chromium` is preferred).
 *   - The static site reachable on $SITE_URL (default http://localhost:5000).
 *     Run `python3 serve.py` (the "Start application" workflow) first.
 *
 * Run:
 *   node scripts/build-cheatsheet-pdfs.js
 *   # or:  npm run build:cheatsheet-pdfs
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync } = require("node:child_process");
const puppeteer = require("puppeteer-core");

const SITE_URL = process.env.SITE_URL || "http://localhost:5000";
const OUT_DIR = path.resolve(__dirname, "..", "docs", "decks", "pdf");

// On Linux, headless Chromium falls back to DejaVu Sans for the cheat
// sheet's Helvetica / Arial / Segoe UI font stack. DejaVu's wider
// metrics cause text to wrap more aggressively and rows tip past the
// bottom of the two-page envelope. The fix is to point fontconfig at a
// metric-compatible substitute and alias the cheat sheet's font stack
// to it. Identical strategy to the facilitator / handout builders.
function setupFontFallback() {
  const findNixFontDir = (namePat, subdir, sentinelPat) => {
    const nixStore = "/nix/store";
    if (!fs.existsSync(nixStore)) return null;
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
  const confPath = path.join(os.tmpdir(), "cheatsheet-pdf-fontconfig.xml");
  fs.writeFileSync(confPath, conf);
  process.env.FONTCONFIG_FILE = confPath;
  return family;
}

const SHEETS = [
  { week: 1, file: "week-1-cheatsheet.html" },
  { week: 2, file: "week-2-cheatsheet.html" },
  { week: 3, file: "week-3-cheatsheet.html" },
  { week: 4, file: "week-4-cheatsheet.html" },
  { week: 5, file: "week-5-cheatsheet.html" },
  { week: 6, file: "week-6-cheatsheet.html" },
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
  const probe = `${SITE_URL}/decks/index.html`;
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

// Count pages in the rendered PDF. Prefer `pdfinfo` when present
// (parses the document catalog); fall back to a regex scan of
// `/Type /Page` (not `/Pages`) entries in the raw bytes. Both
// methods agree on well-formed Chromium output; the regex is a
// belt-and-braces guard for environments without poppler installed.
function countPdfPages(pdfPath) {
  try {
    const info = execSync(`pdfinfo ${JSON.stringify(pdfPath)}`, { encoding: "utf8" });
    const m = info.match(/^Pages:\s+(\d+)/m);
    if (m) return Number(m[1]);
  } catch (_) {
    // pdfinfo not installed; fall through to byte scan.
  }
  const buf = fs.readFileSync(pdfPath);
  const text = buf.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page(?![sA-Za-z])/g);
  return matches ? matches.length : 0;
}

// Letter portrait at 96 DPI = 816 × 1056 px. The cheat sheets'
// shipped `@page` rule sets a 0.4in margin all round, leaving a
// 7.7in × 10.2in (≈ 739.2 × 979.2 px) printable envelope per page.
// We pass the matching format + 0.4in margins to puppeteer (rather
// than `preferCSSPageSize: true`) because Chromium's preferCSSPageSize
// path miscalculates page-break placement with flex-column children
// of `.cheat-page` and tips later rows past the page boundary.
const PAGE_PX_W = 816;
const PAGE_PX_H = 1056;
const MARGIN_IN = 0.4;
const MARGIN_PX = MARGIN_IN * 96;
const PRINTABLE_PX_H = PAGE_PX_H - 2 * MARGIN_PX;   // 979.2

// Render one cheat sheet at Letter portrait. The on-screen cheat
// sheets are designed to print on two pages, but headless Chromium's
// font rendering plus the `min-height: 11in` screen frame let the
// content overflow that envelope when we render at full scale (Week
// 6 fans out to 5 pages, Week 1 to 4).
//
// We use puppeteer's `scale` parameter to shrink the print rendering
// to fit. Empirically, Chromium's `scale` does not behave as a pure
// post-layout transform: it also nudges Skia's pagination, so the
// effective fit-scale is somewhat less than `printable / contentHeight`
// would predict. We therefore:
//   1. Measure the tallest `.cheat-page` to seed an initial scale.
//   2. Render and count pages.
//   3. If we exceed 2 pages, ratchet the scale down in 0.05 steps
//      until we hit 2 (or bottom out at the puppeteer-allowed 0.1).
// Both pages share the chosen scale so the printed layout stays
// consistent between page 1 and page 2.
async function renderSheet(browser, sheet) {
  const url = `${SITE_URL}/decks/${sheet.file}`;
  const outPath = path.join(OUT_DIR, `week-${sheet.week}-cheatsheet.pdf`);
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: PAGE_PX_W, height: PAGE_PX_H, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

    const heights = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".cheat-page")).map(
        (p) => p.getBoundingClientRect().height
      )
    );
    if (heights.length !== 2) {
      throw new Error(
        `${sheet.file} has ${heights.length} .cheat-page elements; expected exactly 2.`
      );
    }
    const tallest = Math.max(...heights);

    // Seed scale: round the linear estimate down to the nearest 0.05
    // step so we start from a sensible-but-likely-slightly-too-high
    // value, then ratchet down. `Math.ceil(... * 20) / 20` rounds UP
    // to the next 0.05 — that's intentional: the loop trusts pdf
    // page count, not the linear estimate, so starting one step
    // above the predicted scale just means at most one extra render.
    let scale = Math.min(2, Math.ceil((PRINTABLE_PX_H / tallest) * 20) / 20);
    if (scale > 1) scale = 1;
    let pages = -1;
    let attempts = 0;
    while (scale >= 0.1) {
      attempts += 1;
      await page.pdf({
        path: outPath,
        format: "Letter",
        landscape: false,
        printBackground: true,
        scale,
        margin: { top: `${MARGIN_IN}in`, right: `${MARGIN_IN}in`, bottom: `${MARGIN_IN}in`, left: `${MARGIN_IN}in` },
      });
      pages = countPdfPages(outPath);
      if (pages === 2) break;
      // > 2 means content overflows; < 2 should not happen with two
      // explicit `.cheat-page` elements separated by
      // `page-break-before: always`, but if it does we bail out
      // rather than ratchet the wrong direction.
      if (pages < 2) break;
      scale = Math.round((scale - 0.05) * 100) / 100;
    }
    if (pages !== 2) {
      throw new Error(
        `${path.basename(outPath)} could not be fit to 2 pages: last attempt produced ${pages} ` +
        `pages at scale ${scale.toFixed(2)} (tallest .cheat-page = ${tallest.toFixed(1)} px).`
      );
    }
    sheet._scale = scale;
    sheet._tallest = tallest;
    sheet._attempts = attempts;
  } finally {
    await page.close();
  }
  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(
    `  ✓ week-${sheet.week}-cheatsheet.pdf (${sizeKb} KB, 2 pages, ` +
    `scale ${sheet._scale.toFixed(2)} after ${sheet._attempts} attempt${sheet._attempts === 1 ? "" : "s"})`
  );
}

(async () => {
  const usedFont = setupFontFallback();
  if (usedFont) console.log(`Font fallback:  ${usedFont}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await ensureServerUp();
  const executablePath = findChromium();
  console.log(`Using Chromium: ${executablePath}`);
  console.log(`Source URL:    ${SITE_URL}/decks/`);
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
    for (const sheet of SHEETS) {
      await renderSheet(browser, sheet);
    }
  } finally {
    await browser.close();
  }
  console.log(`Done. ${SHEETS.length} PDFs written to ${OUT_DIR}/`);
})().catch((err) => {
  console.error(`\nERROR: ${err.message}\n`);
  process.exit(1);
});
