// Storybook shots of the mirrored stories, per theme (`none` = no theme, the default look), 412 wide at DPR 2.625.
import { chromium } from "/home/jacobus/dev/hackcove.hc-192-spike/node_modules/@playwright/test/index.js";
const OUT = `${process.env.TMPDIR}/hc192/sb`;
const themes: Record<string, string> = {
  default: "none",
  "catppuccin-mocha": "catppuccin-mocha",
  "thrifty-paper": "thrifty-paper",
};
const pages: Record<string, string[]> = {
  a: [
    "actions-button--variants",
    "actions-button--sizes",
    "actions-button--disabled",
    "text-headings--do-scale",
  ],
  b: [
    "text-body-text--do-paragraph",
    "text-body-text--do-meaning",
    "text-body-text--do-labels",
    "content-card--do-spacing",
    "forms-input--default",
    "forms-input--small",
    "forms-input--disabled",
  ],
};
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 412, height: 914 },
  deviceScaleFactor: 2.625,
});
page.on("console", (m) => m.type() === "error" && console.log("ERR", m.text()));
for (const [name, g] of Object.entries(themes))
  for (const [p, ids] of Object.entries(pages))
    for (const id of ids) {
      await page.goto(
        `http://127.0.0.1:6007/iframe.html?id=${id}&viewMode=story&globals=theme:${g}`,
        { waitUntil: "networkidle" },
      );
      await page.waitForSelector("#storybook-root > :not(style)");
      await page.waitForTimeout(300);
      const r = await page.evaluate(() => {
        const b = document.querySelector("#storybook-root")!.getBoundingClientRect();
        return { y: b.y, h: b.height };
      });
      const h = r.h;
      await page.screenshot({
        path: `${OUT}/${name}-${p}-${id}.png`,
        clip: { x: 0, y: Math.max(0, r.y - 8), width: 412, height: Math.ceil(h) + 16 },
      });
      const cls = await page.evaluate(
        () => document.documentElement.className + "|" + document.body.className,
      );
      console.log(name, id, Math.round(h), cls);
    }
await browser.close();
