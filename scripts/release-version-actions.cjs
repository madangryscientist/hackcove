/**
 * Nx release's version actions for this repo: the stock JS ones, plus a bun.lock refresh.
 *
 * The workspace entries in bun.lock carry each package's version, so a release bump leaves them
 * stale and the next `bun install` rewrites them. Nx would refresh the lockfile itself, but it
 * picks the lockfile command from nx.json `cli.packageManager`, which has to stay `npm` so the
 * publish step runs `npm publish` (the OIDC-capable client). This replaces Nx's own refresh (which
 * would run `npm install --package-lock-only`); the files this hook returns are staged into the
 * release commit.
 */
const { execFileSync } = require("node:child_process");
const jsVersionActions = require("@nx/js/src/release/version-actions");

async function afterAllProjectsVersioned(cwd, { dryRun, verbose }) {
  if (dryRun) {
    if (verbose) console.log("Would run `bun install --lockfile-only`, but --dry-run was set.");
  } else {
    execFileSync("bun", ["install", "--lockfile-only"], { cwd, stdio: "inherit" });
  }
  return { changedFiles: ["bun.lock"], deletedFiles: [] };
}

module.exports = { default: jsVersionActions.default, afterAllProjectsVersioned };
