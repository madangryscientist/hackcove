import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  closureOf,
  barrelOf,
  groupStories,
  planCapture,
  readRepo,
  type Repo,
  type Section,
  type StoryFile,
} from "./visual-plan.js";

const story = (stem: string, title: string, dir = "apps/storybook/src"): StoryFile => ({
  path: `${dir}/${stem}.stories.tsx`,
  stem,
  title,
});

const storyFiles = [
  story("Button", "UI/Button"),
  story("Card", "UI/Card"),
  story("CardBadge", "UI/CardBadge"),
  story("Stack", "Layout/Stack", "apps/storybook/src/layout"),
  story("overview", "Overview"),
  story("palette", "Overview/Palette"),
];

const files: Record<string, string> = {
  "packages/ui/src/index.ts": [
    'export { Button, type ButtonProps } from "./Button.js";',
    'export {\n  Card,\n  type CardProps,\n} from "./Card.js";',
    'export { Stack } from "./Stack.js";',
  ].join("\n"),
  "packages/ui/src/Button.tsx": 'import { focusRing } from "./focus.js";',
  "packages/ui/src/focus.ts": "export const focusRing = '';",
  "packages/ui/src/Card.tsx": 'import type { ButtonProps } from "./Button.js";',
  "packages/ui/src/Stack.tsx": "",
  "apps/storybook/src/Button.stories.tsx": 'import { Button } from "@hackcove/ui";',
  "apps/storybook/src/Card.stories.tsx":
    'import { Card, type CardProps } from "@hackcove/ui";\nimport { sample } from "./sample";',
  "apps/storybook/src/CardBadge.stories.tsx": 'import { Card } from "@hackcove/ui";',
  "apps/storybook/src/sample.ts": "export const sample = 1;",
  "apps/storybook/src/layout/Stack.stories.tsx": 'import { Stack } from "@hackcove/ui";',
  "apps/storybook/src/overview.stories.tsx": 'import { Gallery } from "./Gallery";',
  "apps/storybook/src/Gallery.tsx": 'import * as ui from "@hackcove/ui";',
  "apps/storybook/src/palette.stories.tsx": "",
  "apps/storybook/.storybook/preview.tsx": 'import { ThemeDocument } from "./themes";',
  "apps/storybook/.storybook/themes.tsx": 'import { useTheme } from "../src/useTheme";',
  "apps/storybook/src/useTheme.ts": "",
};

const sections: Section[] = [
  {
    title: "Layout",
    pages: [{ slug: "stack", pairs: [], stories: ["Stack"] }],
  },
  {
    title: "Content",
    pages: [{ slug: "card", pairs: ["Card/Title"], stories: ["CardBadge"] }],
  },
  {
    title: "Actions",
    pages: [
      { slug: "button", pairs: ["Button/Variants", "Button/Sizes"] },
      { slug: "card-action", pairs: ["Card/Action"] },
    ],
  },
];

const repo: Repo = {
  read: (path) => files[path],
  storyFiles,
  sections,
  themes: ["catppuccin-mocha", "thrifty-paper"],
};

const grouping = groupStories(sections, storyFiles);
const plan = (changed: string[] | undefined, everything = false) =>
  planCapture({ repo, grouping, changed, everything });
const picked = (changed: string[] | undefined) =>
  Object.fromEntries(
    plan(changed).picked.map((group) => [
      group.slug,
      { stems: group.picked.map((file) => file.stem), themes: group.themes },
    ]),
  );

describe("groupStories", () => {
  it("puts every story file in exactly one group, the first section that names it", () => {
    expect(grouping.groups.map((g) => [g.slug, g.project, g.files.map((f) => f.stem)])).toEqual([
      ["layout", "hackcove-ui-layout", ["Stack"]],
      ["content", "hackcove-ui-content", ["Card", "CardBadge"]],
      ["actions", "hackcove-ui-actions", ["Button"]],
      ["overview", "hackcove-ui-overview", ["overview", "palette"]],
    ]);
    expect(grouping.unsectioned).toEqual([]);
  });

  it("names a story file no page names, and a page that names no story file", () => {
    const { unsectioned, unknown } = groupStories(
      [{ title: "Layout", pages: [{ slug: "stack", pairs: ["Gone/Topic"], stories: [] }] }],
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

describe("closureOf", () => {
  const barrel = barrelOf(repo.read);

  it("follows a named import through the barrel to its module only", () => {
    const closure = closureOf("apps/storybook/src/Button.stories.tsx", repo.read, barrel);
    expect([...closure].toSorted()).toEqual([
      "apps/storybook/src/Button.stories.tsx",
      "packages/ui/src/Button.tsx",
      "packages/ui/src/focus.ts",
      "packages/ui/src/index.ts",
    ]);
  });

  it("skips type-only imports and follows a namespace import to every module", () => {
    const card = closureOf("apps/storybook/src/Card.stories.tsx", repo.read, barrel);
    expect(card.has("packages/ui/src/Button.tsx")).toBe(false);
    expect(card.has("apps/storybook/src/sample.ts")).toBe(true);
    const overview = closureOf("apps/storybook/src/overview.stories.tsx", repo.read, barrel);
    expect(overview.has("packages/ui/src/Stack.tsx")).toBe(true);
  });
});

describe("planCapture", () => {
  it("a one-component change captures the stories it reaches, in every theme, and Overview", () => {
    expect(picked(["packages/ui/src/focus.ts"])).toEqual({
      actions: { stems: ["Button"], themes: repo.themes },
      overview: { stems: ["overview", "palette"], themes: repo.themes },
    });
    const { skipped, all } = plan(["packages/ui/src/focus.ts"]);
    expect(all).toBe(false);
    expect(skipped.map((g) => g.slug)).toEqual(["layout", "content"]);
  });

  it("a theme-only change captures every group in that theme only", () => {
    const groups = plan(["themes/thrifty-paper/theme.css"]).picked;
    expect(groups.map((g) => g.slug)).toEqual(["layout", "content", "actions", "overview"]);
    for (const group of groups) {
      expect(group.themes).toEqual(["thrifty-paper"]);
      expect(group.picked).toEqual(group.files);
    }
  });

  it("a component and a theme change give the component's group every theme", () => {
    const result = picked(["themes/thrifty-paper/theme.css", "packages/ui/src/Stack.tsx"]);
    expect(result["layout"]?.themes).toEqual(repo.themes);
    expect(result["actions"]?.themes).toEqual(["thrifty-paper"]);
  });

  it.each([
    ["packages/ui/palette.json"],
    ["apps/storybook/.storybook/preview.tsx"],
    ["apps/storybook/src/useTheme.ts"],
    ["bun.lock"],
    ["packages/ui/package.json"],
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

  it("a docs-only change captures only Overview, and says so", () => {
    const result = plan(["AGENTS.md", "docs/releasing.md"]);
    expect(Object.keys(picked(["AGENTS.md"]))).toEqual(["overview"]);
    expect(result.notes).toContain(
      "nothing a component story shows changed: only Overview is captured",
    );
  });
});

describe("this repo", () => {
  it("has no story file the site docs leave out of every section", async () => {
    const real = await readRepo(join(import.meta.dirname, "..", "..", ".."));
    const { groups, unsectioned, unknown } = groupStories(real.sections, real.storyFiles);
    expect(unsectioned.map((f) => f.path)).toEqual([]);
    expect(unknown).toEqual([]);
    expect(groups.flatMap((g) => g.files)).toHaveLength(real.storyFiles.length);
  });
});
