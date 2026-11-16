import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * Morph in the Default story: each card in the grid carries its own view-transition name, the
 * detail carries the name of the card that opened it, the change runs through one view transition
 * each way, under reduced motion it runs none, and where the browser has no View Transitions the
 * page still swaps. The part has no colour, so the first theme is enough.
 */
const [theme] = themeFiles(`${import.meta.dirname}/../../../themes`);

const STORY = "feedback-morph--default";

// Counts calls to document.startViewTransition and hands back what the original returned.
const COUNT_TRANSITIONS = () => {
  if (typeof document.startViewTransition !== "function") return;
  const own = document.startViewTransition.bind(document);
  Reflect.set(window, "__transitions", 0);
  document.startViewTransition = (...args: Parameters<typeof own>) => {
    Reflect.set(window, "__transitions", Number(Reflect.get(window, "__transitions")) + 1);
    return own(...args);
  };
};

// Keeps, for the last view transition, a promise of the names the browser captured in the new
// state: once `ready` settles the pseudo-elements exist, and each `::view-transition-new(<name>)`
// is one element the browser captured under that name.
const RECORD_CAPTURE = () => {
  if (typeof document.startViewTransition !== "function") return;
  const own = document.startViewTransition.bind(document);
  document.startViewTransition = (...args: Parameters<typeof own>) => {
    const transition = own(...args);
    Reflect.set(
      window,
      "__captured",
      transition.ready.then(
        () =>
          document.documentElement
            .getAnimations({ subtree: true })
            .map((a) => (a.effect instanceof KeyframeEffect ? a.effect.pseudoElement : null))
            .filter((p): p is string => p?.startsWith("::view-transition-new(") ?? false)
            .map((p) => p.slice("::view-transition-new(".length, -1)),
        () => [],
      ),
    );
    return transition;
  };
};

const captured = (page: Page) =>
  page.evaluate(async (): Promise<string[]> => {
    const names: unknown = await Reflect.get(window, "__captured");
    return Array.isArray(names) ? names.filter((n): n is string => typeof n === "string") : [];
  });

const open = async (page: Page) => {
  await page.goto(`/iframe.html?id=${STORY}&viewMode=story&globals=theme:${theme?.id}`);
  await expect(page.getByRole("button", { name: "Open Shop B" })).toBeVisible();
};

const transitionName = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => getComputedStyle(el).viewTransitionName);

const transitions = (page: Page) =>
  page.evaluate((): number | undefined => {
    const count: unknown = Reflect.get(window, "__transitions");
    return typeof count === "number" ? count : undefined;
  });

test("the themes folder lists at least one theme", () => {
  expect(theme).toBeDefined();
});

test("each card has its own name, and the detail takes the pressed card's", async ({ page }) => {
  await page.addInitScript(COUNT_TRANSITIONS);
  await open(page);
  const all = await Promise.all(
    ["morph-a", "morph-b", "morph-c"].map((id) => transitionName(page, id)),
  );
  expect(new Set(all).size).toBe(3);
  expect(all).not.toContain("none");
  const shopB = all[1] ?? "";

  await page.getByRole("button", { name: "Open Shop B" }).click();
  await expect(page.getByRole("heading", { name: "Shop B" })).toBeVisible();
  await expect(page.getByTestId("morph-a")).toHaveCount(0);
  expect(await transitionName(page, "morph-detail")).toBe(shopB);
  expect(await transitions(page)).toBe(1);

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("button", { name: "Open Shop B" })).toBeVisible();
  expect(await transitionName(page, "morph-b")).toBe(shopB);
  expect(await transitions(page)).toBe(2);
});

test("under reduced motion the page swaps with no transition", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(COUNT_TRANSITIONS);
  await open(page);
  await page.getByRole("button", { name: "Open Shop B" }).click();
  await expect(page.getByRole("heading", { name: "Shop B" })).toBeVisible();
  expect(await transitions(page)).toBe(0);
});

test("where the browser has no View Transitions the page still swaps", async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(Document.prototype, "startViewTransition");
    Reflect.deleteProperty(document, "startViewTransition");
  });
  await open(page);
  await page.getByRole("button", { name: "Open Shop B" }).click();
  await expect(page.getByRole("heading", { name: "Shop B" })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("button", { name: "Open Shop B" })).toBeVisible();
});

test.describe("a long list", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("names only the cards near the screen, and the page fade names no box", async ({ page }) => {
    await page.addInitScript(COUNT_TRANSITIONS);
    await page.addInitScript(RECORD_CAPTURE);
    await page.goto(
      `/iframe.html?id=feedback-morph--long-list&viewMode=story&globals=theme:${theme?.id}`,
    );
    const first = page.getByRole("button", { name: "Open Market 1", exact: true });
    await expect(first).toBeVisible();
    const all = await page
      .locator('[data-testid^="long-"][data-morph]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).viewTransitionName));
    expect(all).toHaveLength(30);
    expect(all[0]).toBe("hc-morph-long-1");
    expect(all[29]).toBe("none");
    expect(all.filter((n) => n !== "none").length).toBeLessThan(30);

    // The page's fade is the root transition, captured at the viewport's size, not a named box.
    expect(await transitionName(page, "long-page")).toBe("none");
    expect(
      await page.evaluate(() => getComputedStyle(document.documentElement).viewTransitionName),
    ).toBe("root");

    const last = page.getByTestId("long-30");
    await last.scrollIntoViewIfNeeded();
    await expect.poll(() => transitionName(page, "long-30")).toBe("hc-morph-long-30");
    await page.evaluate(() => window.scrollTo(0, 0));

    await first.click();
    await expect(page.getByRole("heading", { name: "Market 1", exact: true })).toBeVisible();
    expect(await transitions(page)).toBe(1);
    await page.getByRole("button", { name: "Back" }).click();
    await expect(first).toBeVisible();
    expect(await transitions(page)).toBe(2);
    expect(await transitionName(page, "long-1")).toBe("hc-morph-long-1");
    // The list remounted inside the transition, and only its near cards were captured named.
    const back = await captured(page);
    expect(back).toContain("hc-morph-long-1");
    expect(back).not.toContain("hc-morph-long-30");
  });
});

for (const [story, name, when] of [
  ["back-restores-scroll", "restore", "in a layout effect"],
  ["back-restores-scroll-async", "restoreasync", "a few microtasks after the commit"],
] as const) {
  test(`Back after the list's scroll is restored ${when} shrinks into the card that was opened`, async ({
    page,
  }) => {
    await page.addInitScript(RECORD_CAPTURE);
    await page.goto(
      `/iframe.html?id=feedback-morph--${story}&viewMode=story&globals=theme:${theme?.id}`,
    );
    const stall = page.getByRole("button", { name: "Open Stall 30", exact: true });
    await stall.scrollIntoViewIfNeeded();
    await expect.poll(() => transitionName(page, `${name}-30`)).toBe(`hc-morph-${name}-30`);
    await stall.click();
    await expect(page.getByRole("heading", { name: "Stall 30", exact: true })).toBeVisible();
    expect(await captured(page)).toContain(`hc-morph-${name}-30`);

    await page.getByRole("button", { name: "Back" }).click();
    await expect(stall).toBeInViewport();
    // The card mounted far down and was scrolled on screen after its own layout effect, yet the
    // browser captured it under its name, so the detail shrinks into it.
    expect(await captured(page)).toContain(`hc-morph-${name}-30`);
  });
}
