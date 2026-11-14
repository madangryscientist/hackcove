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

/**
 * Whether the element at the centre of `target` is `target` or inside it. The tick is
 * `pointer-events-none`, which hit testing skips, so it is made hittable for the probe only: what
 * is left is its paint order against the lifted field (a Card or table row is `isolate`, and its
 * fields sit at `z-10`).
 */
const isHit = (target: Locator): Promise<boolean> =>
  target.evaluate((el) => {
    const style = el instanceof HTMLElement ? el.style : undefined;
    const before = style?.pointerEvents ?? "";
    if (style) style.pointerEvents = "auto";
    const { left, top, width, height } = el.getBoundingClientRect();
    const hit = document.elementFromPoint(left + width / 2, top + height / 2);
    if (style) style.pointerEvents = before;
    return hit !== null && el.contains(hit);
  });

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test(`theme ${theme}: a ticked Checkbox in a Card and a table row draws its tick above the field`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--in-card", theme);
    for (const name of ["Email me when a shop I follow posts", "Select Hack Cove Finds"]) {
      const box = page.getByRole("checkbox", { name });
      await expect(box).toBeChecked();
      const drawn = mark(box);
      await expect(drawn).toBeVisible();
      expect(await isHit(drawn), `${name}: the tick is the topmost element at its centre`).toBe(
        true,
      );
    }
  });

  test(`theme ${theme}: an unticked Checkbox in a Card hides its tick, and a click toggles it`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--in-card", theme);
    const box = page.getByRole("checkbox", { name: "Weekly summary" });
    await expect(box).not.toBeChecked();
    const drawn = mark(box);
    await expect(drawn).toBeHidden();
    await box.click();
    await expect(box).toBeChecked();
    await expect(drawn).toBeVisible();
    await box.click();
    await expect(box).not.toBeChecked();
    await expect(drawn).toBeHidden();
  });

  test(`theme ${theme}: a click on a ticked box in a Card or table row toggles it`, async ({
    page,
  }) => {
    await open(page, "forms-checkbox--in-card", theme);
    for (const name of ["Email me when a shop I follow posts", "Select Hack Cove Finds"]) {
      const box = page.getByRole("checkbox", { name });
      await expect(box).toBeChecked();
      await box.click();
      await expect(box).not.toBeChecked();
      await box.click();
      await expect(box).toBeChecked();
    }
  });
}

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
