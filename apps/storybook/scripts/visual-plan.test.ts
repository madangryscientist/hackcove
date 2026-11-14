import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { themeFiles } from "@hackcove/themes-shared/files";
import { describe, expect, it } from "vitest";
import { GALLERY_TITLE, groupStories, planCapture, readRepo } from "./visual-plan.js";
import { referenceOf } from "./theme-reach.js";
import { grouping, repo, storyFiles } from "./visual-plan.fixture.js";
import { sidebarOrder, titleOf } from "./sidebar-order.js";

const plan = (changed: string[] | undefined, everything = false) =>
  planCapture({ repo, grouping, changed, everything });
/** Per group picked, its captures as `[stems, themes]`. */
const capturesOf = (result: ReturnType<typeof plan>) =>
  Object.fromEntries(
    result.picked.map((group) => [
      group.slug,
      group.captures.map((c) => [c.files.map((file) => file.stem), c.themes]),
    ]),
  );
const picked = (changed: string[] | undefined) => capturesOf(plan(changed));

const [reference = "", ...others] = repo.themes;
const allOverview = ["overview", "palette", "GallerySections"];
/** The Overview group's captures when the Gallery sections are reached: every theme. */
const overviewEverywhere = [
  [allOverview, [reference]],
  [["GallerySections"], others],
];

describe("groupStories", () => {
  it("puts every story file in exactly one group, the first section that names it", () => {
    expect(grouping.groups.map((g) => [g.slug, g.project, g.files.map((f) => f.stem)])).toEqual([
      ["layout", "hackcove-ui-layout", ["Stack"]],
      ["content", "hackcove-ui-content", ["Card", "CardBadge"]],
      ["actions", "hackcove-ui-actions", ["Button"]],
      ["overview", "hackcove-ui-overview", allOverview],
    ]);
    expect(grouping.unsectioned).toEqual([]);
  });

  it("names a story file no page names, and a page that names no story file", () => {
    const { unsectioned, unknown } = groupStories(
      [
        {
          title: "Layout",
          pages: [{ slug: "stack", name: "Stack", pairs: ["Gone/Topic"], stories: [] }],
        },
      ],
      storyFiles,
    );
    expect(unsectioned.map((f) => f.stem)).toEqual(["Button", "Card", "CardBadge", "Stack"]);
    expect(unknown).toEqual(["stack: Gone"]);
  });

  it("slugs a two-word section", () => {
    const [group] = groupStories([{ title: "Page layouts", pages: [] }], []).groups;
    expect(group?.project).toBe("hackcove-ui-page-layouts");
  });
});

describe("the sidebar", () => {
  it("titles each file <Section>/<Page name> and orders Overview, then the sections' rail order", () => {
    expect(grouping.placements.map((placement) => titleOf(placement))).toEqual([
      "Layout/Stack",
      "Content/Card",
      "Content/Card",
      "Actions/Button",
    ]);
    expect(sidebarOrder(grouping)).toEqual([
      "apps/storybook/src/overview.stories.tsx",
      "apps/storybook/src/GallerySections.stories.tsx",
      "apps/storybook/src/palette.stories.tsx",
      "apps/storybook/src/layout/Stack.stories.tsx",
      "apps/storybook/src/Card.stories.tsx",
      "apps/storybook/src/CardBadge.stories.tsx",
      "apps/storybook/src/Button.stories.tsx",
    ]);
  });

  it("puts a file no page names last", () => {
    const only = groupStories(
      [
        {
          title: "Layout",
          pages: [{ slug: "stack", name: "Stack", pairs: [], stories: ["Stack"] }],
        },
      ],
      storyFiles,
    );
    expect(sidebarOrder(only).slice(-3)).toEqual([
      "apps/storybook/src/Button.stories.tsx",
      "apps/storybook/src/Card.stories.tsx",
      "apps/storybook/src/CardBadge.stories.tsx",
    ]);
  });
});

describe("planCapture", () => {
  it("takes the first theme as the reference", () => {
    expect(referenceOf(repo.themes)).toBe("theme-a");
    expect(referenceOf([])).toBeUndefined();
  });

  it("--all shoots every story in the reference theme and the Gallery sections in the others", () => {
    expect(capturesOf(plan([], true))).toEqual({
      layout: [[["Stack"], [reference]]],
      content: [[["Card", "CardBadge"], [reference]]],
      actions: [[["Button"], [reference]]],
      overview: overviewEverywhere,
    });
  });

  it("--all on a branch with one theme keeps the Gallery sections' capture, in no theme", () => {
    const one = planCapture({
      repo: { ...repo, themes: [reference] },
      grouping,
      changed: [],
      everything: true,
    });
    expect(capturesOf(one).overview).toEqual([
      [allOverview, [reference]],
      [["GallerySections"], []],
    ]);
  });

  it("a component change captures its stories in the reference theme, and the Gallery sections in every theme", () => {
    expect(picked(["packages/ui-react/src/focus.ts"])).toEqual({
      actions: [[["Button"], [reference]]],
      overview: overviewEverywhere,
    });
    const { skipped, all } = plan(["packages/ui-react/src/focus.ts"]);
    expect(all).toBe(false);
    expect(skipped.map((g) => g.slug)).toEqual(["layout", "content"]);
  });

  it("a change to another theme's CSS captures only the Gallery sections in that theme, beside Overview", () => {
    const result = plan(["themes/theme-c.css"]);
    expect(capturesOf(result)).toEqual({
      overview: [
        [allOverview, [reference]],
        [["GallerySections"], ["theme-c"]],
      ],
    });
    expect(result.skipped.map((g) => g.slug)).toEqual(["layout", "content", "actions"]);
    expect(result.picked[0]?.why).toEqual(["theme theme-c changed", "always captured"]);
  });

  it("a change to the reference theme's CSS captures every group whole in that theme, and the Gallery sections in the rest", () => {
    expect(picked(["themes/theme-a.css"])).toEqual({
      layout: [[["Stack"], [reference]]],
      content: [[["Card", "CardBadge"], [reference]]],
      actions: [[["Button"], [reference]]],
      overview: overviewEverywhere,
    });
  });

  it("a change to the Gallery captures the Gallery sections in every theme, and nothing else", () => {
    const result = plan(["apps/storybook/src/Gallery.tsx"]);
    expect(capturesOf(result)).toEqual({ overview: overviewEverywhere });
    expect(result.skipped.map((g) => g.slug)).toEqual(["layout", "content", "actions"]);
  });

  it("any other file in the themes package reaches every theme", () => {
    expect(picked(["themes/package.json"])).toEqual(capturesOf(plan([], true)));
  });

  it("a theme file that is gone from the repo captures everything", () => {
    const result = plan(["themes/gone.css"]);
    expect(result.all).toBe(true);
    expect(result.notes.join(" ")).toContain("is in no theme there is now");
  });

  it("a component and another theme's change keep the component's group in the reference theme", () => {
    expect(picked(["themes/theme-c.css", "packages/ui-react/src/Stack.tsx"])).toEqual({
      layout: [[["Stack"], [reference]]],
      overview: overviewEverywhere,
    });
  });

  it.each([
    ["packages/ui-react/palette.json"],
    ["apps/storybook/.storybook/preview.tsx"],
    ["apps/storybook/src/useTheme.ts"],
    ["bun.lock"],
    ["packages/ui-react/package.json"],
    ["apps/storybook/scripts/visual.ts"],
    ["apps/storybook/pixelslash.config.ts"],
    ["apps/storybook/src/Gone.stories.tsx"],
  ])("a change to %s captures everything", (path) => {
    const result = plan([path]);
    expect(result.all).toBe(true);
    expect(result.skipped).toEqual([]);
    expect(result.picked.flatMap((g) => g.picked)).toHaveLength(storyFiles.length);
    expect(result.notes.join(" ")).toContain(path);
  });

  it("a diff that cannot be read, or --all, captures everything", () => {
    expect(plan(undefined).all).toBe(true);
    expect(plan([], true).all).toBe(true);
  });

  it("a docs-only change captures only Overview, in the reference theme, and says so", () => {
    const result = plan(["AGENTS.md", "docs/releasing.md"]);
    expect(picked(["AGENTS.md"])).toEqual({ overview: [[allOverview, [reference]]] });
    expect(result.notes).toContain(
      "nothing a component story shows changed: only Overview is captured",
    );
  });
});

/** A theme id as code would name it: a string, alone or as its file name, not a word in a comment. */
const escaped = (text: string) => text.replaceAll(/[.*+?^$|()[\]{}\\]/g, "\\$&");
const quoted = (id: string) => new RegExp(`["'\`/]${escaped(id)}(\\.css)?["'\`]`);

describe("this repo", () => {
  it("takes the first theme file in sorted order as the reference, and names no theme in code", async () => {
    const root = join(import.meta.dirname, "..", "..", "..");
    const real = await readRepo(root);
    const ids = themeFiles(join(root, "themes")).map((theme) => theme.id);
    expect(ids).toEqual(ids.toSorted());
    expect(real.themes).toEqual(ids);
    expect(referenceOf(real.themes)).toBe(ids[0]);
    const code = globSync("apps/storybook/{scripts/*.ts,pixelslash.config.ts}", { cwd: root })
      .filter((path) => !path.endsWith(".test.ts"))
      .map((path) => [path, readFileSync(join(root, path), "utf8")] as const);
    expect(code.map(([path]) => path)).toContain("apps/storybook/scripts/visual-plan.ts");
    const named = code.flatMap(([path, text]) =>
      ids.filter((id) => quoted(id).test(text)).map((id) => `${path}: ${id}`),
    );
    expect(named).toEqual([]);
  });

  it("has the Gallery sections in the Overview group", async () => {
    const real = await readRepo(join(import.meta.dirname, "..", "..", ".."));
    const { groups } = groupStories(real.sections, real.storyFiles);
    const overview = groups.find((g) => g.slug === "overview");
    expect(overview?.files.map((f) => f.title)).toContain(GALLERY_TITLE);
  });

  it("has no story file the site docs leave out of every section", async () => {
    const real = await readRepo(join(import.meta.dirname, "..", "..", ".."));
    const { groups, unsectioned, unknown } = groupStories(real.sections, real.storyFiles);
    expect(unsectioned.map((f) => f.path)).toEqual([]);
    expect(unknown).toEqual([]);
    expect(groups.flatMap((g) => g.files)).toHaveLength(real.storyFiles.length);
  });

  it("titles every story <Section>/<Page name> from the site, and sorts the sidebar like the rail", async () => {
    const real = await readRepo(join(import.meta.dirname, "..", "..", ".."));
    const realGrouping = groupStories(real.sections, real.storyFiles);
    const expected = new Map(
      realGrouping.placements.map((placement) => [placement.file.path, titleOf(placement)]),
    );
    // A story file the site's sections do not name is an Overview one, and keeps its own title.
    const wrong = real.storyFiles
      .filter((file) => file.title !== (expected.get(file.path) ?? file.title))
      .map((file) => `${file.path}: ${file.title} (want ${expected.get(file.path)})`);
    expect(wrong).toEqual([]);
    const outside = real.storyFiles.filter((file) => !expected.has(file.path));
    expect(outside.map((file) => file.title.split("/")[0])).toEqual(outside.map(() => "Overview"));

    // The sidebar's titles, in order: Overview, then the sections in rail order, pages in page order.
    const titles = sidebarOrder(realGrouping).map(
      (path) => real.storyFiles.find((file) => file.path === path)?.title,
    );
    const railTitles = real.sections.flatMap((section) =>
      section.pages.map((page) => `${section.title}/${page.name}`),
    );
    expect([...new Set(titles.map((title) => title?.split("/")[0]))]).toEqual([
      "Overview",
      ...real.sections.map((section) => section.title),
    ]);
    expect(railTitles.filter((title) => titles.includes(title))).toEqual([
      ...new Set(titles.filter((title) => railTitles.includes(title ?? ""))),
    ]);
  });
});
