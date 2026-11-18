import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * Morph in the Default story: the browser captures each card in the grid under its own
 * view-transition name and the detail under the name of the card that opened it (read from the
 * transition's own pseudo-elements, not from a style), the change runs through one view transition
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

/**
 * A Morph's own box. It wraps the card or the detail with no role or name of its own, so the story's
 * test id is the only way to it; only its `data-morph-near` state is read, never its look.
 */
const morphBox = (page: Page, testId: string) => page.getByTestId(testId);

const transitions = (page: Page) =>
  page.evaluate((): number | undefined => {
    const count: unknown = Reflect.get(window, "__transitions");
    return typeof count === "number" ? count : undefined;
  });

test("the themes folder lists at least one theme", () => {
  expect(theme).toBeDefined();
});

test("each card has its own name, and the detail takes the pressed card's, one view transition each way", async ({
  page,
}) => {
  await page.addInitScript(COUNT_TRANSITIONS);
  await page.addInitScript(RECORD_CAPTURE);
  await open(page);

  await page.getByRole("button", { name: "Open Shop B" }).click();
  await expect(page.getByRole("heading", { name: "Shop B" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Shop A" })).toHaveCount(0);
  // The browser captured the detail under Shop B's card name, so the card grows into it.
  expect(await captured(page)).toEqual(expect.arrayContaining(["hc-morph-shop-b"]));
  expect(await transitions(page)).toBe(1);

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("button", { name: "Open Shop B" })).toBeVisible();
  // Back in the grid, every card was captured under a name of its own, Shop B's the same as before.
  expect(await captured(page)).toEqual(
    expect.arrayContaining(["hc-morph-shop-a", "hc-morph-shop-b", "hc-morph-shop-c"]),
  );
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
    // Only the cards near the screen are named: the first is, the thirtieth is not until it nears.
    await expect(morphBox(page, "long-1")).toHaveAttribute("data-morph-near", "");
    await expect(morphBox(page, "long-30")).not.toHaveAttribute("data-morph-near");
    await page
      .getByRole("button", { name: "Open Market 30", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(morphBox(page, "long-30")).toHaveAttribute("data-morph-near", "");
    await page.evaluate(() => window.scrollTo(0, 0));

    await first.click();
    await expect(page.getByRole("heading", { name: "Market 1", exact: true })).toBeVisible();
    expect(await transitions(page)).toBe(1);
    await page.getByRole("button", { name: "Back" }).click();
    await expect(first).toBeVisible();
    expect(await transitions(page)).toBe(2);
    // The list remounted inside the transition, and only its near cards were captured named.
    const back = await captured(page);
    expect(back).toContain("hc-morph-long-1");
    expect(back).not.toContain("hc-morph-long-30");
    // The page's fade is the root transition, captured at the viewport's size: it names no box.
    expect(back).toContain("root");
    expect(back.filter((name) => name !== "root" && !name.startsWith("hc-morph-long-"))).toEqual(
      [],
    );
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
    await expect(morphBox(page, `${name}-30`)).toHaveAttribute("data-morph-near", "");
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
