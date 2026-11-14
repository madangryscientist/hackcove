/**
 * `nx run storybook:visual`: what did this change do to the stories it reaches, in the themes it
 * reaches?
 *
 * The stories are split into groups, one per section of the site's component docs (`--groups`
 * lists them), and each group is its own Nx project (`visual-<slug>`, from `nx-plugin.ts`) and its
 * own PixelSlash project (`hackcove-ui-<slug>`). A run has three steps, each a mode of this script:
 *
 * - `--plan` reads the diff against the base and writes `.pixelslash/plan.json`: which groups,
 *   story files and themes the change reaches, and why (`visual-plan.ts`): every story in the
 *   reference theme, the Gallery sections in every other. `--all`, or
 *   `VISUAL_ALL=1`, picks everything.
 * - `--group <slug>` captures that group's picked stories on the branch and on the base, and
 *   compares them; a group the plan skipped does nothing. It fails, naming the shot, when a branch
 *   shot is over PixelSlash's 24.5 Mpx limit (`visual-shots.ts`; the Overview pages are shot in
 *   slices for that reason).
 * - `--summary` reads every group's result and totals them.
 *
 * Locally the base is the branch's merge-base with origin/main (the fork point, so a main that
 * moved since stays out of the diff); `VISUAL_BASE` names another ref. It is built in a shared
 * worktree and captured, and `pixelslash compare` writes the local report.
 *
 * `--upload` builds and captures no base at all. It captures the working tree and sends it to the
 * group's PixelSlash project on `PIXELSLASH_SERVER`, in one of two modes (`visual-upload.ts`):
 *
 * - On a branch (rebased on origin/main), it uploads the branch and the server diffs it against the
 *   main build it already holds. It first checks that each project holds one at the merge-base or
 *   an ancestor, and fails naming the project when not.
 * - On a checkout at origin/main's tip, it uploads that commit as branch `main`, which the server
 *   auto-accepts as the baseline. This is the post-merge step that keeps those main builds there.
 *
 * Either way it waits for the server to finish diffing and takes the counts and the build's page
 * from the server. An upload always takes a whole group (every story in the reference theme, the
 * Gallery sections in the others; `visual-plan.ts`), since a partial capture would read as removals.
 */
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { themeFiles } from "@hackcove/themes-shared/files";
import { baseThemeIds, themesOnBase } from "./theme-reach.js";
import { indexOf, isRecord, shotsByTheme, shotsOf } from "./visual-index.js";
import { groupStories, planCapture, readRepo, type Grouping, type Plan } from "./visual-plan.js";
import {
  VisualError,
  baseStatic,
  baselineDir,
  branchStatic,
  buildBase,
  capture,
  changedSince,
  checkShotSizes,
  compare,
  ensurePixelslashInstall,
  log,
  out,
  repoRoot,
  resolveBase,
  uploadWorkers,
  withBaselineLock,
  type Counts,
  type Selection,
} from "./visual-tools.js";
import { checkUpload, uploadGroup } from "./visual-remote.js";
import type { UploadMode } from "./visual-upload.js";

const upload = process.argv.includes("--upload");
const everything = process.argv.includes("--all") || process.env["VISUAL_ALL"] === "1";
const planPath = join(out, "plan.json");
const countKeys: (keyof Counts)[] = ["changed", "unchanged", "new", "removed"];

/** A group's captures, in order: the reference theme's, then the Gallery sections' in the others. */
type PlannedGroup = { slug: string; project: string; skipped: boolean; captures: Selection[] };
// `mode` is the upload's: the branch alone, or this commit as `main`; absent for a local run.
type SavedPlan = {
  id: string;
  upload: boolean;
  mode: UploadMode | null;
  sha: string;
  groups: PlannedGroup[];
};

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function isPlannedGroup(value: unknown): value is PlannedGroup {
  return (
    isRecord(value) &&
    typeof value["slug"] === "string" &&
    typeof value["project"] === "string" &&
    typeof value["skipped"] === "boolean" &&
    Array.isArray(value["captures"]) &&
    value["captures"].every(
      (pick: unknown) => isRecord(pick) && isStrings(pick["titles"]) && isStrings(pick["themes"]),
    )
  );
}

function readJson(path: string): unknown {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
}

/** The plan `--plan` wrote, for the same mode (an upload plan for an upload run). */
function readPlan(): SavedPlan {
  const plan = readJson(planPath);
  const target = upload ? "visual-upload" : "visual";
  if (
    !isRecord(plan) ||
    typeof plan["id"] !== "string" ||
    typeof plan["sha"] !== "string" ||
    plan["upload"] !== upload ||
    !Array.isArray(plan["groups"]) ||
    !plan["groups"].every(isPlannedGroup)
  )
    throw new VisualError(
      `${planPath} is missing or from another mode; run nx run storybook:${target}`,
    );
  const mode = plan["mode"];
  if (!isModeFor(mode, upload))
    throw new VisualError(`${planPath} has no upload mode; run nx run storybook:${target}`);
  return { id: plan["id"], sha: plan["sha"], upload, mode, groups: plan["groups"] };
}

/** An upload plan names its mode; a local one has none. */
const isModeFor = (mode: unknown, uploading: boolean): mode is UploadMode | null =>
  uploading ? mode === "branch" || mode === "main" : mode === null;

/** The repo's groups, failing on a story file no docs page names, or a page naming no story file. */
function checked(result: Grouping): Grouping {
  if (result.unsectioned.length > 0)
    throw new VisualError(
      `no page of the site's component docs names ${result.unsectioned.map((f) => f.path).join(", ")}; ` +
        "add it to a page's `pairs` or `stories` in apps/hack-cove-site/src/content/components",
    );
  if (result.unknown.length > 0)
    throw new VisualError(
      `docs pages name story files that do not exist: ${result.unknown.join(", ")}`,
    );
  return result;
}

const titlesOf = (captures: { files: { title: string }[]; themes: string[] }[]) =>
  captures.map((c) => ({ titles: [...new Set(c.files.map((f) => f.title))], themes: c.themes }));

/**
 * What the plan says, at the top of the run: what is captured and why, and what is skipped, then
 * the shots per theme against what a run of everything takes (`whole`).
 */
function reportPlan(plan: Plan, grouping: Grouping, saved: SavedPlan, whole: Plan) {
  const index = indexOf(branchStatic);
  const shots = (captures: Selection[]) =>
    captures.reduce((n, c) => n + shotsOf(index, c.titles, c.themes.length), 0);
  const planned = saved.groups.flatMap((g) => g.captures);
  const wholeCaptures = whole.picked.flatMap((g) => titlesOf(g.captures));
  const files = plan.picked.reduce((n, g) => n + g.picked.length, 0);
  const allFiles = grouping.groups.reduce((n, g) => n + g.files.length, 0);
  log(
    `${plan.all ? "everything" : "affected"}: ${plan.picked.length} of ${grouping.groups.length} groups, ` +
      `${files} of ${allFiles} story files, ${shots(planned)} of ${shots(wholeCaptures)} shots`,
  );
  for (const note of plan.notes) log(`  ${note}`);
  for (const g of plan.picked) {
    const why = g.why.length > 0 ? ` (${g.why.join("; ")})` : "";
    const captures = g.captures.map(
      (c) => `${c.files.length} of ${g.files.length} story files in ${c.themes.join(", ")}`,
    );
    log(`  ${g.slug}: ${captures.join("; ")}${why}`);
  }
  const skipped = plan.skipped.map((g) => `${g.slug} (${g.files.length} story files)`);
  if (skipped.length > 0) log(`skipped as unaffected: ${skipped.join(", ")}`);
  const now = shotsByTheme(index, planned);
  const all = shotsByTheme(index, wholeCaptures);
  const perTheme = [...all.themes].map(([id, n]) => `${id} ${now.themes.get(id) ?? 0} of ${n}`);
  log(`shots per theme: ${perTheme.join(", ")}; shot once: ${now.once} of ${all.once}`);
}

async function planMode() {
  await ensurePixelslashInstall();
  const repo = await readRepo(repoRoot);
  const grouping = checked(groupStories(repo.sections, repo.storyFiles));
  const base = await resolveBase();
  // An upload takes every group whole: the server reads a story missing from a build as removed.
  const plan = planCapture({
    repo,
    grouping,
    changed: await changedSince(base.sha),
    everything: everything || upload,
  });
  const mode = upload ? await checkUpload(grouping.groups.map((g) => g.project)) : null;
  const picked = new Map(plan.picked.map((g) => [g.slug, g]));
  const groups = grouping.groups.map((group) => {
    const pick = picked.get(group.slug);
    // Two story files may share a title (a page's extra stories), and PixelSlash includes by title.
    const captures = (pick?.captures ?? []).map((c) => ({
      titles: [...new Set(c.files.map((file) => file.title))],
      themes: c.themes,
    }));
    return { slug: group.slug, project: group.project, skipped: !pick, captures };
  });
  const saved: SavedPlan = { id: randomUUID(), upload, mode, sha: base.sha, groups };
  mkdirSync(out, { recursive: true });
  writeFileSync(planPath, `${JSON.stringify(saved, null, 2)}\n`);
  if (mode === "main")
    log(`main: uploading ${base.sha.slice(0, 7)} as the baseline, nothing compared`);
  else if (mode === "branch") log("branch: the server diffs it against the main build it holds");
  else log(`base: ${base.label} ${base.sha.slice(0, 7)}`);
  const whole = planCapture({ repo, grouping, changed: [], everything: true });
  reportPlan(plan, grouping, saved, whole);
}

/**
 * The base's capture of `captures`, reused while the base commit, the selection and the branch's
 * themes stay the same. The base is asked for its own theme ids, so a theme added on the branch
 * reads as new, not as changed. A theme the branch no longer has is shot on the base in the first
 * capture (the reference theme's, which every captured group has), so it reads as removed.
 */
async function captureBase(dir: string, sha: string, captures: Selection[]) {
  const keyPath = join(dir, "main.key");
  const branch = themeFiles(join(repoRoot, "themes")).map((theme) => theme.id);
  const key = JSON.stringify({ sha, captures, branch });
  if (existsSync(keyPath) && readFileSync(keyPath, "utf8").trim() === key) {
    log(`base ${sha.slice(0, 7)} already captured`);
    return;
  }
  rmSync(keyPath, { force: true });
  await withBaselineLock(async () => {
    await buildBase(sha);
    // buildBase leaves the shared worktree at `sha`, which is the base these ids come from.
    let ids: string[];
    try {
      ids = await baseThemeIds(baselineDir);
    } catch (error) {
      throw new VisualError(error instanceof Error ? error.message : String(error));
    }
    const onBase = captures.map((pick, i) => ({
      ...pick,
      themes:
        i === 0
          ? themesOnBase(ids, pick.themes, branch)
          : pick.themes.filter((id) => ids.includes(id)),
    }));
    await capture(baseStatic, join(dir, "main"), onBase);
  });
  writeFileSync(keyPath, `${key}\n`);
}

async function groupMode(slug: string) {
  const plan = readPlan();
  const group = plan.groups.find((g) => g.slug === slug);
  if (group === undefined) throw new VisualError(`the plan has no group ${slug}`);
  const dir = join(out, slug);
  mkdirSync(dir, { recursive: true });
  const result = join(dir, "result.json");
  if (group.skipped) {
    log(`${slug}: skipped, unaffected`);
    writeFileSync(result, `${JSON.stringify({ id: plan.id, slug, skipped: true })}\n`);
    return;
  }
  const started = Date.now();
  await capture(
    branchStatic,
    join(dir, "branch"),
    group.captures,
    plan.mode === null ? undefined : uploadWorkers(),
  );
  checkShotSizes(join(dir, "branch"), slug);
  if (plan.mode !== null) {
    // An upload builds and captures nothing of main: the server holds the baseline and diffs.
    const build = await uploadGroup(group.project, dir, plan.mode);
    log(`${slug}: done in ${Math.round((Date.now() - started) / 1000)}s`);
    writeFileSync(
      result,
      `${JSON.stringify({ id: plan.id, slug, skipped: false, counts: build.counts, url: build.url })}\n`,
    );
    return;
  }
  await captureBase(dir, plan.sha, group.captures);
  const report = join(dir, "report");
  const counts = await compare(join(dir, "main"), join(dir, "branch"), report);
  log(`${slug}: done in ${Math.round((Date.now() - started) / 1000)}s`);
  log(`${slug}: report: ${join(report, "index.html")}`);
  writeFileSync(result, `${JSON.stringify({ id: plan.id, slug, skipped: false, counts })}\n`);
}

/**
 * A group's counts from its last run for this plan, and where to read them: the server's build
 * page for an upload, the local report otherwise; `undefined` when the plan skipped it.
 */
function readResult(id: string, slug: string): { counts: Counts; where: string } | undefined {
  const path = join(out, slug, "result.json");
  const result = readJson(path);
  if (!isRecord(result) || result["id"] !== id)
    throw new VisualError(`${slug} has no result for this plan: its capture did not run`);
  if (result["skipped"] === true) return undefined;
  const counts = result["counts"];
  if (!isRecord(counts)) throw new VisualError(`${path} has no counts`);
  const read = (key: keyof Counts) => {
    const value = counts[key];
    if (typeof value !== "number") throw new VisualError(`${path} has no ${key} count`);
    return value;
  };
  const url = result["url"];
  return {
    counts: {
      changed: read("changed"),
      unchanged: read("unchanged"),
      new: read("new"),
      removed: read("removed"),
    },
    where: typeof url === "string" && url !== "" ? url : join(out, slug, "report", "index.html"),
  };
}

const countsLine = (c: Counts) =>
  `${c.changed} changed, ${c.unchanged} unchanged, ${c.new} new, ${c.removed} removed`;

function summaryMode() {
  const plan = readPlan();
  const total: Counts = { changed: 0, unchanged: 0, new: 0, removed: 0 };
  for (const group of plan.groups) {
    const result = readResult(plan.id, group.slug);
    if (result === undefined) {
      log(`${group.slug}: skipped, unaffected`);
      continue;
    }
    for (const key of countKeys) total[key] += result.counts[key];
    log(`${group.slug}: ${countsLine(result.counts)}; ${result.where}`);
  }
  log(`total: ${countsLine(total)}`);
}

async function main() {
  const at = process.argv.indexOf("--group");
  if (process.argv.includes("--groups")) {
    // The Nx plugin reads this to make the projects, so a story file outside every section does
    // not stop the graph: `--plan` and this repo's test fail on it instead.
    const repo = await readRepo(repoRoot);
    const { groups } = groupStories(repo.sections, repo.storyFiles);
    process.stdout.write(`${groups.map((g) => g.slug).join("\n")}\n`);
  } else if (process.argv.includes("--plan")) await planMode();
  else if (at !== -1) await groupMode(process.argv[at + 1] ?? "");
  else if (process.argv.includes("--summary")) summaryMode();
  else throw new VisualError("give --groups, --plan, --group <slug> or --summary");
}

try {
  await main();
} catch (error) {
  if (!(error instanceof VisualError)) throw error;
  process.stderr.write(`visual: ${error.message}\n`);
  process.exit(1);
}
