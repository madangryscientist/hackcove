import { expect, test, type Locator, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";

/**
 * The `Loading` story of each collection, picture and figure part, in the reference theme (the
 * Gallery's Loading block covers the rest): while `loading` an owner is busy, its label is in the
 * accessibility tree and no data shows; flipping the arg lands the data, by role, and drops
 * `aria-busy`.
 */
const reference = themeFiles(`${import.meta.dirname}/../../../themes`)[0]?.id ?? "";

const open = async (page: Page, story: string, loading: boolean) => {
  await page.goto(
    `/iframe.html?id=${story}&viewMode=story&globals=theme:${reference}&args=loading:!${loading}`,
  );
};

const busy = (page: Page) => page.locator("[aria-busy='true']");

/** Each story, and the data it shows once it lands. */
const stories: Record<string, (page: Page) => Locator> = {
  "data-table--loading": (page) => page.getByRole("cell", { name: "Q-1043" }),
  "content-card--loading": (page) => page.getByText("Cove Hardware asked for a second quote"),
  "data-listrow--loading": (page) => page.getByText("Cove Hardware"),
  "content-timeline--loading": (page) => page.getByText("Quote sent"),
  "content-avatarstack--loading": (page) =>
    page.getByRole("img", { name: "Mia Botha, Sipho Dube, Ana Lima" }),
  "data-progressbar--loading": (page) => page.getByRole("progressbar", { name: "Upload" }),
  "data-splitbar--loading": (page) => page.getByRole("img", { name: /^Pot split/ }),
  "data-stackedbar--loading": (page) => page.getByRole("img", { name: /^Screenshots by status/ }),
  "data-trendchart--loading": (page) =>
    page.getByRole("table", { name: "Tickets opened and closed per week" }),
};

test("the themes folder has a reference theme", () => {
  expect(reference).not.toBe("");
});

for (const [story, data] of Object.entries(stories)) {
  test(`${story}: busy and labelled with no data while loading; landing shows it`, async ({
    page,
  }) => {
    await open(page, story, true);
    await expect(busy(page).first()).toBeAttached();
    await expect(page.getByText("Loading").first()).toBeAttached();
    await expect(data(page)).toHaveCount(0);
    for (const bone of await page.locator("[data-skeleton]").all()) {
      await expect(
        bone.locator("xpath=ancestor-or-self::*[@aria-hidden='true']").first(),
      ).toBeAttached();
    }

    await open(page, story, false);
    await expect(data(page)).toBeAttached();
    await expect(busy(page)).toHaveCount(0);
    await expect(page.locator("[data-skeleton]")).toHaveCount(0);
  });
}
