/**
 * `nx run storybook:visual`: what did this change do to the stories it reaches, in the themes it
 * reaches?
 *
 * The stories are split into groups, one per section of the site's component docs (`--groups`
 * lists them), and each group is its own Nx project (`visual-<slug>`, from `nx-plugin.ts`) and its
 * own PixelSlash project (`hackcove-ui-<slug>`). A run has three steps, each a mode of this script:
 *
 * - `--plan` reads the diff against the base and writes `.pixelslash/plan.json`: which groups,
 *   story files and themes the change reaches, and why (`visual-plan.ts`). `--all`, or
 *   `VISUAL_ALL=1`, picks everything.
 * - `--group <slug>` captures that group's picked stories on the branch and on the base, and
 *   compares them; a group the plan skipped does nothing.
 * - `--summary` reads every group's result and totals them.
 *
 * The base is the branch's merge-base with origin/main (the fork point, so a main that moved since
 * stays out of the diff); `VISUAL_BASE` names another ref. `--upload` also sends each group's
 * captures to its PixelSlash project on `PIXELSLASH_SERVER`: origin/main's once per commit (as
 * branch `main`, which the server auto-accepts as the baseline), then the branch's. An upload
 * always takes a whole group in every theme, since a partial capture would read as removals.
 */
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { indexOf, isRecord, shotsOf } from "./visual-index.js";
import { groupStories, planCapture, readRepo, type Grouping, type Plan } from "./visual-plan.js";
import {
  VisualError,
  baseStatic,
  branchStatic,
  buildBase,
  capture,
  capturePort,
  changedSince,
  checkUpload,
  compare,
  ensurePixelslashInstall,
  log,
  out,
  repoRoot,
  resolveBase,
  uploadGroup,
  withBaselineLock,
  type Counts,
  type Selection,
} from "./visual-tools.js";

const upload = process.argv.includes("--upload");
const everything = process.argv.includes("--all") || process.env["VISUAL_ALL"] === "1";
const planPath = join(out, "plan.json");
const countKeys: (keyof Counts)[] = ["changed", "unchanged", "new", "removed"];

type PlannedGroup = Selection & { slug: string; project: string; skipped: boolean };
type SavedPlan = { id: string; upload: boolean; sha: string; groups: PlannedGroup[] };

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

function isPlannedGroup(value: unknown): value is PlannedGroup {
  return (
    isRecord(value) &&
    typeof value["slug"] === "string" &&
    typeof value["project"] === "string" &&
    typeof value["skipped"] === "boolean" &&
    isStrings(value["titles"]) &&
    isStrings(value["themes"])
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
  return { id: plan["id"], sha: plan["sha"], upload, groups: plan["groups"] };
}

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

/** What the plan says, at the top of the run: what is captured and why, and what is skipped. */
function reportPlan(plan: Plan, grouping: Grouping, saved: SavedPlan, themes: number) {
  const index = indexOf(branchStatic);
  const allTitles = grouping.groups.flatMap((g) => g.files.map((f) => f.title));
  const shots = saved.groups.reduce((n, g) => n + shotsOf(index, g.titles, g.themes.length), 0);
  const files = plan.picked.reduce((n, g) => n + g.picked.length, 0);
  log(
    `${plan.all ? "everything" : "affected"}: ${plan.picked.length} of ${grouping.groups.length} groups, ` +
      `${files} of ${allTitles.length} story files, ${shots} of ${shotsOf(index, allTitles, themes)} shots`,
  );
  for (const note of plan.notes) log(`  ${note}`);
  for (const g of plan.picked) {
    const why = g.why.length > 0 ? ` (${g.why.join("; ")})` : "";
    log(
      `  ${g.slug}: ${g.picked.length} of ${g.files.length} story files in ${g.themes.join(", ")}${why}`,
    );
  }
  const skipped = plan.skipped.map((g) => `${g.slug} (${g.files.length} story files)`);
  if (skipped.length > 0) log(`skipped as unaffected: ${skipped.join(", ")}`);
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
  if (upload) await checkUpload(grouping.groups.map((g) => g.project));
  const picked = new Map(plan.picked.map((g) => [g.slug, g]));
  const groups = grouping.groups.map((group) => {
    const pick = picked.get(group.slug);
    const titles = (pick?.picked ?? []).map((file) => file.title);
    return {
      slug: group.slug,
      project: group.project,
      skipped: !pick,
      titles,
      themes: pick?.themes ?? [],
    };
  });
  const saved: SavedPlan = { id: randomUUID(), upload, sha: base.sha, groups };
  mkdirSync(out, { recursive: true });
  writeFileSync(planPath, `${JSON.stringify(saved, null, 2)}\n`);
  log(`base: ${base.label} ${base.sha.slice(0, 7)}`);
  reportPlan(plan, grouping, saved, repo.themes.length);
}

/** The base's capture of `pick`, reused while the base commit and the selection stay the same. */
async function captureBase(dir: string, sha: string, pick: Selection) {
  const keyPath = join(dir, "main.key");
  const key = JSON.stringify({ sha, titles: pick.titles, themes: pick.themes });
  if (existsSync(keyPath) && readFileSync(keyPath, "utf8").trim() === key) {
    log(`base ${sha.slice(0, 7)} already captured`);
    return;
  }
  rmSync(keyPath, { force: true });
  await withBaselineLock(async () => {
    await buildBase(sha);
    await capture(baseStatic, join(dir, "main"), await capturePort(), pick);
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
  await capture(branchStatic, join(dir, "branch"), await capturePort(), group);
  await captureBase(dir, plan.sha, group);
  const report = join(dir, "report");
  const counts = await compare(join(dir, "main"), join(dir, "branch"), report);
  if (plan.upload) await uploadGroup(group.project, plan.sha, dir);
  log(`${slug}: done in ${Math.round((Date.now() - started) / 1000)}s`);
  log(`${slug}: report: ${join(report, "index.html")}`);
  writeFileSync(result, `${JSON.stringify({ id: plan.id, slug, skipped: false, counts })}\n`);
}

/** A group's counts from its last run for this plan; `undefined` when the plan skipped it. */
function readResult(id: string, slug: string): Counts | undefined {
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
  return {
    changed: read("changed"),
    unchanged: read("unchanged"),
    new: read("new"),
    removed: read("removed"),
  };
}

const countsLine = (c: Counts) =>
  `${c.changed} changed, ${c.unchanged} unchanged, ${c.new} new, ${c.removed} removed`;

function summaryMode() {
  const plan = readPlan();
  const total: Counts = { changed: 0, unchanged: 0, new: 0, removed: 0 };
  for (const group of plan.groups) {
    const counts = readResult(plan.id, group.slug);
    if (counts === undefined) {
      log(`${group.slug}: skipped, unaffected`);
      continue;
    }
    for (const key of countKeys) total[key] += counts[key];
    log(`${group.slug}: ${countsLine(counts)} — ${join(out, group.slug, "report", "index.html")}`);
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
