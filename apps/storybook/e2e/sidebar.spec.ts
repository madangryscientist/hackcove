import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { readRepo } from "../scripts/visual-plan.js";

type IndexEntry = { title: string; type: string };

test("the sidebar's top-level order is Overview, then the site's rail", async ({ page }) => {
  const { sections } = await readRepo(join(import.meta.dirname, "..", "..", ".."));
  const response = await page.request.get("/index.json");
  const { entries }: { entries: Record<string, IndexEntry> } = await response.json();
  // Entries come back in sidebar order; the first segment of each title is the top-level group.
  const topLevel = [...new Set(Object.values(entries).map((entry) => entry.title.split("/")[0]))];
  expect(topLevel).toEqual(["Overview", ...sections.map((section) => section.title)]);
});
