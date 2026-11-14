import { expect, type Locator, type Page, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

/** The moves a story's list reported, in order (the story writes them on its caption). */
async function moves(page: Page, index = 0): Promise<unknown> {
  const raw = await page.locator("[data-moves]").nth(index).getAttribute("data-moves");
  return JSON.parse(raw ?? "[]");
}

const list = (page: Page, name = "Task queue") => page.getByRole("grid", { name });

/** The item titles under one section heading, top to bottom, read from their handles. */
async function sectionTitles(grid: Locator, section: string): Promise<string[]> {
  return grid
    .getByRole("rowgroup", { name: section })
    .getByRole("button", { name: /^Reorder / })
    .evaluateAll((handles) =>
      handles.map((h) => (h.getAttribute("aria-label") ?? "").replace(/^Reorder /, "")),
    );
}

/** The count a section's heading shows. */
const count = (grid: Locator, section: string) =>
  grid.getByRole("rowgroup", { name: section }).getByRole("rowheader");

const row = (grid: Locator, title: string) => grid.getByRole("row", { name: title, exact: true });

const URGENT = [
  "Restore the nightly backup",
  "Renew the TLS certificate",
  "Fix the failing payment webhook",
] as const;

/** Presses each key in turn. */
async function press(page: Page, keys: string[]) {
  for (const key of keys) await page.keyboard.press(key);
}

/**
 * The keyboard move, as the docs write it: Tab into the list (the first row), ArrowDown to the row,
 * ArrowRight to its "Reorder" handle, Enter to pick it up. Each ArrowUp or ArrowDown then moves the
 * drop line one gap, across section headings too, and Enter drops. The drag takes the keyboard just
 * after the Enter, so this waits for it (startDrag) before the next key.
 */
async function pickUp(page: Page, rowIndex: number) {
  await press(page, ["Tab", ...Array.from({ length: rowIndex }, () => "ArrowDown"), "ArrowRight"]);
  await startDrag(page);
}

/** Enter on the focused handle, then wait until its row is dragging. */
async function startDrag(page: Page) {
  await page.keyboard.press("Enter");
  await expect(page.locator('[role="row"][data-dragging]')).toHaveCount(1);
  // The row is marked before react-aria's drag manager takes the keyboard; it moves focus to the
  // list it drops into when it does, and a key pressed before that is lost.
  await expect(list(page)).toBeFocused();
}

async function open(page: Page, id = "data-sortablelist--default") {
  await page.goto(story(id));
  await list(page, id.endsWith("two-lists") ? "Home queue" : "Task queue").waitFor();
}

// Playwright's WebKit does not deliver HTML5 drag and drop events, so a pointer drag never starts
// there; the keyboard specs below run in every engine. Touch is a device check, not a spec.
const pointerSkip = (browserName: string) =>
  test.skip(browserName === "webkit", "Playwright's WebKit does not run HTML5 drag and drop");

test("SortableList: dragging the third row above the first reports one move and the story reorders", async ({
  page,
  browserName,
}) => {
  pointerSkip(browserName);
  await open(page);
  const grid = list(page);
  await row(grid, URGENT[2]).dragTo(row(grid, URGENT[0]), { targetPosition: { x: 200, y: 4 } });
  await expect
    .poll(() => moves(page))
    .toEqual([{ id: "t3", section: "urgent", target: { id: "t1", position: "before" } }]);
  expect(await sectionTitles(grid, "Urgent")).toEqual([URGENT[2], URGENT[0], URGENT[1]]);
});

test("SortableList: a drag into another section reports that section and raises its count", async ({
  page,
  browserName,
}) => {
  pointerSkip(browserName);
  await open(page);
  const grid = list(page);
  await expect(count(grid, "High")).toHaveText("High5");
  await row(grid, URGENT[0]).dragTo(row(grid, "Answer the landlord about the lease"), {
    targetPosition: { x: 200, y: 4 },
  });
  await expect
    .poll(() => moves(page))
    .toEqual([{ id: "t1", section: "high", target: { id: "t5", position: "before" } }]);
  await expect(count(grid, "High")).toHaveText("High6");
  await expect(count(grid, "Urgent")).toHaveText("Urgent2");
  expect((await sectionTitles(grid, "High"))[1]).toBe(URGENT[0]);
});

test("SortableList: a drop on the empty section's Drop here row reports the section and no target", async ({
  page,
  browserName,
}) => {
  pointerSkip(browserName);
  await open(page);
  const grid = list(page);
  await row(grid, URGENT[1]).dragTo(row(grid, "Drop here"));
  await expect.poll(() => moves(page)).toEqual([{ id: "t2", section: "low" }]);
  expect(await sectionTitles(grid, "Low")).toEqual([URGENT[1]]);
  await expect(row(grid, "Drop here")).toHaveCount(0);
});

test("SortableList: two lists on one page never take each other's items", async ({
  page,
  browserName,
}) => {
  pointerSkip(browserName);
  await open(page, "data-sortablelist--two-lists");
  const home = list(page, "Home queue");
  const work = list(page, "Work queue");
  await row(work, "Plan the sprint").dragTo(row(home, URGENT[0]), {
    targetPosition: { x: 100, y: 4 },
  });
  await row(home, URGENT[1]).dragTo(row(work, "Plan the sprint"), {
    targetPosition: { x: 100, y: 4 },
  });
  // A drop that is refused fires nothing, so there is no event to wait for: the next in-list drag
  // proves the page settled, and the earlier ones must still have reported nothing.
  await row(work, "Write the release notes").dragTo(row(work, "Plan the sprint"), {
    targetPosition: { x: 100, y: 4 },
  });
  await expect
    .poll(() => moves(page, 1))
    .toEqual([{ id: "w2", section: "work", target: { id: "w1", position: "before" } }]);
  expect(await moves(page, 0)).toEqual([]);
});

test("SortableList: from the keyboard, the second item moves to first", async ({ page }) => {
  await open(page);
  const grid = list(page);
  // The drop line starts after the item picked up; two steps up is before the first.
  await pickUp(page, 1);
  await press(page, ["ArrowUp", "ArrowUp", "Enter"]);
  await expect
    .poll(() => moves(page))
    .toEqual([{ id: "t2", section: "urgent", target: { id: "t1", position: "before" } }]);
  expect(await sectionTitles(grid, "Urgent")).toEqual([URGENT[1], URGENT[0], URGENT[2]]);
});

for (const [name, keys] of [
  ["Escape", ["Escape"]],
  // Tab does not leave the list during a move: it cycles the page's drop areas (here only this
  // one), and only Enter or Escape ends the move.
  ["Tab, then Escape", ["Tab", "Escape"]],
] as const) {
  test(`SortableList: ${name} mid-move leaves the order as it was`, async ({ page }) => {
    await open(page);
    const grid = list(page);
    await pickUp(page, 1);
    await press(page, ["ArrowUp", "ArrowUp", ...keys]);
    // The move ends with focus back on the handle and the order unchanged.
    const handle = grid.getByRole("button", { name: `Reorder ${URGENT[1]}` });
    await expect(handle).toBeFocused();
    await expect(page.locator('[role="row"][data-dragging]')).toHaveCount(0);
    expect(await sectionTitles(grid, "Urgent")).toEqual([...URGENT]);
    // A cancelled move fires nothing, so there is no event to wait for: a finished move after it
    // lands, and must be the only one reported.
    await startDrag(page);
    await press(page, ["ArrowUp", "ArrowUp", "Enter"]);
    await expect
      .poll(() => moves(page))
      .toEqual([{ id: "t2", section: "urgent", target: { id: "t1", position: "before" } }]);
  });
}

test("SortableList: from the keyboard, an item moves into the next section", async ({ page }) => {
  await open(page);
  const grid = list(page);
  // The last item of Urgent: one step down crosses the High heading, to before High's first item.
  await pickUp(page, 2);
  await press(page, ["ArrowDown", "Enter"]);
  await expect
    .poll(() => moves(page))
    .toEqual([{ id: "t3", section: "high", target: { id: "t4", position: "before" } }]);
  await expect(count(grid, "High")).toHaveText("High6");
  expect((await sectionTitles(grid, "High"))[0]).toBe(URGENT[2]);
});

test("SortableList: from the keyboard, a drop on the empty section reports the section and no target", async ({
  page,
}) => {
  await open(page);
  const grid = list(page);
  // The last item of High (row 8): one step down is the empty Low section's Drop here row.
  await pickUp(page, 7);
  await press(page, ["ArrowDown", "Enter"]);
  await expect.poll(() => moves(page)).toEqual([{ id: "t8", section: "low" }]);
  expect(await sectionTitles(grid, "Low")).toEqual(["Archive last year's receipts"]);
});
