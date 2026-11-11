/**
 * What `--upload` does against the PixelSlash server: the checks before any capture, the upload
 * itself, and reading the build the server made. The decisions are pure and live in
 * `visual-upload.ts`; this file runs git and the pixelslash CLI for them.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isRecord } from "./visual-index.js";
import { VisualError, git, log, pixelslashCli, repoRoot, run } from "./visual-tools.js";
import {
  baselineFailure,
  buildIn,
  decideUpload,
  settle,
  shasOf,
  type BuildState,
  type UploadMode,
  type UploadState,
} from "./visual-upload.js";

const tokenPathFlags = () => {
  const tokenPath = process.env["PIXELSLASH_TOKEN_PATH"];
  return tokenPath ? ["--token-path", tokenPath] : [];
};

/**
 * `pixelslash upload` into `project`, run from `cwd`, the checkout whose commit, branch and
 * merge-base it sends. Not `bun run --cwd` like the other calls: that would read git from the
 * pixelslash checkout.
 */
async function uploadSnapshots(dir: string, cwd: string, project: string, ...flags: string[]) {
  await run(
    ["bun", pixelslashCli, "upload", dir, "--project", project, ...tokenPathFlags(), ...flags],
    cwd,
  );
}

/** `pixelslash builds --json` for `project`: the parsed reply, or `undefined` when the server refused. */
async function listBuilds(project: string, ...flags: string[]): Promise<unknown> {
  const proc = Bun.spawn(
    ["bun", pixelslashCli, "builds", "--project", project, ...flags, "--json", ...tokenPathFlags()],
    { cwd: repoRoot, stdout: "pipe", stderr: "inherit" },
  );
  const text = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) return undefined;
  return JSON.parse(text);
}

/** Whether the server lists `project` for this token (an empty project counts). */
async function projectExists(project: string): Promise<boolean> {
  return (await listBuilds(project, "--limit", "1")) !== undefined;
}

/** The shas of `project`'s 20 newest `main` builds; `undefined` when the server refused. */
async function mainShas(project: string): Promise<string[] | undefined> {
  const listing = await listBuilds(project, "--branch", "main", "--limit", "20");
  return listing === undefined ? undefined : shasOf(listing);
}

async function isAncestor(sha: string, of: string): Promise<boolean> {
  const proc = Bun.spawn(["git", "merge-base", "--is-ancestor", sha, of], {
    cwd: repoRoot,
    stdout: "ignore",
    stderr: "ignore",
  });
  return (await proc.exited) === 0;
}

function token(): string {
  const tokenPath = process.env["PIXELSLASH_TOKEN_PATH"];
  if (process.env["PIXELSLASH_TOKEN"]) return process.env["PIXELSLASH_TOKEN"];
  return tokenPath && existsSync(tokenPath) ? readFileSync(tokenPath, "utf8").trim() : "";
}

/**
 * What `--upload` needs, checked before any capture, and which upload this is (`decideUpload`). A
 * branch is diffed by the server against the main build it already holds, so every project must
 * hold one at the merge-base or an ancestor of it; main's own upload needs none. One token uploads
 * to every group's project, so it must be one that names a project, and each project must exist.
 */
export async function checkUpload(projects: string[]): Promise<UploadMode> {
  if (!process.env["PIXELSLASH_SERVER"]) throw new VisualError("--upload needs PIXELSLASH_SERVER");
  if (process.env["VISUAL_BASE"])
    throw new VisualError("--upload diffs against origin/main on the server; unset VISUAL_BASE");
  const state = await uploadState();
  const mode = decide(state);
  if (token().startsWith("psci_"))
    throw new VisualError(
      "the PixelSlash token is a project CI token (psci_), which uploads to its one project only; " +
        "each docs section has its own project, so use an org token (psorg_) or a personal one (psu_)",
    );
  if (mode === "main") await requireProjects(projects);
  else await requireBaselines(projects, state.mergeBase);
  return mode;
}

async function uploadState(): Promise<UploadState> {
  const [branch, status, head, tip, mergeBase] = await Promise.all([
    git(repoRoot, "branch", "--show-current"),
    git(repoRoot, "status", "--porcelain"),
    git(repoRoot, "rev-parse", "HEAD"),
    git(repoRoot, "rev-parse", "origin/main"),
    git(repoRoot, "merge-base", "HEAD", "origin/main"),
  ]);
  return { branch, dirty: status !== "", head, tip, mergeBase };
}

function decide(state: UploadState): UploadMode {
  try {
    return decideUpload(state);
  } catch (error) {
    throw new VisualError(error instanceof Error ? error.message : String(error));
  }
}

/** Main's own upload needs no baseline, only a project to send to. */
async function requireProjects(projects: string[]) {
  const missing: string[] = [];
  for (const project of projects) if (!(await projectExists(project))) missing.push(project);
  if (missing.length > 0)
    throw new VisualError(
      `the server has no PixelSlash project ${missing.join(", ")} (or the token cannot see it); ` +
        "create each with `pixelslash project create <name>` and re-run",
    );
}

async function requireBaselines(projects: string[], mergeBase: string) {
  const failure = await baselineFailure(projects, {
    mainShas,
    isAncestor: (sha) => isAncestor(sha, mergeBase),
  });
  if (failure !== undefined) throw new VisualError(failure);
}

const POLL_TIMEOUT_MS = 5 * 60_000;
const POLL_INTERVAL_MS = 3000;

/**
 * The build `id` as `pixelslash builds --json` lists it. Not `status --build --json`, which prints
 * every shot (about 0.5 MB for 444) and is cut short when read through a pipe; the listing carries
 * the same status and counts in a line.
 */
async function readBuildState(project: string, id: string): Promise<BuildState> {
  const build = buildIn(await listBuilds(project, "--limit", "20"), id);
  if (build === undefined)
    throw new VisualError(`${project} lists no build ${id} among its newest 20`);
  return build;
}

/** The build id `pixelslash upload` recorded in the snapshot dir it sent. */
function recordedBuild(dir: string): string {
  const path = join(dir, "build.json");
  const recorded: unknown = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
  const id = isRecord(recorded) ? recorded["build"] : undefined;
  if (typeof id !== "string" || id === "")
    throw new VisualError(`${path} has no build id: the upload made no build`);
  return id;
}

/**
 * The group's capture sent to `project`: on the branch, or as `main` in main mode. Then waits for
 * the server to finish diffing it and returns the build, whose counts and page are the result.
 * Nothing about main is built or captured here: the server holds the baseline.
 */
export async function uploadGroup(project: string, dir: string, mode: UploadMode) {
  const snapshots = join(dir, "branch");
  log(
    mode === "main"
      ? `uploading this commit to ${project} as main`
      : `uploading the branch to ${project}`,
  );
  await uploadSnapshots(
    snapshots,
    repoRoot,
    project,
    ...(mode === "main" ? ["--branch", "main"] : []),
  );
  const id = recordedBuild(snapshots);
  let build: BuildState;
  try {
    build = await settle(id, {
      read: () => readBuildState(project, id),
      sleep: (ms) => Bun.sleep(ms),
      now: Date.now,
      timeoutMs: POLL_TIMEOUT_MS,
      intervalMs: POLL_INTERVAL_MS,
    });
  } catch (error) {
    if (error instanceof VisualError) throw error;
    throw new VisualError(`${project}: ${error instanceof Error ? error.message : String(error)}`);
  }
  log(build.url ? `build: ${build.url}` : `uploaded ${project} build ${id}, which lists no page`);
  return build;
}
