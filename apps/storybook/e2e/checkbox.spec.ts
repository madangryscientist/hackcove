import { expect, test, type Locator, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";
import { themeScope } from "@hackcove/themes-shared/scope";

// One theme per CSS file in themes/, found by the glob like the toolbar switcher does.
const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

async function open(page: Page, story: string, theme: string) {
  await page.goto(`/iframe.html?id=${story}&viewMode=story&globals=theme:${theme}`);
  await page.getByRole("checkbox").first().waitFor();
}

/** The paint of a utility inside the theme scope, read off a probe that carries only that class. */
const paint = (page: Page, utility: string) =>
  page.evaluate((cls) => {
    const probe = document.createElement("span");
    probe.className = cls;
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, utility);

/** The drawn check mark that belongs to a checkbox: the label's first element, before the input. */
const mark = (box: Locator) => box.locator("xpath=preceding-sibling::span[1]");

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme, css } of themes) {
  const scope = themeScope(css);

  test(`theme ${theme}: an unchecked Checkbox is an empty surface-coloured box`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--unchecked", theme);
    expect(await page.locator("html").getAttribute("class")).toContain(scope);
    const box = page.getByRole("checkbox", { name: "Open now" });
    await expect(box).not.toBeChecked();
    const style = await box.evaluate((el) => {
      const computed = getComputedStyle(el);
      return {
        appearance: computed.appearance,
        background: computed.backgroundColor,
        borderWidth: computed.borderTopWidth,
      };
    });
    expect(style.appearance).toBe("none");
    expect(style.background).toBe(await paint(page, "bg-white"));
    expect(style.borderWidth).toBe("1px");
    await expect(mark(box)).toBeHidden();
  });

  test(`theme ${theme}: a checked Checkbox shows a filled box with the check mark`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--checked", theme);
    const box = page.getByRole("checkbox", { name: "Open now" });
    await expect(box).toBeChecked();
    const drawn = mark(box);
    await expect(drawn).toBeVisible();
    await expect(drawn.locator("svg path")).toBeVisible();
    expect(await drawn.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
      await paint(page, "bg-violet-600"),
    );
    // The mark sits exactly over the input, so the filled box is the box that was clicked.
    const [boxRect, markRect] = await Promise.all([box.boundingBox(), drawn.boundingBox()]);
    expect(markRect).toEqual(boxRect);
  });
}

test("Checkbox: clicking the label or pressing Space toggles the mark with no re-render", async ({
  page,
}) => {
  await open(page, "forms-checkbox--unchecked", themes[0]?.id ?? "");
  const box = page.getByRole("checkbox", { name: "Open now" });
  const drawn = mark(box);
  await page.getByText("Open now", { exact: true }).click();
  await expect(box).toBeChecked();
  await expect(drawn).toBeVisible();
  await box.focus();
  await page.keyboard.press("Space");
  await expect(box).not.toBeChecked();
  await expect(drawn).toBeHidden();
});

test("Checkbox: the focus ring shows around the drawn box on keyboard focus", async ({ page }) => {
  await open(page, "forms-checkbox--unchecked", themes[0]?.id ?? "");
  await page.keyboard.press("Tab");
  const box = page.getByRole("checkbox", { name: "Open now" });
  await expect(box).toBeFocused();
  const ring = await box.evaluate((el) => {
    const css = getComputedStyle(el);
    return { width: css.outlineWidth, style: css.outlineStyle };
  });
  expect(ring).toEqual({ width: "2px", style: "solid" });
});

test("Checkbox: a disabled one is faded and the drawn box is still there", async ({ page }) => {
  await open(page, "forms-checkbox--disabled", themes[0]?.id ?? "");
  const box = page.getByRole("checkbox", { name: "Open now" });
  await expect(box).toBeDisabled();
  const label = box.locator("xpath=ancestor::label");
  expect(await label.evaluate((el) => getComputedStyle(el).opacity)).toBe("0.5");
  expect(await box.evaluate((el) => getComputedStyle(el).appearance)).toBe("none");
});
