/**
 * What `visual.ts` runs: git, the pixelslash checkout, and the baseline worktree.
 *
 * pixelslash is not published: it runs from the checkout `PIXELSLASH_DIR` names (default
 * ~/dev/pixelslash), whose dependencies are installed from its lockfile here when behind. The base
 * is built in a reusable worktree at ~/dev/hackcove.visual-main, so this checkout's branch and
 * working tree are never touched. That worktree is shared by every checkout on the machine, so it
 * is built and captured under a lock.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { indexOf, isRecord } from "./visual-index.js";

export const appDir = join(import.meta.dirname, "..");
export const repoRoot = join(appDir, "..", "..");
export const out = join(appDir, ".pixelslash");
const config = join(appDir, "pixelslash.config.ts");
const pixelslashDir = resolve(
  process.env["PIXELSLASH_DIR"] ?? join(homedir(), "dev", "pixelslash"),
);
const pixelslashCli = join(pixelslashDir, "packages", "cli", "src", "index.ts");
const baselineDir = join(homedir(), "dev", "hackcove.visual-main");
export const branchStatic = join(appDir, "storybook-static");
export const baseStatic = join(baselineDir, "apps", "storybook", "storybook-static");
// The base's build, stamped with its commit inside the shared worktree, so whichever checkout last
// built it says which commit it is.
const baseStamp = join(baseStatic, ".visual-sha");

export class VisualError extends Error {}

export function log(message: string) {
  process.stdout.write(`visual: ${message}\n`);
}

async function run(cmd: string[], cwd: string, env: Record<string, string> = {}) {
  const proc = Bun.spawn(cmd, { cwd, env: { ...process.env, ...env }, stdio: ["ignore", 2, 2] });
  if ((await proc.exited) !== 0) throw new VisualError(`\`${cmd.join(" ")}\` failed in ${cwd}`);
}

export async function git(cwd: string, ...args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], { cwd, stdout: "pipe", stderr: "inherit" });
  const text = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0)
    throw new VisualError(`\`git ${args.join(" ")}\` failed in ${cwd}`);
  return text.trim();
}

/** A port nothing listens on now: the OS hands out a free one, and the probe server stops at once. */
async function freePort(): Promise<number> {
  const probe = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const port = probe.port;
  await probe.stop(true);
  if (port === undefined) throw new VisualError("no TCP port to serve the capture on");
  return port;
}

/** The port this run serves on: `VISUAL_PORT` if set, else one free now. */
export async function capturePort(): Promise<number> {
  const given = process.env["VISUAL_PORT"];
  if (!given) return freePort();
  const port = Number(given);
  if (!Number.isInteger(port) || port <= 0) throw new VisualError(`VISUAL_PORT is not a port`);
  return port;
}

/**
 * Runs `task` holding the baseline lock. The baseline worktree is one directory for every checkout
 * on this machine, so two builds at once would check out and install over each other. `mkdir` is
 * atomic, so the run that creates the lock holds it and the others wait. A lock left by a run that
 * died is removed by hand, as the wait message says.
 */
export async function withBaselineLock<T>(task: () => Promise<T>): Promise<T> {
  const lock = `${baselineDir}.lock`;
  let waiting = false;
  while (true) {
    try {
      mkdirSync(lock);
      break;
    } catch {
      if (!waiting)
        log(`waiting for another run on the baseline; if none is running, rm -r ${lock}`);
      waiting = true;
      await Bun.sleep(1000);
    }
  }
  try {
    return await task();
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}

/* ---------------------------------------------------------------------------
   PixelSlash
   --------------------------------------------------------------------------- */

/** The stories to capture, by meta title, and the themes to capture them in. */
export type Selection = { titles: string[]; themes: string[] };

/**
 * One capture of a built storybook-static into a fresh snapshot dir, served on `port`. PixelSlash
 * refuses an include that matches no story, so a selection whose stories are all absent on this
 * side (new on the branch, say) is an empty capture.
 */
export async function capture(staticDir: string, into: string, port: number, pick: Selection) {
  rmSync(into, { recursive: true, force: true });
  const present = indexOf(staticDir);
  const include = pick.titles.filter((title) => present.has(title));
  if (include.length === 0) {
    mkdirSync(into, { recursive: true });
    writeFileSync(
      join(into, "manifest.json"),
      `${JSON.stringify({ version: 1, snapshots: [] })}\n`,
    );
    return;
  }
  // PixelSlash takes any answer on the ready URL for its own server, so a server left on the port
  // (or another worktree's run) would be captured instead, and the report could say 0 changed.
  const taken = await fetch(`http://127.0.0.1:${port}/`, {
    signal: AbortSignal.timeout(2000),
  }).then(
    () => true,
    () => false,
  );
  if (taken) throw new VisualError(`something already answers on port ${port}; stop it and re-run`);
  await run(
    [
      "bun",
      "run",
      "--cwd",
      pixelslashDir,
      "pixelslash",
      "--",
      "capture",
      "--config",
      config,
      "--out",
      into,
    ],
    pixelslashDir,
    {
      VISUAL_STATIC_DIR: staticDir,
      VISUAL_PORT: String(port),
      VISUAL_INCLUDE: JSON.stringify(include),
      VISUAL_THEMES: JSON.stringify(pick.themes),
    },
  );
}

const COUNTS = /^pixelslash: (\d+) changed, (\d+) unchanged, (\d+) new, (\d+) removed/m;

export type Counts = { changed: number; unchanged: number; new: number; removed: number };

/** `pixelslash compare`, its output passed through and its counts line read. */
export async function compare(mainDir: string, branchDir: string, report: string): Promise<Counts> {
  rmSync(report, { recursive: true, force: true });
  const proc = Bun.spawn(
    [
      "bun",
      "run",
      "--cwd",
      pixelslashDir,
      "pixelslash",
      "--",
      "compare",
      mainDir,
      branchDir,
      "--out",
      report,
    ],
    { cwd: pixelslashDir, stdout: "pipe", stderr: "inherit" },
  );
  const text = await new Response(proc.stdout).text();
  process.stdout.write(text);
  if ((await proc.exited) !== 0)
    throw new VisualError(`\`pixelslash compare\` failed for ${branchDir}`);
  const [, changed = "0", unchanged = "0", added = "0", removed = "0"] = COUNTS.exec(text) ?? [];
  return {
    changed: Number(changed),
    unchanged: Number(unchanged),
    new: Number(added),
    removed: Number(removed),
  };
}

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

/**
 * PIXELSLASH_DIR's dependencies, in step with its lockfile. `--frozen-lockfile` never rewrites the
 * lockfile and is a no-op when `node_modules` is current; when it cannot install, the message names
 * the command to run by hand.
 */
export async function ensurePixelslashInstall() {
  if (!existsSync(pixelslashCli))
    throw new VisualError(`no pixelslash checkout at ${pixelslashDir}; set PIXELSLASH_DIR`);
  const command = "bun install --frozen-lockfile";
  const proc = Bun.spawn(["bun", "install", "--frozen-lockfile"], {
    cwd: pixelslashDir,
    stdio: ["ignore", 2, 2],
  });
  if ((await proc.exited) !== 0)
    throw new VisualError(
      `\`${command}\` failed in ${pixelslashDir}; run it there and read why (node_modules behind its lockfile, or the lockfile out of step with package.json)`,
    );
}

/**
 * The newest build of `project` (on `branch`, if given): its URL, `""` for none, or `undefined`
 * when the server refused (no such project, or a token that cannot see it). `upload` itself prints
 * no link; `builds --json` has it.
 */
async function newestBuild(project: string, branch?: string): Promise<string | undefined> {
  const proc = Bun.spawn(
    [
      "bun",
      pixelslashCli,
      "builds",
      "--project",
      project,
      ...(branch === undefined ? [] : ["--branch", branch]),
      "--limit",
      "1",
      "--json",
      ...tokenPathFlags(),
    ],
    { cwd: repoRoot, stdout: "pipe", stderr: "inherit" },
  );
  const text = await new Response(proc.stdout).text();
  if ((await proc.exited) !== 0) return undefined;
  const listing: unknown = JSON.parse(text);
  const builds = isRecord(listing) && Array.isArray(listing["builds"]) ? listing["builds"] : [];
  const [build]: unknown[] = builds;
  return isRecord(build) && typeof build["web_url"] === "string" ? build["web_url"] : "";
}

/**
 * What `--upload` needs, checked before any capture. The server takes a branch's baseline from its
 * merge-base, and a `main` upload is auto-accepted, so only a clean branch on origin/main's tip
 * uploads: anything else would read "new" everywhere or seed a wrong baseline. One token uploads
 * to every group's project, so it must be one that names a project, and each project must exist.
 */
/** The branch `--upload` sends: committed, not main, and on origin/main's tip. */
async function checkBranch() {
  if ((await git(repoRoot, "branch", "--show-current")) === "main")
    throw new VisualError("on main: the server would auto-accept the working tree as the baseline");
  if (await git(repoRoot, "status", "--porcelain"))
    throw new VisualError("uncommitted changes: the upload names HEAD; commit first");
  const [tip, mergeBase] = await Promise.all([
    git(repoRoot, "rev-parse", "origin/main"),
    git(repoRoot, "merge-base", "HEAD", "origin/main"),
  ]);
  if (mergeBase !== tip)
    throw new VisualError(
      "not based on origin/main's tip, so its baseline is out of reach; rebase",
    );
}

function token(): string {
  const tokenPath = process.env["PIXELSLASH_TOKEN_PATH"];
  if (process.env["PIXELSLASH_TOKEN"]) return process.env["PIXELSLASH_TOKEN"];
  return tokenPath && existsSync(tokenPath) ? readFileSync(tokenPath, "utf8").trim() : "";
}

/**
 * What `--upload` needs, checked before any capture. The server takes a branch's baseline from its
 * merge-base, and a `main` upload is auto-accepted, so only a clean branch on origin/main's tip
 * uploads: anything else would read "new" everywhere or seed a wrong baseline. One token uploads
 * to every group's project, so it must be one that names a project, and each project must exist.
 */
export async function checkUpload(projects: string[]) {
  if (!process.env["PIXELSLASH_SERVER"]) throw new VisualError("--upload needs PIXELSLASH_SERVER");
  if (process.env["VISUAL_BASE"])
    throw new VisualError("--upload seeds origin/main as the baseline; unset VISUAL_BASE");
  await checkBranch();
  if (token().startsWith("psci_"))
    throw new VisualError(
      "the PixelSlash token is a project CI token (psci_), which uploads to its one project only; " +
        "each docs section has its own project, so use an org token (psorg_) or a personal one (psu_)",
    );
  const missing: string[] = [];
  for (const project of projects)
    if ((await newestBuild(project)) === undefined) missing.push(project);
  if (missing.length > 0)
    throw new VisualError(
      `the server has no PixelSlash project ${missing.join(", ")} (or the token cannot see it); ` +
        "create each with `pixelslash project create <name>` and re-run",
    );
}

/** origin/main's capture as `main` in `project`, once per commit and server, then the branch's. */
export async function uploadGroup(project: string, sha: string, dir: string) {
  const uploaded = join(dir, "main.uploaded");
  const seeded = `${sha} ${process.env["PIXELSLASH_SERVER"] ?? ""} ${project}`;
  if (existsSync(uploaded) && readFileSync(uploaded, "utf8").trim() === seeded) {
    log(`origin/main ${sha.slice(0, 7)} already uploaded to ${project}`);
  } else {
    log(`uploading origin/main ${sha.slice(0, 7)} to ${project}`);
    await withBaselineLock(async () => {
      await checkoutBaseline(sha);
      await uploadSnapshots(join(dir, "main"), baselineDir, project, "--branch", "main");
    });
    writeFileSync(uploaded, `${seeded}\n`);
  }
  log(`uploading the working tree to ${project}`);
  await uploadSnapshots(join(dir, "branch"), repoRoot, project);
  const url = await newestBuild(project, await git(repoRoot, "branch", "--show-current"));
  log(url ? `build: ${url}` : `uploaded, but ${project} lists no build for this branch`);
}

/* ---------------------------------------------------------------------------
   The base
   --------------------------------------------------------------------------- */

/**
 * The commit to compare against: `VISUAL_BASE` when set, else the branch's merge-base with
 * origin/main. `label` is what the log calls it.
 */
export async function resolveBase(): Promise<{ label: string; sha: string }> {
  await git(repoRoot, "fetch", "origin", "main");
  const given = process.env["VISUAL_BASE"];
  if (given) return { label: given, sha: await git(repoRoot, "rev-parse", given) };
  return { label: "merge-base", sha: await git(repoRoot, "merge-base", "HEAD", "origin/main") };
}

/** What the working tree changed against `sha`, untracked files included; `undefined` if git fails. */
export async function changedSince(sha: string): Promise<string[] | undefined> {
  try {
    const [tracked, untracked] = await Promise.all([
      git(repoRoot, "diff", "--name-only", "--no-renames", sha),
      git(repoRoot, "ls-files", "--others", "--exclude-standard"),
    ]);
    return [...new Set([...tracked.split("\n"), ...untracked.split("\n")])].filter(Boolean);
  } catch {
    return undefined;
  }
}

/** The baseline worktree at `sha`, with dependencies installed when its lockfile changed. */
async function checkoutBaseline(sha: string) {
  if (existsSync(baselineDir)) {
    const registered = await git(repoRoot, "worktree", "list", "--porcelain");
    if (!registered.split("\n").includes(`worktree ${baselineDir}`))
      throw new VisualError(`${baselineDir} exists but is not a worktree of this repo`);
  }
  const lockfile = join(baselineDir, "bun.lock");
  const before = existsSync(lockfile) ? readFileSync(lockfile, "utf8") : undefined;
  if (before === undefined) await git(repoRoot, "worktree", "add", "--detach", baselineDir, sha);
  else await git(baselineDir, "checkout", "--force", "--detach", sha);
  const changed = before !== readFileSync(lockfile, "utf8");
  if (changed || !existsSync(join(baselineDir, "node_modules")))
    await run(["bun", "install"], baselineDir);
}

/** The baseline worktree's Storybook, built at `sha` unless it already is. Call under the lock. */
export async function buildBase(sha: string) {
  if (existsSync(baseStamp) && readFileSync(baseStamp, "utf8").trim() === sha) return;
  log(`building base ${sha.slice(0, 7)}`);
  await checkoutBaseline(sha);
  await run(["bunx", "nx", "build", "storybook"], baselineDir);
  writeFileSync(baseStamp, `${sha}\n`);
}
