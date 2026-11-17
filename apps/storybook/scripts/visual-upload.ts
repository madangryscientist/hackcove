/**
 * The decisions `--upload` makes, as pure functions with git and the PixelSlash server injected, so
 * `visual-upload.test.ts` needs neither.
 *
 * An upload never builds or captures main. On a branch it sends the branch alone and the server
 * diffs it against the main build it already holds (the merge-base and up to 200 first-parent
 * ancestors are sent; the server picks the newest accepted `main` build among them). On a checkout
 * at origin/main's tip it sends that commit as branch `main`, which is the post-merge step that
 * keeps those main builds there.
 */
import { isRecord } from "./visual-index.js";

/** The command that puts a main build on the server, quoted by every failure that needs one. */
const MAIN_COMMAND = "bunx moon run storybook:visual-upload";

export type UploadState = {
  /** The checked-out branch; empty for a detached HEAD. */
  branch: string;
  head: string;
  /** origin/main's tip. */
  tip: string;
  mergeBase: string;
  dirty: boolean;
};

/** What an upload sends: the branch alone, or this commit as `main`. */
export type UploadMode = "branch" | "main";

/**
 * Which upload this checkout does, or why it cannot. HEAD at origin/main's tip with a clean tree
 * (a detached HEAD counts: the planner runs it in a throwaway worktree) uploads as `main`; any
 * other commit on `main` is refused, since the server would auto-accept it as the baseline. A
 * branch uploads only when committed and on origin/main's tip, so its baseline is in reach.
 */
export function decideUpload(state: UploadState): UploadMode {
  const { branch, head, tip, mergeBase, dirty } = state;
  if (dirty) throw new Error("uncommitted changes: the upload names HEAD; commit first");
  if (head === tip) return "main";
  if (branch === "main")
    throw new Error(
      "on main, but not at origin/main's tip: the server would auto-accept this commit as the " +
        "baseline; check out origin/main's tip (git fetch origin) and re-run",
    );
  if (mergeBase !== tip)
    throw new Error("not based on origin/main's tip, so its baseline is out of reach; rebase");
  return "branch";
}

/**
 * What `pixelslash builds` said about a project. Its exit code tells a missing project from a
 * server that did not answer: 2 is the CLI's usage error, which is how an unknown project, or one
 * the token cannot see, comes back (no other flag this script passes can cause one, so any other
 * exit 2 is a bug here and its line shows it); 3 is a remote error, whose line ends
 * `-> <status> <detail>` or reads `cannot fetch <url>: ...`. Any other non-zero exit is a failure
 * too. `line` is the CLI's own first line on stderr.
 */
export type LookupResult =
  | { kind: "ok"; listing: unknown }
  | { kind: "missing"; line: string }
  | { kind: "failed"; line: string };

/** The `LookupResult` for one `pixelslash builds --json` run, from its exit code and output. */
export function lookupResult(exitCode: number, stdout: string, stderr: string): LookupResult {
  if (exitCode === 0) return { kind: "ok", listing: JSON.parse(stdout) };
  const line =
    stderr
      .split("\n")
      .map((each) => each.trim())
      .find((each) => each !== "") ?? `pixelslash builds exited ${exitCode} and printed nothing`;
  return { kind: exitCode === 2 ? "missing" : "failed", line };
}

/** A project the lookup did not find, or that the server did not answer for, with the CLI's line. */
export type LookupMiss = { project: string; line: string };

const quoted = (misses: LookupMiss[]) =>
  misses.map(({ project, line }) => `${project} (pixelslash: ${line})`).join(", ");

/**
 * Why the lookups failed, one line per kind, server failures first: a server that did not answer
 * hides whether the other projects exist, so the missing ones are named after it. `undefined` when
 * nothing failed.
 */
export function lookupFailure(failed: LookupMiss[], missing: LookupMiss[]): string | undefined {
  const lines: string[] = [];
  if (failed.length > 0) {
    const unauthorized = failed.some(({ line }) => / -> 401\b/.test(line));
    lines.push(
      `PixelSlash did not answer for ${quoted(failed)}. ` +
        "This is a PixelSlash failure, not a missing project, so do not create it: " +
        (unauthorized
          ? "a 401 means the token is missing, wrong, expired or revoked and needs reissuing in " +
            "the project's Settings on the server"
          : "report it to the PixelSlash planner with this output"),
    );
  }
  if (missing.length > 0)
    lines.push(
      `the server has no PixelSlash project ${quoted(missing)} (or the token cannot see it); ` +
        "create each with `pixelslash project create <name>` and re-run",
    );
  return lines.length > 0 ? lines.join("\n") : undefined;
}

/** A project's recent `main` build shas, or why the server gave none. */
export type MainShas = { kind: "ok"; shas: string[] } | Exclude<LookupResult, { kind: "ok" }>;

/** How a branch upload asks the server what it holds, and git whether a commit is in reach. */
export type BaselineDeps = {
  /**
   * The shas of `project`'s recent `main` builds, newest first, or why the server gave none: the
   * project is missing (or the token cannot see it), or the server did not answer.
   */
  mainShas: (project: string) => Promise<MainShas>;
  /** `git merge-base --is-ancestor sha mergeBase`: a sha the checkout does not have is `false`. */
  isAncestor: (sha: string) => Promise<boolean>;
};

/**
 * The projects that hold no `main` build at the merge-base or one of its ancestors, the projects
 * the server does not have, and the ones it did not answer for. A branch upload without a baseline
 * reads "new" on every shot, so it stops here, before any capture.
 */
async function baselineGaps(
  projects: string[],
  deps: BaselineDeps,
): Promise<{ missing: string[]; unknown: LookupMiss[]; failed: LookupMiss[] }> {
  const missing: string[] = [];
  const unknown: LookupMiss[] = [];
  const failed: LookupMiss[] = [];
  for (const project of projects) {
    const result = await deps.mainShas(project);
    if (result.kind === "missing") {
      unknown.push({ project, line: result.line });
      continue;
    }
    if (result.kind === "failed") {
      failed.push({ project, line: result.line });
      continue;
    }
    let found = false;
    for (const sha of result.shas) {
      if (await deps.isAncestor(sha)) {
        found = true;
        break;
      }
    }
    if (!found) missing.push(project);
  }
  return { missing, unknown, failed };
}

/**
 * The failure for `baselineGaps`, or `undefined` when every project has its baseline: one line per
 * kind, server failures first, then projects the server does not have, then missing baselines.
 */
export async function baselineFailure(
  projects: string[],
  deps: BaselineDeps,
): Promise<string | undefined> {
  const { missing, unknown, failed } = await baselineGaps(projects, deps);
  const lines: string[] = [];
  const lookup = lookupFailure(failed, unknown);
  if (lookup !== undefined) lines.push(lookup);
  if (missing.length > 0)
    lines.push(
      `no main build at the merge-base or its ancestors in ${missing.join(", ")}; ` +
        `upload main first: run \`${MAIN_COMMAND}\` on a checkout at origin/main`,
    );
  return lines.length > 0 ? lines.join("\n") : undefined;
}

/** Statuses of a build the server cannot diff against: it holds no finished shots yet, or none. */
const NO_BASELINE = ["errored", "uploading", "processing"];

/**
 * The `commit_sha` of each build in a `builds --json` listing, in the order given. A build that
 * errored or has not finished is no baseline (the server diffs only against an accepted one), so
 * it does not count.
 */
export function shasOf(listing: unknown): string[] {
  const builds = isRecord(listing) && Array.isArray(listing["builds"]) ? listing["builds"] : [];
  return builds.flatMap((build: unknown) =>
    isRecord(build) &&
    typeof build["commit_sha"] === "string" &&
    !NO_BASELINE.includes(text(build["status"]))
      ? [build["commit_sha"]]
      : [],
  );
}

/**
 * A build's counts. `changed` and the rest diff against the branch's previous upload (or main, on a
 * first upload or a main upload); `againstMain` and `toReview` are the server's counts against main,
 * left out when the server sends none (a main upload, an older server, the local compare).
 */
export type Counts = {
  changed: number;
  unchanged: number;
  new: number;
  removed: number;
  againstMain?: { changed: number; new: number };
  toReview?: number;
};

/** A build as `builds --json` lists it, reduced to what the run needs. */
export type BuildState = {
  id: string;
  status: string;
  error: string;
  url: string;
  counts: Counts;
};

const COUNT_KEYS = ["changed", "unchanged", "new", "removed"] as const;

/** The server's `against_main` counts, or `undefined` when it sends none. */
function readAgainstMain(value: unknown): Counts["againstMain"] {
  if (!isRecord(value)) return undefined;
  const { changed, new: added } = value;
  return typeof changed === "number" && typeof added === "number"
    ? { changed, new: added }
    : undefined;
}

/** The four counts of a build's `counts` object, or `undefined` when one is missing. */
function readCounts(counts: unknown): Counts | undefined {
  if (!isRecord(counts)) return undefined;
  const [changed, unchanged, added, removed] = COUNT_KEYS.map((key) => counts[key]);
  if (
    typeof changed !== "number" ||
    typeof unchanged !== "number" ||
    typeof added !== "number" ||
    typeof removed !== "number"
  )
    return undefined;
  const againstMain = readAgainstMain(counts["against_main"]);
  const toReview = counts["to_review"];
  return {
    changed,
    unchanged,
    new: added,
    removed,
    ...(againstMain === undefined ? {} : { againstMain }),
    ...(typeof toReview === "number" ? { toReview } : {}),
  };
}

const text = (value: unknown): string => (typeof value === "string" ? value : "");

/** Reads the build out of a `{build}` reply; `undefined` when the reply is not one. */
export function readBuild(reply: unknown): BuildState | undefined {
  const build = isRecord(reply) ? reply["build"] : undefined;
  if (!isRecord(build)) return undefined;
  const counts = readCounts(build["counts"]);
  const id = text(build["id"]);
  const status = text(build["status"]);
  if (counts === undefined || id === "" || status === "") return undefined;
  return {
    id,
    status,
    error: text(build["error"]),
    url: text(build["web_url"]),
    counts,
  };
}

/** The build `id` in a `builds --json` listing, as `readBuild` reads it. */
export function buildIn(listing: unknown, id: string): BuildState | undefined {
  const builds = isRecord(listing) && Array.isArray(listing["builds"]) ? listing["builds"] : [];
  const entry: unknown = builds.find((build: unknown) => isRecord(build) && build["id"] === id);
  return readBuild({ build: entry });
}

const DIFFED = ["changes", "passed", "failed"];

/**
 * The server is done diffing: the build reached a status it ends diffing on (like PixelSlash's own
 * `outcomeOf`, a status it does not know is not done). Not `counts.pending`, which counts shots
 * whose review is pending (a finished build has every shot so until a human accepts it), nor a
 * wait for that review.
 */
const isSettled = (build: BuildState): boolean => DIFFED.includes(build.status);

export type PollDeps = {
  read: () => Promise<BuildState>;
  sleep: (ms: number) => Promise<void>;
  now: () => number;
  timeoutMs: number;
  intervalMs: number;
};

/**
 * Reads the build until the server has finished diffing it, then returns it. Not `status --wait`,
 * which waits for a human to review. An `errored` build and a build still processing at the
 * timeout throw, naming the build.
 */
export async function settle(id: string, deps: PollDeps): Promise<BuildState> {
  const deadline = deps.now() + deps.timeoutMs;
  for (;;) {
    const build = await deps.read();
    if (build.status === "errored")
      throw new Error(`build ${id} errored on the server${build.error ? `: ${build.error}` : ""}`);
    if (isSettled(build)) return build;
    if (deps.now() >= deadline)
      throw new Error(
        `build ${id} was still ${build.status} after ${Math.round(deps.timeoutMs / 1000)}s`,
      );
    await deps.sleep(deps.intervalMs);
  }
}

/** One group's finished run: its counts, the build's status and where to read it. */
export type GroupResult = { counts: Counts; status?: string; where: string };

const countsLine = (c: Counts): string =>
  `${c.changed} changed, ${c.unchanged} unchanged, ${c.new} new, ${c.removed} removed`;

/**
 * A branch upload's counts are against main, which is what a reviewer reads: the top-level counts
 * diff against the branch's previous upload, so a second upload would show 0 changed.
 */
const againstMainLine = (against: { changed: number; new: number }, toReview: number): string =>
  `against main: ${against.changed} changed, ${against.new} new; ${toReview} to review`;

/** One group's summary line. */
export function uploadSummaryLine(
  slug: string,
  result: GroupResult,
  mode: UploadMode | null,
): string {
  const { counts, status, where } = result;
  if (mode === "branch" && counts.againstMain !== undefined) {
    const parts = [againstMainLine(counts.againstMain, counts.toReview ?? 0)];
    if (status !== undefined && status !== "") parts.push(status);
    return `${slug}: ${[...parts, where].join("; ")}`;
  }
  return `${slug}: ${countsLine(counts)}; ${where}`;
}

/** The total over every group that ran. */
export function uploadTotalLine(results: GroupResult[], mode: UploadMode | null): string {
  if (mode === "branch") {
    let changed = 0;
    let added = 0;
    let toReview = 0;
    for (const { counts } of results) {
      changed += counts.againstMain?.changed ?? 0;
      added += counts.againstMain?.new ?? 0;
      toReview += counts.toReview ?? 0;
    }
    return `total: ${againstMainLine({ changed, new: added }, toReview)}`;
  }
  const total: Counts = { changed: 0, unchanged: 0, new: 0, removed: 0 };
  for (const { counts } of results) {
    total.changed += counts.changed;
    total.unchanged += counts.unchanged;
    total.new += counts.new;
    total.removed += counts.removed;
  }
  return `total: ${countsLine(total)}`;
}
