// Deterministic QA for a text-only model. Usage: node scripts/qa.mjs nl|eu|de|home [port]
// Prints a SHORT PASS/FAIL list. Screenshots go to qa/<name>-<topic>-<w>.png (for the human, the model cannot see images).
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const target = process.argv[2] || "nl";
const port = process.argv[3] || "8000";
const url = target === "home" ? `http://localhost:${port}/site/index.html` : `http://localhost:${port}/site/${target}/index.html`;

function findChromium() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; // the cached playwright chromium on this Mac is incomplete
  if (existsSync(chrome)) return chrome;
  const base = join(homedir(), "Library/Caches/ms-playwright");
  if (existsSync(base)) for (const d of readdirSync(base).filter((x) => x.startsWith("chromium-")).sort().reverse()) {
    for (const p of ["chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium", "chrome-linux/chrome"]) {
      const f = join(base, d, p); if (existsSync(f)) return f;
    }
  }
  return undefined;
}

mkdirSync("qa", { recursive: true });
const results = []; const ok = (name, pass, detail = "") => results.push({ name, pass, detail });
const browser = await chromium.launch({ executablePath: findChromium(), headless: true });

for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.route("**/favicon.ico", (r) => r.fulfill({ status: 204, body: "" }));
  const errors = []; const failed = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message.slice(0, 160)));
  page.on("requestfailed", (r) => failed.push(r.url()));
  page.on("response", (r) => r.status() >= 400 && failed.push(r.status() + " " + r.url()));
  const tag = `${target}@${width}`;
  try { await page.goto(url, { waitUntil: "networkidle", timeout: 20000 }); } catch (e) { ok(`${tag} loads`, false, e.message.slice(0, 120)); await page.close(); continue; }
  ok(`${tag} loads`, true);

  const tabCount = await page.locator(".tab").count();
  const n = target === "home" ? 1 : tabCount;
  if (target !== "home") ok(`${tag} has 3 topic tabs`, tabCount === 3, `found ${tabCount}`);
  for (let i = 0; i < n; i++) {
    if (target !== "home") { await page.locator(".tab").nth(i).click(); await page.waitForTimeout(900); }
    const label = target === "home" ? "home" : (await page.locator(".tab").nth(i).innerText()).trim().slice(0, 20);
    const t = `${tag} [${label}]`;
    const m = await page.evaluate(() => {
      const canv = [...document.querySelectorAll("canvas")];
      const drawn = canv.filter((c) => { const ch = window.Chart && Chart.getChart(c); return ch && ch.data.datasets.some((d) => d.data.some((v) => v !== null && v !== undefined)); }).length;
      const tiny = canv.filter((c) => c.clientWidth < 50 || c.clientHeight < 50).length;
      return {
        canvases: canv.length, drawn, tiny,
        kpis: document.querySelectorAll(".kpi").length,
        tables: document.querySelectorAll("table.data tbody tr").length,
        selects: document.querySelectorAll(".filters select").length,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 2,
        emptyMsg: !!document.querySelector(".empty") && /Could not render/.test(document.body.innerText),
        undef: /undefined|NaN|\[object/.test(document.getElementById("app")?.innerText || document.body.innerText),
        insight: document.querySelectorAll(".insight").length,
        links: document.querySelectorAll("a[href]").length,
      };
    });
    if (target === "home") { ok(`${t} has 3 dashboard cards`, (await page.locator(".landing a.card").count()) === 3); }
    else {
      ok(`${t} renders without error`, !m.emptyMsg);
      ok(`${t} >=2 charts drawn with data`, m.drawn >= 2, `drawn=${m.drawn}/${m.canvases}`);
      ok(`${t} >=3 KPI cards`, m.kpis >= 3, `kpis=${m.kpis}`);
      ok(`${t} data table has rows`, m.tables > 0, `rows=${m.tables}`);
      ok(`${t} >=1 filter select`, m.selects >= 1, `selects=${m.selects}`);
      ok(`${t} has insight text`, m.insight >= 1);
      ok(`${t} no tiny canvases`, m.tiny === 0, `tiny=${m.tiny}`);
      // interactivity: change first select to its last option, charts must survive
      if (m.selects > 0) {
        const sel = page.locator(".filters select").first();
        const opts = await sel.locator("option").allInnerTexts();
        if (opts.length > 1) { await sel.selectOption({ label: opts[opts.length - 1] }); await page.waitForTimeout(700); }
        const after = await page.evaluate(() => [...document.querySelectorAll("canvas")].filter((c) => Chart.getChart(c)).length);
        ok(`${t} filter change keeps charts alive`, after >= 2, `charts=${after}`);
      }
    }
    ok(`${t} no 'undefined'/'NaN' text`, !m.undef);
    ok(`${t} no horizontal overflow`, !m.overflowX);
    await page.screenshot({ path: `qa/${target}-${label.replace(/\W+/g, "_")}-${width}.png`, fullPage: true });
  }
  ok(`${tag} no console errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
  ok(`${tag} no failed requests`, failed.length === 0, failed.slice(0, 3).join(" | "));
  await page.close();
}
await browser.close();

const bad = results.filter((r) => !r.pass);
for (const r of results) if (!r.pass) console.log(`FAIL  ${r.name}${r.detail ? "  -> " + r.detail : ""}`);
console.log(`\n${results.length - bad.length}/${results.length} checks passed for "${target}"`);
console.log(bad.length ? "QA RESULT: FAIL" : "QA RESULT: PASS");
process.exit(bad.length ? 1 : 0);
