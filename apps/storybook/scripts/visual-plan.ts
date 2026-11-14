/**
 * What `nx run storybook:visual` captures: the story files, grouped by the site docs' sections, and
 * the groups and themes a change reaches.
 *
 * A group is a section of the component docs (`componentSections` on the site), holding every story
 * file a page in it names (`pairs`, `fullPage`, `stories`). A file named by pages in two sections
 * goes to the first in rail order, so every file is in exactly one group. Storybook's Overview is a
 * group of its own and is always captured. A story file no page names is unsectioned: a test fails
 * on it, and so does the run.
 *
 * Every story is shot in one theme, the reference theme: the first theme file in sorted order
 * (`themeFiles`), so no theme is named here. Every other theme is shot in the Gallery sections
 * (`Overview/Gallery sections`, one story per `gallerySections` entry, which render every component
 * the library exports) and nothing else. So a group is a list of captures, each some story files in
 * some themes: the reference theme's, and in the Overview group a second one, the Gallery sections
 * in the other themes. A theme added costs the Gallery sections, not every story.
 *
 * A change reaches a story file when the file's static imports (followed through the
 * `@hackcove/ui-react` barrel to the module that exports each name) lead to a changed file. It is
 * captured in the reference theme, and when the Gallery sections are among the files reached, they
 * are captured in every other theme too. A change to the reference theme's CSS file reaches every
 * group in that theme; to another theme's CSS file, `themes/<id>.css`, only the Gallery sections in
 * that theme (Overview is always captured, and its All themes sections show every theme); to any
 * other file in the themes package, every theme. A change to shared ground (the palette,
 * Storybook's config and what it imports, a manifest or the lockfile, the visual tooling) or a diff
 * that cannot be read reaches everything.
 *
 * Everything here is pure but `readRepo`, so the tests hand it a repo of their own.
 */
import { globSync, readFileSync } from "node:fs";
import { join, posix } from "node:path";
import { themeFiles } from "@hackcove/themes-shared/files";
import { barrelOf, closureOf, type Reader } from "./import-graph.js";
import type { Page, Placement, Section } from "./site-types.js";
import { themesOf } from "./theme-reach.js";

export type { Placement, Reader, Section };

export type StoryFile = {
  /** Repo-relative, e.g. `apps/storybook/src/Button.stories.tsx`. */
  path: string;
  /** The file name without `.stories.tsx`: what `pairs` call `<File>`. */
  stem: string;
  /** The meta's `title`, which PixelSlash's `storybook.include` matches. */
  title: string;
};

export type Group = {
  /** `actions`, `page-layouts`: the Nx project is `visual-<slug>`. */
  slug: string;
  title: string;
  /** The PixelSlash project the group uploads to. */
  project: string;
  files: StoryFile[];
};

export type Grouping = {
  groups: Group[];
  /** Every sectioned story file, in the site's rail order: section, then page, then file. */
  placements: Placement[];
  /** Story files no page names. */
  unsectioned: StoryFile[];
  /** `<page>: <File>` for a file a page names that is not in Storybook. */
  unknown: string[];
};

export type Repo = {
  read: Reader;
  storyFiles: StoryFile[];
  sections: Section[];
  /**
   * The ids of the themes: each `*.css` file at the top of `themes/`, in `themeFiles` order (sorted
   * by id), so the first is the reference theme.
   */
  themes: string[];
};

export const OVERVIEW = "overview";

/** The story file every theme is shot in: the Gallery in slices, one story per section. */
export const GALLERY_TITLE = "Overview/Gallery sections";

const isGallery = (file: StoryFile) => file.title === GALLERY_TITLE;

/**
 * The reference theme, shot in every story: the first of `themes` (`themeFiles` order, sorted by id).
 * A new theme that sorts first becomes the reference and takes the full set over.
 */
export const referenceOf = (themes: string[]): string | undefined => themes[0];

export const slugOf = (title: string) =>
  title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");

export const projectOf = (slug: string) => `hackcove-ui-${slug}`;

const isOverview = (file: StoryFile) =>
  file.title === "Overview" || file.title.startsWith("Overview/");

/** The story files a page names: `<File>` of each pair and of its full page, and its `stories`. */
function stemsOf(page: Page): string[] {
  const named = [...page.pairs, ...(page.fullPage === undefined ? [] : [page.fullPage])];
  return [...named.map((id) => id.split("/")[0] ?? id), ...(page.stories ?? [])];
}

export function groupStories(sections: Section[], storyFiles: StoryFile[]): Grouping {
  const byStem = new Map(storyFiles.map((file) => [file.stem, file]));
  const placed = new Set<string>();
  const unknown: string[] = [];
  const placements: Placement[] = [];
  const groups: Group[] = sections.map((section) => {
    const slug = slugOf(section.title);
    const files: StoryFile[] = [];
    for (const page of section.pages)
      for (const stem of stemsOf(page)) {
        const file = byStem.get(stem);
        if (file === undefined) unknown.push(`${page.slug}: ${stem}`);
        else if (!placed.has(file.path) && !isOverview(file)) {
          placed.add(file.path);
          files.push(file);
          placements.push({ file, section, page });
        }
      }
    return { slug, title: section.title, project: projectOf(slug), files };
  });
  const overview = storyFiles.filter(isOverview);
  groups.push({ slug: OVERVIEW, title: "Overview", project: projectOf(OVERVIEW), files: overview });
  for (const file of overview) placed.add(file.path);
  const unsectioned = storyFiles.filter((file) => !placed.has(file.path));
  return { groups, placements, unsectioned, unknown: [...new Set(unknown)] };
}

/* ---------------------------------------------------------------------------
   The plan
   --------------------------------------------------------------------------- */

const SHARED: RegExp[] = [
  /^packages\/ui-react\/palette\.json$/,
  /^apps\/storybook\/\.storybook\//,
  /^apps\/storybook\/scripts\//,
  /^apps\/storybook\/pixelslash\.config\.ts$/,
  /^apps\/storybook\/e2e\/serve\.ts$/,
  /^packages\/themes-shared\//,
  /^bun\.lock$/,
  /(^|\/)package\.json$/,
];

/** Why a changed file reaches every group in every theme, or `undefined`. */
function sharedWhy(path: string, configClosure: Set<string>): string | undefined {
  if (configClosure.has(path)) return `${path} is imported by Storybook's config`;
  if (path.startsWith("themes/")) return undefined;
  return SHARED.some((pattern) => pattern.test(path)) ? `${path} is shared ground` : undefined;
}

/** One capture of a group: these story files, each in each of these themes. */
export type Capture = { files: StoryFile[]; themes: string[] };

export type GroupPick = Group & {
  /** The story files any capture takes: a subset of `files`, in its order. */
  picked: StoryFile[];
  /** The reference theme's capture first, then the Gallery sections' in other themes, if any. */
  captures: Capture[];
  why: string[];
};

export type Plan = {
  /** Every group whole, nothing skipped. */
  all: boolean;
  /** Why it is `all`, or a note on the change as a whole. */
  notes: string[];
  picked: GroupPick[];
  skipped: Group[];
};

export type PlanInput = {
  repo: Repo;
  grouping: Grouping;
  /** The files the branch changed against its base, or `undefined` when git could not say. */
  changed: string[] | undefined;
  /** `--all` / `VISUAL_ALL=1`. */
  everything: boolean;
};

const list = (items: string[], max = 3) =>
  items.length <= max
    ? items.join(", ")
    : `${items.slice(0, max).join(", ")} and ${items.length - max} more`;

/** Why the change reaches every group in every theme, or `[]` when it does not. */
function everythingWhy(repo: Repo, changed: string[], barrel: Map<string, string>): string[] {
  const configClosure = new Set(
    ["main.ts", "preview.tsx", "themes.tsx"].flatMap((config) => [
      ...closureOf(`apps/storybook/.storybook/${config}`, repo.read, barrel),
    ]),
  );
  const shared = changed.flatMap((path) => sharedWhy(path, configClosure) ?? []);
  if (shared.length > 0) return shared;
  const known = new Set(repo.storyFiles.map((file) => file.path));
  const gone = changed.filter((path) => path.endsWith(".stories.tsx") && !known.has(path));
  if (gone.length > 0) return gone.map((path) => `${path} was removed`);
  const strayTheme = changed.find((path) =>
    themesOf(repo, path)?.some((id) => !repo.themes.includes(id)),
  );
  return strayTheme === undefined ? [] : [`${strayTheme} is in no theme there is now`];
}

type Reach = {
  /** The themes a change under `themes/` touched. */
  themed: string[];
  /** Per story file reached, the changed files that reach it. */
  reached: Map<string, string[]>;
  unreached: string[];
};

function reachOf(repo: Repo, changed: string[], barrel: Map<string, string>): Reach {
  const closures = repo.storyFiles.map((file) => ({
    story: file.path,
    closure: closureOf(file.path, repo.read, barrel),
  }));
  const themed = new Set<string>();
  const reached = new Map<string, string[]>();
  const unreached: string[] = [];
  for (const path of changed) {
    const touched = themesOf(repo, path);
    for (const id of touched ?? []) themed.add(id);
    const stories = closures.filter((c) => c.closure.has(path)).map((c) => c.story);
    for (const story of stories) reached.set(story, [...(reached.get(story) ?? []), path]);
    if (touched === undefined && stories.length === 0) unreached.push(path);
  }
  return { themed: [...themed].toSorted(), reached, unreached };
}

/** A group's captures: `files` in the reference theme, and its Gallery sections in `galleryThemes`. */
function capturesOf(
  group: Group,
  files: StoryFile[],
  reference: string | undefined,
  galleryThemes: string[],
): GroupPick {
  const gallery = group.files.filter(isGallery);
  const captures: Capture[] = [];
  if (reference !== undefined && files.length > 0) captures.push({ files, themes: [reference] });
  if (gallery.length > 0 && galleryThemes.length > 0)
    captures.push({ files: gallery, themes: galleryThemes });
  const taken = new Set(captures.flatMap((c) => c.files));
  return { ...group, picked: group.files.filter((file) => taken.has(file)), captures, why: [] };
}

/** Per changed file, the stems of `files` it reaches: `path → Stem, Stem`. */
function reachedWhy(files: StoryFile[], reach: Reach): string[] {
  const stems = new Map<string, string[]>();
  for (const file of files)
    for (const path of reach.reached.get(file.path) ?? [])
      stems.set(path, [...(stems.get(path) ?? []), file.stem]);
  return [...stems].map(([path, reached]) => `${path} → ${list(reached)}`);
}

/** One group's captures under `reach`, or `undefined` when the change does not reach it. */
function pickOf(group: Group, reach: Reach, themes: string[]): GroupPick | undefined {
  const [reference, ...others] = themes;
  const reached = group.files.filter((file) => reach.reached.has(file.path));
  const overview = group.slug === OVERVIEW;
  // The reference theme's own change shows in every story; Overview is always captured.
  const whole = overview || (reference !== undefined && reach.themed.includes(reference));
  // A story change in the Gallery sections shows in every theme; a theme's own change, in it.
  const galleryThemes = reached.some(isGallery)
    ? others
    : others.filter((id) => reach.themed.includes(id));
  const pick = capturesOf(group, whole ? group.files : reached, reference, galleryThemes);
  if (pick.captures.length === 0) return undefined;
  const why = reachedWhy(reached, reach);
  const themed = new Set(pick.captures.flatMap((c) => c.themes));
  const changed = reach.themed.filter((id) => themed.has(id));
  if (changed.length > 0) why.push(`theme ${changed.join(", ")} changed`);
  if (overview) why.push("always captured");
  return { ...pick, why };
}

export function planCapture({ repo, grouping, changed, everything }: PlanInput): Plan {
  const full = (notes: string[]): Plan => ({
    all: true,
    notes,
    picked: grouping.groups.map((group) =>
      capturesOf(group, group.files, referenceOf(repo.themes), repo.themes.slice(1)),
    ),
    skipped: [],
  });
  if (everything) return full(["--all (or VISUAL_ALL=1) asks for every group"]);
  if (changed === undefined) return full(["the diff against the base could not be read"]);
  const barrel = barrelOf(repo.read);
  const why = everythingWhy(repo, changed, barrel);
  if (why.length > 0) return full(why);

  const reach = reachOf(repo, changed, barrel);
  const notes = reach.unreached.length > 0 ? [`reach no story: ${list(reach.unreached)}`] : [];
  const picked: GroupPick[] = [];
  const skipped: Group[] = [];
  for (const group of grouping.groups) {
    const pick = pickOf(group, reach, repo.themes);
    if (pick === undefined) skipped.push(group);
    else picked.push(pick);
  }
  if (picked.every((group) => group.slug === OVERVIEW) && reach.themed.length === 0)
    notes.push("nothing a component story shows changed: only Overview is captured");
  return { all: false, notes, picked, skipped };
}

/* ---------------------------------------------------------------------------
   The repo on disk
   --------------------------------------------------------------------------- */

const storyTitle = (source: string) => /\btitle:\s*["']([^"']+)["']/.exec(source)?.[1];

function isSection(value: unknown): value is Section {
  return (
    typeof value === "object" &&
    value !== null &&
    "title" in value &&
    typeof value.title === "string" &&
    "pages" in value &&
    Array.isArray(value.pages)
  );
}

/**
 * The checkout at `root`: its story files, its themes and the site's sections. The sections module
 * is imported by a computed path, so Nx sees no import from Storybook into the site (the site's
 * build would become a dependency of Storybook's).
 */
export async function readRepo(root: string): Promise<Repo> {
  const sectionsPath = join(root, "apps/hack-cove-site/src/content/components/index.ts");
  const module: unknown = await import(sectionsPath);
  const sections =
    typeof module === "object" && module !== null && "componentSections" in module
      ? module.componentSections
      : undefined;
  if (!Array.isArray(sections) || !sections.every(isSection))
    throw new Error(`${sectionsPath} exports no componentSections`);

  const storyFiles = globSync("apps/storybook/src/**/*.stories.tsx", { cwd: root })
    .map((path) => {
      const title = storyTitle(readFileSync(join(root, path), "utf8"));
      if (title === undefined) throw new Error(`${path} has no title in its meta`);
      const stem = posix.basename(path).replace(/\.stories\.tsx$/, "");
      return { path, stem, title };
    })
    .toSorted((a, b) => a.path.localeCompare(b.path));

  const themes = themeFiles(join(root, "themes")).map((theme) => theme.id);

  const cache = new Map<string, string | undefined>();
  const read: Reader = (path) => {
    if (!cache.has(path)) cache.set(path, safeRead(join(root, path)));
    return cache.get(path);
  };
  return { read, storyFiles, sections, themes };
}

function safeRead(path: string): string | undefined {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
}
