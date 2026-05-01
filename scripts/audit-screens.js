#!/usr/bin/env node
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

async function shootDeck(browser, deck, opts = {}) {
  const onlySlides = opts.only || null;       // array of 1-based slide numbers
  const suffix = opts.suffix || "";           // suffix appended to filename, e.g. "-after"
  const url = `${SITE}/decks/${deck.file}`;
  const outDir = path.resolve(__dirname, "..", "docs", "decks", "audit", `week-${deck.week}`, "screens");
  fs.mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
  // Hide deck chrome so it doesn't appear in slide screenshots
  await page.addStyleTag({ content: `
    #deck-chrome, .deck-chrome, #deck-notes, .deck-notes, .deck-back { display: none !important; }
  `});
  const total = await page.evaluate(() => document.querySelectorAll("section.slide").length);
  console.log(`Week ${deck.week}: ${total} slides`);

  const indices = onlySlides
    ? onlySlides.filter(n => n >= 1 && n <= total).map(n => n - 1)
    : Array.from({ length: total }, (_, i) => i);

  for (const i of indices) {
    await page.evaluate((i) => {
      const slides = document.querySelectorAll("section.slide");
      slides.forEach((s, idx) => {
        s.classList.toggle("is-current", idx === i);
        s.classList.toggle("is-active", idx === i);
      });
    }, i);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const fname = `slide-${String(i + 1).padStart(2, "0")}${suffix}.jpg`;
    await page.screenshot({
      path: path.join(outDir, fname),
      type: "jpeg",
      quality: 78,
      clip: { x: 0, y: 0, width: 1280, height: 720 },
    });
  }
  await page.close();
  return total;
}

(async () => {
  const args = process.argv.slice(2);
  let weeks = [2, 3, 4, 5, 6];
  let only = null;
  let suffix = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--week") weeks = args[++i].split(",").map(Number);
    else if (args[i] === "--only") only = args[++i].split(",").map(Number);
    else if (args[i] === "--suffix") suffix = args[++i];
  }
  const browser = await puppeteer.launch({
    executablePath: findChromium(),
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    for (const w of weeks) {
      const d = DECKS.find(x => x.week === w);
      if (!d) continue;
      await shootDeck(browser, d, { only, suffix });
    }
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exit(1); });
