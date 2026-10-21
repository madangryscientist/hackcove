/**
 * `nx run storybook:visual`: what did this change do to every story in every theme?
 *
 * Captures the built working tree (the Nx `build` dependency) and origin/main's Storybook with
 * PixelSlash, then compares them locally. pixelslash is not published: it runs from the checkout
 * `PIXELSLASH_DIR` names (default ~/dev/pixelslash). The baseline is built in a reusable worktree
 * at ~/dev/hackcove.visual-main, so this checkout's branch and working tree are never touched.
 *
 * `--upload` also sends both captures to the PixelSlash server `PIXELSLASH_SERVER` names, with the
 * CI token from `PIXELSLASH_TOKEN` or the file `PIXELSLASH_TOKEN_PATH`: origin/main's once per
 * commit (as branch `main`, which the server auto-accepts as the baseline), then the branch's.
 *
 * The static Storybook is served on a port free at run time (`VISUAL_PORT` overrides it), so two
 * checkouts can run at once. The baseline worktree is shared by all of them, so it is built under
 * a lock.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const appDir = join(import.meta.dirname, "..");
const repoRoot = join(appDir, "..", "..");
const out = join(appDir, ".pixelslash");
const config = join(appDir, "pixelslash.config.ts");
const pixelslashDir = resolve(
  process.env["PIXELSLASH_DIR"] ?? join(homedir(), "dev", "pixelslash"),
);
const baselineDir = join(homedir(), "dev", "hackcove.visual-main");

const upload = process.argv.includes("--upload");

class VisualError extends Error {}

function log(message: string) {
  process.stdout.write(`visual: ${message}\n`);
}

async function run(cmd: string[], cwd: string, env: Record<string, string> = {}) {
  const proc = Bun.spawn(cmd, { cwd, env: { ...process.env, ...env }, stdio: ["ignore", 2, 2] });
  if ((await proc.exited) !== 0) throw new VisualError(`\`${cmd.join(" ")}\` failed in ${cwd}`);
}

async function git(cwd: string, ...args: string[]): Promise<string> {
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
async function capturePort(): Promise<number> {
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
async function withBaselineLock<T>(task: () => Promise<T>): Promise<T> {
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

/** One capture of a built storybook-static into a fresh snapshot dir, served on `port`. */
async function capture(staticDir: string, into: string, port: number) {
  // PixelSlash takes any answer on the ready URL for its own server, so a server left on the port
  // (or another worktree's run) would be captured instead, and the report could say 0 changed.
  const taken = await fetch(`http://127.0.0.1:${port}/`, {
    signal: AbortSignal.timeout(2000),
  }).then(
    () => true,
    () => false,
  );
  if (taken) throw new VisualError(`something already answers on port ${port}; stop it and re-run`);
  rmSync(into, { recursive: true, force: true });
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
    { VISUAL_STATIC_DIR: staticDir, VISUAL_PORT: String(port) },
  );
}

/**
 * `pixelslash upload` run from `cwd`, the checkout whose commit, branch and merge-base it sends.
 * Not `bun run --cwd` like the other calls: that would read git from the pixelslash checkout.
 */
async function uploadSnapshots(dir: string, cwd: string, ...flags: string[]) {
  const tokenPath = process.env["PIXELSLASH_TOKEN_PATH"];
  await run(
    [
      "bun",
      join(pixelslashDir, "packages", "cli", "src", "index.ts"),
      "upload",
      dir,
      ...(tokenPath ? ["--token-path", tokenPath] : []),
      ...flags,
    ],
    cwd,
  );
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

/**
 * What `--upload` needs, checked before the minute-long capture. The server takes a branch's
 * baseline from its merge-base, and a `main` upload is auto-accepted, so only a clean branch on
 * origin/main's tip uploads: anything else would read "new" everywhere or seed a wrong baseline.
 */
async function checkUpload() {
  if (!process.env["PIXELSLASH_SERVER"]) throw new VisualError("--upload needs PIXELSLASH_SERVER");
  if (process.env["VISUAL_BASE"])
    throw new VisualError("--upload seeds origin/main as the baseline; unset VISUAL_BASE");
  if ((await git(repoRoot, "branch", "--show-current")) === "main")
    throw new VisualError("on main: the server would auto-accept the working tree as the baseline");
  if (await git(repoRoot, "status", "--porcelain"))
    throw new VisualError("uncommitted changes: the upload names HEAD; commit first");
  await git(repoRoot, "fetch", "origin", "main");
  const [tip, mergeBase] = await Promise.all([
    git(repoRoot, "rev-parse", "origin/main"),
    git(repoRoot, "merge-base", "HEAD", "origin/main"),
  ]);
  if (mergeBase !== tip)
    throw new VisualError(
      "not based on origin/main's tip, so its baseline is out of reach; rebase",
    );
}

/** origin/main's capture as `main`, once per commit and server, then the working tree's. */
async function uploadBoth(sha: string) {
  const uploaded = join(out, "main.uploaded");
  const seeded = `${sha} ${process.env["PIXELSLASH_SERVER"] ?? ""}`;
  if (existsSync(uploaded) && readFileSync(uploaded, "utf8").trim() === seeded) {
    log(`origin/main ${sha.slice(0, 7)} already uploaded`);
  } else {
    log(`uploading origin/main ${sha.slice(0, 7)}`);
    await withBaselineLock(async () => {
      await checkoutBaseline(sha);
      await uploadSnapshots(join(out, "main"), baselineDir, "--branch", "main");
    });
    writeFileSync(uploaded, `${seeded}\n`);
  }
  log("uploading the working tree");
  await uploadSnapshots(join(out, "branch"), repoRoot);
}

async function main() {
  const started = Date.now();
  if (!existsSync(join(pixelslashDir, "packages", "cli", "src", "index.ts")))
    throw new VisualError(`no pixelslash checkout at ${pixelslashDir}; set PIXELSLASH_DIR`);

  if (upload) await checkUpload();

  const port = await capturePort();

  log("capturing the working tree");
  await capture(join(appDir, "storybook-static"), join(out, "branch"), port);

  await git(repoRoot, "fetch", "origin", "main");
  const base = process.env["VISUAL_BASE"] || "origin/main";
  const sha = await git(repoRoot, "rev-parse", base);
  const stamp = join(out, "main.sha");
  const cached =
    existsSync(join(out, "main", "manifest.json")) &&
    existsSync(stamp) &&
    readFileSync(stamp, "utf8").trim() === sha;
  if (cached) {
    log(`${base} ${sha.slice(0, 7)} already captured`);
  } else {
    log(`building and capturing ${base} ${sha.slice(0, 7)}`);
    rmSync(stamp, { force: true });
    await withBaselineLock(async () => {
      await checkoutBaseline(sha);
      await run(["bunx", "nx", "build", "storybook"], baselineDir);
      await capture(
        join(baselineDir, "apps", "storybook", "storybook-static"),
        join(out, "main"),
        port,
      );
    });
    writeFileSync(stamp, `${sha}\n`);
  }

  const report = join(out, "report");
  rmSync(report, { recursive: true, force: true });
  await run(
    [
      "bun",
      "run",
      "--cwd",
      pixelslashDir,
      "pixelslash",
      "--",
      "compare",
      join(out, "main"),
      join(out, "branch"),
      "--out",
      report,
    ],
    pixelslashDir,
  );
  if (upload) await uploadBoth(sha);

  log(`done in ${Math.round((Date.now() - started) / 1000)}s`);
  log(`report: ${join(report, "index.html")}`);
}

try {
  await main();
} catch (error) {
  if (!(error instanceof VisualError)) throw error;
  process.stderr.write(`visual: ${error.message}\n`);
  process.exit(1);
}
