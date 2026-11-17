/**
 * Which step of the visual run this invocation is (`visual.ts`), and, for a group run, which
 * groups of the saved plan it takes. A whole run plans, runs every group and totals them; the
 * split run does the same one step at a time, so each step can run on its own (a group in one
 * browser slot, the plan and the summary outside it).
 */
import { isRecord } from "./visual-index.js";
import { VisualError, type Selection } from "./visual-tools.js";
import type { UploadMode } from "./visual-upload.js";

/** A group's captures, in order: the reference theme's, then the Gallery sections' in the others. */
export type PlannedGroup = {
  slug: string;
  project: string;
  skipped: boolean;
  captures: Selection[];
};

/**
 * `.pixelslash/plan.json`. `sha` is the base the plan compares against; `head` is the commit it was
 * planned on, so a group run on another commit is refused. `all` is whether it took every group
 * whole (`--all`, or an upload). `mode` is the upload's: the branch
 * alone, or this commit as `main`; absent for a local run.
 */
export type SavedPlan = {
  id: string;
  upload: boolean;
  all: boolean;
  mode: UploadMode | null;
  sha: string;
  head: string;
  groups: PlannedGroup[];
};

/**
 * The step: `whole` (plan, every group, summary), `plan` (`--plan-only`), `groups` (`--group
 * <slug>`, repeatable) or `summary` (`--summary-only`). Two of them at once is refused.
 */
export type Step =
  | { kind: "whole" }
  | { kind: "plan" }
  | { kind: "groups"; slugs: string[] }
  | { kind: "summary" };

/** Every flag the script reads; any other is refused, so a typo never falls through to a whole run. */
const flags = ["--run", "--upload", "--all", "--plan-only", "--summary-only", "--group"];

/** The slugs after each `--group`, refusing any argument that is not one of `flags`. */
function slugsFrom(argv: string[]): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (!flags.includes(arg))
      throw new VisualError(`unknown argument ${arg}; give ${flags.join(", ")} (as --group forms)`);
    if (arg !== "--group") continue;
    const slug = argv[i + 1];
    if (slug === undefined || slug.startsWith("--"))
      throw new VisualError("--group needs a group's slug, as --group forms");
    slugs.push(slug);
    i++;
  }
  return [...new Set(slugs)];
}

export function stepFrom(argv: string[]): Step {
  const slugs = slugsFrom(argv);
  const steps: Step[] = [];
  if (argv.includes("--plan-only")) steps.push({ kind: "plan" });
  if (slugs.length > 0) steps.push({ kind: "groups", slugs });
  if (argv.includes("--summary-only")) steps.push({ kind: "summary" });
  if (steps.length > 1)
    throw new VisualError("give one of --plan-only, --group <slug> or --summary-only, not several");
  return steps[0] ?? { kind: "whole" };
}

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

function isSelection(value: unknown): value is Selection {
  return isRecord(value) && isStrings(value["titles"]) && isStrings(value["themes"]);
}

function isGroup(value: unknown): value is PlannedGroup {
  return (
    isRecord(value) &&
    typeof value["slug"] === "string" &&
    typeof value["project"] === "string" &&
    typeof value["skipped"] === "boolean" &&
    Array.isArray(value["captures"]) &&
    value["captures"].every(isSelection)
  );
}

const modeOf = (value: unknown): UploadMode | null | undefined =>
  value === null || value === "branch" || value === "main" ? value : undefined;

/**
 * The saved plan, read back; refused when there is none (or it cannot be read), so the split run
 * plans first.
 */
export function savedPlanFrom(raw: unknown): SavedPlan {
  const none = new VisualError(
    "no saved plan in .pixelslash/plan.json; plan first with the same flags and --plan-only, as `bunx moon run storybook:visual -- --all --plan-only`",
  );
  if (!isRecord(raw)) throw none;
  const { id, upload, all, sha, head, groups } = raw;
  const mode = modeOf(raw["mode"]);
  if (
    typeof id !== "string" ||
    typeof upload !== "boolean" ||
    typeof all !== "boolean" ||
    mode === undefined ||
    typeof sha !== "string" ||
    typeof head !== "string" ||
    !Array.isArray(groups) ||
    !groups.every(isGroup)
  )
    throw none;
  return { id, upload, all, mode, sha, head, groups };
}

/**
 * The plan's groups a `--group` run takes, in the plan's order. Refused when the plan was made for
 * the other kind of run (an upload or a local compare, everything or only what the change
 * reaches), on another commit, or when a slug is not
 * one of the plan's.
 */
export function pickGroups(
  plan: SavedPlan,
  run: { upload: boolean; all: boolean; head: string; slugs: string[] },
): PlannedGroup[] {
  if (plan.upload !== run.upload)
    throw new VisualError(
      `the saved plan is for ${plan.upload ? "an upload" : "a local compare"}, and this run is ` +
        `${run.upload ? "an upload" : "a local compare"}; plan again with the same flags`,
    );
  if (plan.all !== run.all)
    throw new VisualError(
      `the saved plan takes ${plan.all ? "every group whole" : "only what the change reaches"}, and ` +
        `this run asks for ${run.all ? "every group whole (--all)" : "only what the change reaches"}; ` +
        "plan again with the same flags",
    );
  if (plan.head !== run.head)
    throw new VisualError(
      `the saved plan was made on ${plan.head.slice(0, 7)}, ` +
        `and HEAD is now ${run.head.slice(0, 7)}; plan again with --plan-only`,
    );
  const known = plan.groups.map((g) => g.slug);
  const unknown = run.slugs.filter((slug) => !known.includes(slug));
  if (unknown.length > 0)
    throw new VisualError(
      `the saved plan has no group ${unknown.join(", ")}; its groups are ${known.join(", ")}`,
    );
  return plan.groups.filter((g) => run.slugs.includes(g.slug));
}
