// Run by `nx release publish` (target `nx-release-publish`) from a package folder.
// Nx forwards `--dryRun=true`, which npm does not read as `--dry-run`; map it here so a dry run never publishes.
const dryRun = process.argv.slice(2).some((arg) => arg === "--dryRun" || arg === "--dryRun=true");
const args = ["publish", "--access", "public", ...(dryRun ? ["--dry-run"] : [])];
const result = Bun.spawnSync(["npm", ...args], { stdio: ["inherit", "inherit", "inherit"] });
process.exit(result.exitCode);
