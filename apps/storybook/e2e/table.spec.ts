import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { themeScope } from "@hackcove/themes-shared/scope";

// Same source of truth as the toolbar switcher: one folder per theme under themes/.
const themesDir = `${import.meta.dirname}/../../../themes`;
const themes = readdirSync(themesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The `property` hex a theme's rule sets for `selector` (written without the scope), e.g. `.hover\:bg-slate-50:hover`. */
function remapped(css: string, scope: string, selector: string, property: string): string {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rule = new RegExp(
    `\\.${escapeRegExp(scope)}\\s+${escapeRegExp(selector)}\\s*(?:,[^{}]*)?\\{([^}]*)\\}`,
  ).exec(bare);
  const hex = new RegExp(`${property}\\s*:\\s*(#[0-9a-fA-F]{6})`).exec(rule?.[1] ?? "")?.[1];
  if (!hex) throw new Error(`no ${property} for ${selector} under .${scope}`);
  return hex;
}

const rgb = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

const channels = (colour: string) => (colour.match(/\d+/g) ?? []).map(Number);

function luminance(colour: string): number {
  const [r = 0, g = 0, b = 0] = channels(colour).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi = 0, lo = 0] = [luminance(a), luminance(b)].toSorted((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

for (const theme of themes) {
  const css = readFileSync(`${themesDir}/${theme}/theme.css`, "utf8");
  const scope = themeScope(css);

  test(`theme ${theme}: a hovered Table row takes the theme's hover fill and keeps its text readable`, async ({
    page,
  }) => {
    if (!scope) throw new Error(`${theme} names no scope class`);
    await page.goto(`/iframe.html?id=ui-table--quotes&viewMode=story&globals=theme:${theme}`);
    const row = page.getByRole("row", { name: /Q-1043/ });
    await row.waitFor();
    await row.hover();

    const background = await row.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).toBe(
      rgb(remapped(css, scope, String.raw`.hover\:bg-slate-50:hover`, "background-color")),
    );

    const texts = await row
      .getByRole("cell")
      .evaluateAll((cells) => cells.map((cell) => getComputedStyle(cell).color));
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(contrast(text, background)).toBeGreaterThanOrEqual(4.5);
  });

  test(`theme ${theme}: Table row dividers take the theme's line colour`, async ({ page }) => {
    if (!scope) throw new Error(`${theme} names no scope class`);
    await page.goto(`/iframe.html?id=ui-table--quotes&viewMode=story&globals=theme:${theme}`);
    const rows = page.getByRole("row", { name: /Q-10/ });
    await rows.first().waitFor();

    const expected = rgb(remapped(css, scope, String.raw`.border-slate-200\/70`, "border-color"));
    const dividers = await rows.evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).borderTopColor),
    );
    expect(dividers.length).toBeGreaterThan(1);
    for (const divider of dividers) expect(divider).toBe(expected);
  });
}
