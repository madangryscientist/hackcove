/**
 * `nx run storybook:visual`: what did this change do to every story in every theme?
 *
 * Captures the built working tree (the Nx `build` dependency) and origin/main's Storybook with
 * PixelSlash, then compares them locally. pixelslash is not published: it runs from the checkout
 * `PIXELSLASH_DIR` names (default ~/dev/pixelslash). The baseline is built in a reusable worktree
 * at ~/dev/hackcove.visual-main, so this checkout's branch and working tree are never touched.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const appDir = join(import.meta.dirname, "..");
const repoRoot = join(appDir, "..", "..");
const out = join(appDir, ".pixelslash");
const config = join(appDir, "pixelslash.config.ts");
const pixelslashDir = resolve(
  process.env["PIXELSLASH_DIR"] ?? join(homedir(), "dev", "pixelslash"),
);
const storybookUrl = "http://127.0.0.1:6008"; // the port pixelslash.config.ts serves on
const baselineDir = join(homedir(), "dev", "hackcove.visual-main");

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

/** One capture of a built storybook-static into a fresh snapshot dir. */
async function capture(staticDir: string, into: string) {
  // PixelSlash takes any answer on the ready URL for its own server, so a server left on the port
  // (or another worktree's run) would be captured instead, and the report could say 0 changed.
  const taken = await fetch(`${storybookUrl}/`, { signal: AbortSignal.timeout(2000) }).then(
    () => true,
    () => false,
  );
  if (taken)
    throw new VisualError(`something already answers on ${storybookUrl}; stop it and re-run`);
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
    { VISUAL_STATIC_DIR: staticDir },
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

async function main() {
  const started = Date.now();
  if (!existsSync(join(pixelslashDir, "packages", "cli", "src", "index.ts")))
    throw new VisualError(`no pixelslash checkout at ${pixelslashDir}; set PIXELSLASH_DIR`);

  log("capturing the working tree");
  await capture(join(appDir, "storybook-static"), join(out, "branch"));

  await git(repoRoot, "fetch", "origin", "main");
  const sha = await git(repoRoot, "rev-parse", "origin/main");
  const stamp = join(out, "main.sha");
  const cached =
    existsSync(join(out, "main", "manifest.json")) &&
    existsSync(stamp) &&
    readFileSync(stamp, "utf8").trim() === sha;
  if (cached) {
    log(`origin/main ${sha.slice(0, 7)} already captured`);
  } else {
    log(`building and capturing origin/main ${sha.slice(0, 7)}`);
    rmSync(stamp, { force: true });
    await checkoutBaseline(sha);
    await run(["bunx", "nx", "build", "storybook"], baselineDir);
    await capture(join(baselineDir, "apps", "storybook", "storybook-static"), join(out, "main"));
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
