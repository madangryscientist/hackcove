import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";
import { themeScope } from "@hackcove/themes-shared/scope";

// Same source of truth as the toolbar switcher: one theme per CSS file under themes/*/.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

const pillStory = "text-body-text--pills";

async function open(page: Page, theme: string) {
  await page.goto(`/iframe.html?id=${pillStory}&viewMode=story&globals=theme:${theme}`);
  await page.getByText("amber", { exact: true }).waitFor();
}

/**
 * The Pill's paint inside the theme scope (the toolbar's theme sits on `<html>`), and the same
 * classes on a probe measured with the scope class taken off: the components' stock Tailwind
 * utilities, which a theme must remap.
 */
const pillBackgrounds = (page: Page, tone: string) =>
  page.getByText(tone, { exact: true }).evaluate((el) => {
    const root = document.documentElement;
    const scope = [...root.classList];
    const probe = document.createElement("span");
    probe.className = el.className;
    document.body.append(probe);
    const themed = getComputedStyle(el).backgroundColor;
    root.classList.remove(...scope);
    const stock = getComputedStyle(probe).backgroundColor;
    root.classList.add(...scope);
    probe.remove();
    return { themed, stock };
  });

async function snapshot(page: Page, theme: string) {
  await open(page, theme);
  return {
    classes: await page
      .locator("[data-theme]")
      .first()
      .evaluate((el) => [...el.classList]),
    amber: await pillBackgrounds(page, "amber"),
    slate: await pillBackgrounds(page, "slate"),
  };
}

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme, css } of themes) {
  const scope = themeScope(css);

  test(`theme ${theme} remaps the slate and amber Pills under its own scope`, async ({ page }) => {
    const themed = await snapshot(page, theme);

    expect(scope).toBeDefined();
    expect(themed.classes).toEqual([scope]);
    expect(themed.slate.themed).not.toBe(themed.slate.stock);
    expect(themed.amber.themed).not.toBe(themed.amber.stock);
  });
}

test("Overview / All themes lays out every theme, each under its own scope, with its own frame paint", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=overview--all-themes&viewMode=story");
  await page.getByText("nothing here yet").first().waitFor();

  const panels = await page.locator("[data-theme]").evaluateAll((els) =>
    els.map((el) => ({
      theme: el.getAttribute("data-theme"),
      classes: [...el.classList],
      background: getComputedStyle(el).backgroundColor,
    })),
  );

  expect(panels).toHaveLength(themes.length);

  for (const { id, css } of themes) {
    const scope = themeScope(css);
    const panel = panels.find((candidate) => candidate.theme === id);

    expect(panel?.classes).toEqual([scope]);
    expect(panel?.background).not.toBe("rgba(0, 0, 0, 0)");
  }
});
