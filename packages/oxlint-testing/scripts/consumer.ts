/**
 * Consumer check: the published tarball works where a consumer installs it. Packs the package,
 * installs the tarball and its exact peers into a throwaway app in the temp dir (bun's isolated
 * linker with the global store, where the package's config and plugin live outside the app), and
 * runs the app's own oxlint with a config that extends the package's on one bad spec. The spec
 * must be reported by the package's plugin and by eslint-plugin-playwright, which proves the
 * config's `jsPlugins` resolve from the installed package. Built as
 * `packages/ui-react/scripts/consumer-types.ts` builds its app. Run by `pack-check`.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const pkg: { version: string; peerDependencies: Record<string, string> } = JSON.parse(
  readFileSync(join(root, "package.json"), "utf8"),
);

// One dir per checkout, so concurrent worktrees do not collide.
const app = join(
  tmpdir(),
  `hackcove-oxlint-testing-consumer-${createHash("sha1").update(root).digest("hex").slice(0, 8)}`,
);
rmSync(app, { recursive: true, force: true });
mkdirSync(join(app, "e2e"), { recursive: true });

function run(cmd: string[], cwd: string): { code: number; out: string; err: string } {
  const result = Bun.spawnSync(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
  return { code: result.exitCode, out: result.stdout.toString(), err: result.stderr.toString() };
}

function mustRun(cmd: string[], cwd: string): void {
  const { code, out, err } = run(cmd, cwd);
  if (code !== 0) throw new Error(`${cmd.join(" ")} failed in ${cwd}\n${out}${err}`);
}

const BAD_SPEC = [
  'import { test } from "@playwright/test";',
  "",
  'test("acts through a selector", async ({ page }) => {',
  '  await page.click("#save");',
  '  await page.locator(".card").click();',
  "});",
  "",
].join("\n");

try {
  mustRun(["npm", "pack", "--ignore-scripts", "--pack-destination", app], root);
  const tarball = join(app, `hackcove-oxlint-testing-${pkg.version}.tgz`);

  writeFileSync(
    join(app, "package.json"),
    JSON.stringify({
      name: "consumer",
      private: true,
      type: "module",
      devDependencies: { "@hackcove/oxlint-testing": `file:${tarball}`, ...pkg.peerDependencies },
    }),
  );
  writeFileSync(join(app, "bunfig.toml"), '[install]\nlinker = "isolated"\nglobalStore = true\n');
  writeFileSync(
    join(app, ".oxlintrc.json"),
    JSON.stringify({ extends: ["./node_modules/@hackcove/oxlint-testing/.oxlintrc.json"] }),
  );
  writeFileSync(join(app, "e2e", "save.spec.ts"), BAD_SPEC);

  mustRun(["bun", "install", "--prefer-offline"], app);
  // The report is stdout alone; oxlint may print a notice on stderr.
  const { out } = run(["node_modules/.bin/oxlint", "-f", "json", "e2e"], app);
  const report: { diagnostics: { code: string }[] } = JSON.parse(out);
  const codes = new Set(report.diagnostics.map((d) => d.code));
  const missing = ["ui-testing(no-selector-actions)", "playwright(no-raw-locators)"].filter(
    (code) => !codes.has(code),
  );
  if (missing.length > 0) {
    throw new Error(`the installed config did not report ${missing.join(", ")}:\n${out}`);
  }
  process.stdout.write("consumer: ok (the installed config reports the bad spec)\n");
} finally {
  rmSync(app, { recursive: true, force: true });
}
