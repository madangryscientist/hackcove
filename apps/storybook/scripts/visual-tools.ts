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
import { indexOf } from "./visual-index.js";
import { MAX_SHOT_PIXELS, shotSizes, sizeReport } from "./visual-shots.js";
import type { Counts } from "./visual-upload.js";

export type { Counts };

export const appDir = join(import.meta.dirname, "..");
export const repoRoot = join(appDir, "..", "..");
export const out = join(appDir, ".pixelslash");
const config = join(appDir, "pixelslash.config.ts");
const pixelslashDir = resolve(
  process.env["PIXELSLASH_DIR"] ?? join(homedir(), "dev", "pixelslash"),
);
export const pixelslashCli = join(pixelslashDir, "packages", "cli", "src", "index.ts");
export const baselineDir = join(homedir(), "dev", "hackcove.visual-main");
export const branchStatic = join(appDir, "storybook-static");
export const baseStatic = join(baselineDir, "apps", "storybook", "storybook-static");
// The base's build, stamped with its commit inside the shared worktree, so whichever checkout last
// built it says which commit it is.
const baseStamp = join(baseStatic, ".visual-sha");

export class VisualError extends Error {}

export function log(message: string) {
  process.stdout.write(`visual: ${message}\n`);
}

/** A step that did not exit 0: a signal-killed one names the signal (someone else's `pkill`, say). */
export function stepFailure(cmd: string, cwd: string, signal?: string | number | null): string {
  return signal ? `\`${cmd}\` killed by ${signal} in ${cwd}` : `\`${cmd}\` failed in ${cwd}`;
}

export async function run(cmd: string[], cwd: string, env: Record<string, string> = {}) {
  const proc = Bun.spawn(cmd, { cwd, env: { ...process.env, ...env }, stdio: ["ignore", 2, 2] });
  if ((await proc.exited) !== 0)
    throw new VisualError(stepFailure(cmd.join(" "), cwd, proc.signalCode));
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
 * refuses an include that matches no story, so a selection whose stories or themes are all absent
 * on this side (new on the branch, say) is an empty capture.
 */
export async function capture(staticDir: string, into: string, port: number, pick: Selection) {
  rmSync(into, { recursive: true, force: true });
  const present = indexOf(staticDir);
  const include = pick.titles.filter((title) => present.has(title));
  if (include.length === 0 || pick.themes.length === 0) {
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

/**
 * Fails when a captured shot is over PixelSlash's limit (PS-323: the server ends a build at errored
 * on one), naming each, and logs a shot that is close to it so its section is split first.
 */
export function checkShotSizes(dir: string, label: string) {
  const { over, near } = sizeReport(shotSizes(dir));
  for (const line of near) log(`${label}: ${line}, near the ${MAX_SHOT_PIXELS / 1e6} Mpx limit`);
  if (over.length > 0)
    throw new VisualError(
      `${label}: over PixelSlash's ${MAX_SHOT_PIXELS / 1e6} Mpx limit for one shot:\n  ` +
        `${over.join("\n  ")}\nsplit the story (an Overview section is one story per ` +
        "gallerySections entry)",
    );
}

const COUNTS = /^pixelslash: (\d+) changed, (\d+) unchanged, (\d+) new, (\d+) removed/m;

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
  if (existsSync(baseStamp) && readFileSync(baseStamp, "utf8").trim() === sha) {
    // The static build is the right one, but the worktree is shared: another checkout may have
    // moved it since. Its files are what the base's theme ids are read from, so put them back.
    if ((await git(baselineDir, "rev-parse", "HEAD")) !== sha) await checkoutBaseline(sha);
    return;
  }
  log(`building base ${sha.slice(0, 7)}`);
  await checkoutBaseline(sha);
  await run(["bunx", "nx", "build", "storybook"], baselineDir);
  writeFileSync(baseStamp, `${sha}\n`);
}
