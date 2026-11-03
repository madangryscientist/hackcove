// Expo web shots: each theme × page, 412 wide at DPR 2.625 (the AVD's 1080px). Logs HEIGHT lines.
import { chromium } from "/home/jacobus/dev/hackcove.hc-192-spike/node_modules/@playwright/test/index.js";
const OUT = `${process.env.TMPDIR}/hc192/web`;
const themes = ["default", "catppuccin-mocha", "thrifty-paper"];
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 412, height: 914 },
  deviceScaleFactor: 2.625,
});
page.on("console", (m) => m.text().startsWith("HEIGHT") && console.log(m.text()));
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
for (const t of themes)
  for (const p of ["a", "b"]) {
    await page.goto(`http://localhost:8081/?theme=${t}&page=${p}`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-testid="switcher"]', { timeout: 120000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${t}-${p}.png`, fullPage: true });
    console.log("shot", t, p);
  }
await browser.close();
