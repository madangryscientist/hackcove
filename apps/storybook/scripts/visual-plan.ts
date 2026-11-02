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
 * A change reaches a story file when the file's static imports (followed through the
 * `@hackcove/ui` barrel to the module that exports each name) lead to a changed file. A change
 * under `themes/<t>/` reaches every group in theme `<t>` only. A change to shared ground (the
 * palette, Storybook's config and what it imports, a manifest or the lockfile, the visual tooling)
 * or a diff that cannot be read reaches everything.
 *
 * Everything here is pure but `readRepo`, so the tests hand it a repo of their own.
 */
import { globSync, readFileSync, readdirSync } from "node:fs";
import { join, posix } from "node:path";

export type StoryFile = {
  /** Repo-relative, e.g. `apps/storybook/src/Button.stories.tsx`. */
  path: string;
  /** The file name without `.stories.tsx`: what `pairs` call `<File>`. */
  stem: string;
  /** The meta's `title`, which PixelSlash's `storybook.include` matches. */
  title: string;
};

/** The part of a site section this reads. */
export type Section = {
  title: string;
  pages: { slug: string; pairs: string[]; fullPage?: string; stories?: string[] }[];
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
  /** Story files no page names. */
  unsectioned: StoryFile[];
  /** `<page>: <File>` for a file a page names that is not in Storybook. */
  unknown: string[];
};

/** A file's text, or `undefined` for no such file: everything the graph reads goes through this. */
export type Reader = (path: string) => string | undefined;

export type Repo = {
  read: Reader;
  storyFiles: StoryFile[];
  sections: Section[];
  /** The folders under `themes/`. */
  themes: string[];
};

export const OVERVIEW = "overview";

export const slugOf = (title: string) =>
  title
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");

export const projectOf = (slug: string) => `hackcove-ui-${slug}`;

const isOverview = (file: StoryFile) =>
  file.title === "Overview" || file.title.startsWith("Overview/");

/** The story files a page names: `<File>` of each pair and of its full page, and its `stories`. */
function stemsOf(page: Section["pages"][number]): string[] {
  const named = [...page.pairs, ...(page.fullPage === undefined ? [] : [page.fullPage])];
  return [...named.map((id) => id.split("/")[0] ?? id), ...(page.stories ?? [])];
}

export function groupStories(sections: Section[], storyFiles: StoryFile[]): Grouping {
  const byStem = new Map(storyFiles.map((file) => [file.stem, file]));
  const placed = new Set<string>();
  const unknown: string[] = [];
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
        }
      }
    return { slug, title: section.title, project: projectOf(slug), files };
  });
  const overview = storyFiles.filter(isOverview);
  groups.push({ slug: OVERVIEW, title: "Overview", project: projectOf(OVERVIEW), files: overview });
  for (const file of overview) placed.add(file.path);
  const unsectioned = storyFiles.filter((file) => !placed.has(file.path));
  return { groups, unsectioned, unknown: [...new Set(unknown)] };
}

/* ---------------------------------------------------------------------------
   The import graph
   --------------------------------------------------------------------------- */

const UI_BARREL = "packages/ui/src/index.ts";

// `import x, { a, type b } from "s"` and `export { a } from "s"`: the clause is names, braces,
// commas and `* as`, so a match never runs across code.
const FROM = /\b(import|export)\s+(type\s+)?([\w$\s,{}*]*?)\s*from\s*["']([^"']+)["']/g;
const BARE = /\bimport\s*["']([^"']+)["']/g;
const DYNAMIC = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

type Edge = { spec: string; names: string[] | "all" };

/** The value names a clause brings in (`type` ones dropped), or "all" for a namespace or default. */
function namesOf(clause: string): string[] | "all" {
  if (clause.includes("*")) return "all";
  const braced = /\{([^}]*)\}/.exec(clause)?.[1];
  const outside = clause
    .replace(/\{[^}]*\}/, "")
    .replaceAll(",", " ")
    .trim();
  if (outside !== "") return "all";
  return (braced ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "" && !part.startsWith("type "))
    .map((part) => part.split(/\s+as\s+/)[0]?.trim() ?? part);
}

/** `import`/`export … from` edges that bring in a value: a `type`-only one brings in none. */
function fromEdges(source: string): Edge[] {
  return [...source.matchAll(FROM)].flatMap(([, , type, clause = "", spec = ""]) => {
    const names = type === undefined ? namesOf(clause) : [];
    return names === "all" || names.length > 0 ? [{ spec, names }] : [];
  });
}

export function importsOf(source: string): Edge[] {
  const whole = (regex: RegExp) =>
    [...source.matchAll(regex)].map(([, spec = ""]): Edge => ({ spec, names: "all" }));
  return [...fromEdges(source), ...whole(BARE), ...whole(DYNAMIC)];
}

/** A relative specifier as a repo file: `./ui.js` is `ui.tsx` or `ui.ts`, `./x` may be `x/index.ts`. */
function resolveRelative(from: string, spec: string, read: Reader): string | undefined {
  const base = posix.join(posix.dirname(from), spec);
  const stem = base.replace(/\.js$/, "");
  const tries = [base, `${stem}.ts`, `${stem}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return tries.find((path) => read(path) !== undefined);
}

/** `export { A, type B } from "./X.js"` in the ui barrel: each value name's module. */
export function barrelOf(read: Reader): Map<string, string> {
  const modules = new Map<string, string>();
  const source = read(UI_BARREL) ?? "";
  for (const [, kind, type, clause = "", spec = ""] of source.matchAll(FROM)) {
    if (kind !== "export" || type !== undefined) continue;
    const path = resolveRelative(UI_BARREL, spec, read);
    const names = namesOf(clause);
    if (path === undefined || names === "all") continue;
    for (const name of names) modules.set(name, path);
  }
  return modules;
}

/** The repo files one import of `from` reaches directly. */
function targetsOf(from: string, edge: Edge, read: Reader, barrel: Map<string, string>) {
  if (edge.spec.startsWith(".")) return [resolveRelative(from, edge.spec, read)];
  // Any other package is the lockfile's, which is shared ground.
  if (edge.spec !== "@hackcove/ui") return [];
  const modules =
    edge.names === "all" ? [...barrel.values()] : edge.names.map((n) => barrel.get(n));
  return [UI_BARREL, ...modules];
}

/** Every repo file `entry` reaches through its imports, itself included. */
export function closureOf(entry: string, read: Reader, barrel: Map<string, string>): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const path = queue.pop();
    if (path === undefined || seen.has(path)) continue;
    seen.add(path);
    const source = read(path);
    // The barrel is in the closure (a change to it reaches every importer) but its own exports are
    // not followed: an import reaches only the modules of the names it takes.
    if (source === undefined || path === UI_BARREL || !/\.(ts|tsx)$/.test(path)) continue;
    const next = importsOf(source).flatMap((edge) => targetsOf(path, edge, read, barrel));
    for (const target of next) if (target !== undefined && !seen.has(target)) queue.push(target);
  }
  return seen;
}

/* ---------------------------------------------------------------------------
   The plan
   --------------------------------------------------------------------------- */

const SHARED: RegExp[] = [
  /^packages\/ui\/palette\.json$/,
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

export type GroupPick = Group & {
  /** The story files to capture: a subset of `files`. */
  picked: StoryFile[];
  themes: string[];
  why: string[];
};

export type Plan = {
  /** Every group in every theme. */
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

const THEME = /^themes\/([^/]+)\//;

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
  const strayTheme = changed.find((path) => {
    const theme = THEME.exec(path)?.[1];
    return theme !== undefined && !repo.themes.includes(theme);
  });
  return strayTheme === undefined ? [] : [`${strayTheme} is in no theme there is now`];
}

type Reach = {
  /** The themes a change under `themes/<t>/` touched. */
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
    const theme = THEME.exec(path)?.[1];
    if (theme !== undefined) themed.add(theme);
    const stories = closures.filter((c) => c.closure.has(path)).map((c) => c.story);
    for (const story of stories) reached.set(story, [...(reached.get(story) ?? []), path]);
    if (theme === undefined && stories.length === 0) unreached.push(path);
  }
  return { themed: [...themed].toSorted(), reached, unreached };
}

/** One group's capture under `reach`, or `undefined` when the change does not reach it. */
function pickOf(group: Group, reach: Reach, themes: string[]): GroupPick | undefined {
  const files = group.files.filter((file) => reach.reached.has(file.path));
  const stems = new Map<string, string[]>();
  for (const file of files)
    for (const path of reach.reached.get(file.path) ?? [])
      stems.set(path, [...(stems.get(path) ?? []), file.stem]);
  const why = [...stems].map(([path, reached]) => `${path} → ${list(reached)}`);
  if (reach.themed.length > 0) {
    // One capture per group is one include × one theme list, so a group with both a component
    // and a theme change takes all its files in every theme.
    why.push(`theme ${reach.themed.join(", ")} changed`);
    return { ...group, picked: group.files, themes: files.length > 0 ? themes : reach.themed, why };
  }
  if (group.slug === OVERVIEW) {
    why.push("always captured");
    return { ...group, picked: group.files, themes, why };
  }
  return files.length > 0 ? { ...group, picked: files, themes, why } : undefined;
}

export function planCapture({ repo, grouping, changed, everything }: PlanInput): Plan {
  const full = (notes: string[]): Plan => ({
    all: true,
    notes,
    picked: grouping.groups.map((g) => ({ ...g, picked: g.files, themes: repo.themes, why: [] })),
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

  const themes = readdirSync(join(root, "themes"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();

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
