#!/usr/bin/env node
/**
 * Verify each Facilitator Pack prints to exactly one page on A4 landscape.
 *
 * Renders every `docs/facilitator/week-N-<slug>.html` to a headless-Chromium
 * PDF using A4 landscape with the same 0.32in margins the in-browser print
 * preview uses, then counts pages by parsing the PDF stream's page tree.
 *
 * Exit code:
 *   0 — every pack fits on one page
 *   1 — one or more packs tipped onto a second page
 *
 * Run:
 *   node scripts/verify-facilitator-a4.js
 *
 * Requires the static server up at $SITE_URL (default http://localhost:5000).
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync } = require("node:child_process");
const puppeteer = require("puppeteer-core");

const SITE_URL = process.env.SITE_URL || "http://localhost:5000";
const OUT_DIR = path.resolve(__dirname, "..", ".local", "a4-verify");

const PACKS = [
  { week: 1, slug: "ai-fluency",          file: "week-1-ai-fluency.html" },
  { week: 2, slug: "builder-orientation", file: "week-2-builder-orientation.html" },
  { week: 3, slug: "platform-training",   file: "week-3-platform-training.html" },
  { week: 4, slug: "advanced",            file: "week-4-advanced.html" },
  { week: 5, slug: "supervisor",          file: "week-5-supervisor.html" },
  { week: 6, slug: "fullstack",           file: "week-6-fullstack.html" },
];

const PAPERS = [
  // Browser print dialog → "A4" landscape, default margins (~0.32in/8mm in
  // Chrome, which is what the .pack-page envelope is sized to).
  { name: "A4",     format: "A4",     viewport: { w: 1123, h: 794 } },
  // Sanity-check Letter too so we catch any regression in the existing path.
  { name: "Letter", format: "Letter", viewport: { w: 1056, h: 816 } },
];

function findChromium() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  try { return execSync("command -v chromium", { encoding: "utf8" }).trim(); } catch (_) {}
  for (const c of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error("Could not locate Chromium.");
}

// Mirror the production build's font-fallback so the verification matches
// what users see in the wild (Liberation Sans ≈ macOS Arial fallback).
function setupFontFallback() {
  const findStandardFontDir = (paths, sentinelPat) => {
    for (const p of paths) {
      if (fs.existsSync(p) && fs.readdirSync(p).some((f) => sentinelPat.test(f))) return p;
    }
    return null;
  };
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
  const liberationDir =
    findNixFontDir(/^[a-z0-9]+-liberation-fonts-\d/, "truetype", /^LiberationSans-Regular\.ttf$/) ||
    findStandardFontDir(
      ["/usr/share/fonts/truetype/liberation", "/usr/share/fonts/truetype/liberation2", "/usr/share/fonts/liberation"],
      /^LiberationSans-Regular\.ttf$/
    );
  if (!liberationDir) return null;
  const family = "Liberation Sans";
  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${liberationDir}</dir>
  ${["Helvetica Neue","Helvetica","Arial","Segoe UI","Roboto","-apple-system","BlinkMacSystemFont","sans-serif"]
    .map((f) => `<alias binding="strong"><family>${f}</family><prefer><family>${family}</family></prefer></alias>`)
    .join("\n  ")}
</fontconfig>
`;
  const confPath = path.join(os.tmpdir(), "facilitator-a4-verify-fontconfig.xml");
  fs.writeFileSync(confPath, conf);
  process.env.FONTCONFIG_FILE = confPath;
  return family;
}

// Count pages via `pdfinfo` (poppler). Puppeteer wraps the page tree in a
// FlateDecode'd object stream, so a raw byte scan for `/Type /Page` misses
// every page. `pdfinfo` ships with poppler-utils — already installed in
// this Replit's Nix runtime path — and is the simplest reliable counter.
function countPdfPages(pdfPath) {
  try {
    const out = execSync(`pdfinfo ${JSON.stringify(pdfPath)}`, { encoding: "utf8" });
    const m = out.match(/^Pages:\s+(\d+)/m);
    return m ? Number(m[1]) : -1;
  } catch (err) {
    throw new Error(
      `pdfinfo failed on ${pdfPath} (${err.message}). ` +
      `Install poppler-utils (provides 'pdfinfo') to run this verification.`
    );
  }
}

async function renderAndCount(browser, pack, paper) {
  const url = `${SITE_URL}/facilitator/${pack.file}`;
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: paper.viewport.w, height: paper.viewport.h, deviceScaleFactor: 1 });
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const pdfBuf = await page.pdf({
      format: paper.format,
      landscape: true,
      printBackground: true,
      margin: { top: "0.32in", right: "0.32in", bottom: "0.32in", left: "0.32in" },
    });
    const outPath = path.join(OUT_DIR, `week-${pack.week}-${pack.slug}.${paper.name.toLowerCase()}.pdf`);
    fs.writeFileSync(outPath, pdfBuf);
    return { pages: countPdfPages(outPath), bytes: pdfBuf.length, outPath };
  } finally {
    await page.close();
  }
}

(async () => {
  const usedFont = setupFontFallback();
  if (usedFont) console.log(`Font fallback:  ${usedFont}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const probe = `${SITE_URL}/facilitator/index.html`;
  const res = await fetch(probe).catch((e) => { throw new Error(`Site not up at ${probe}: ${e.message}`); });
  if (!res.ok) throw new Error(`Site probe ${probe} returned ${res.status}`);

  const executablePath = findChromium();
  console.log(`Using Chromium: ${executablePath}`);
  console.log(`Source URL:    ${SITE_URL}/facilitator/`);
  console.log(`Output dir:    ${path.relative(process.cwd(), OUT_DIR)}/`);
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  const failures = [];
  try {
    for (const paper of PAPERS) {
      console.log(`\n=== ${paper.name} landscape ===`);
      for (const pack of PACKS) {
        const { pages, bytes, outPath } = await renderAndCount(browser, pack, paper);
        const tag = pages === 1 ? "OK " : "BAD";
        const sizeKb = (bytes / 1024).toFixed(1);
        console.log(`  [${tag}] week-${pack.week}-${pack.slug}: ${pages} page(s), ${sizeKb} KB  →  ${path.relative(process.cwd(), outPath)}`);
        if (pages !== 1) failures.push({ paper: paper.name, pack, pages });
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error(`\nFAIL: ${failures.length} pack/paper combo(s) tipped onto >1 page:`);
    for (const f of failures) {
      console.error(`  - ${f.paper}: week-${f.pack.week}-${f.pack.slug} → ${f.pages} pages`);
    }
    process.exit(1);
  }
  console.log(`\nPASS: every pack rendered to exactly 1 page on both A4 and Letter landscape.`);
})().catch((err) => {
  console.error(`\nERROR: ${err.message}\n`);
  process.exit(1);
});
