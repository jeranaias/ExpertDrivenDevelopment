#!/usr/bin/env node
/**
 * Build print-mode PDFs for weeks 2–6 (matching the Week 1 audit pipeline).
 * Saves to docs/decks/audit/week-N/week-N-print.pdf.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const puppeteer = require("puppeteer-core");

const SITE = process.env.SITE_URL || "http://localhost:5000";
const DECKS = [
  { week: 2, file: "week-2-builder-orientation.html" },
  { week: 3, file: "week-3-platform-training.html" },
  { week: 4, file: "week-4-advanced.html" },
  { week: 5, file: "week-5-supervisor.html" },
  { week: 6, file: "week-6-fullstack.html" },
];

function findChromium() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  try { return execSync("command -v chromium", { encoding: "utf8" }).trim(); } catch (_) {}
  for (const c of ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"]) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error("chromium not found");
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: findChromium(), headless: "new", args: ["--no-sandbox"] });
  for (const deck of DECKS) {
    const url = `${SITE}/decks/${deck.file}?print=1`;
    const outDir = path.resolve(__dirname, "..", "docs", "decks", "audit", `week-${deck.week}`);
    fs.mkdirSync(outDir, { recursive: true });
    const outPdf = path.join(outDir, `week-${deck.week}-print.pdf`);
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    await page.goto(url, { waitUntil: "networkidle2" });
    // Force print mode (?print=1 calls printDeck()+window.print(), but ensure body class for safety)
    await page.evaluate(() => { document.body.classList.add("is-printing"); });
    await new Promise((r) => setTimeout(r, 500));
    const pdf = await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    fs.writeFileSync(outPdf, pdf);
    const sizeKb = Math.round(pdf.length / 1024);
    console.log(`week ${deck.week}: ${outPdf} (${sizeKb} KB)`);
    await page.close();
  }
  await browser.close();
})();
