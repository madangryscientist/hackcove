/**
 * Runs the anti-slop rules (`slopRules.ts`) over the package in the current directory. Run by
 * `bun run lint` after oxlint; any hit fails the gate.
 */
import { existsSync, globSync, readFileSync } from "node:fs";
import { slopRules } from "./slopRules";

const manifest: unknown = JSON.parse(readFileSync("package.json", "utf8"));
const hasName = (value: unknown): value is { name: string } =>
  typeof value === "object" && value !== null && "name" in value && typeof value.name === "string";
if (!hasName(manifest))
  throw new Error("check-slop: package.json in the current directory has no name");
const pkg = manifest.name;
// The colour utilities ui-react's components may use; only that package has the file.
const roles: Record<string, string[]> | undefined = existsSync("palette.json")
  ? JSON.parse(readFileSync("palette.json", "utf8"))
  : undefined;
const palette = roles && new Set(Object.values(roles).flat());
// Every source the project owns: its folders, and its root's CSS, docs, config and scripts. The
// changelog is written by `nx release`, and generated files are not edited by hand.
const sources = [
  ...globSync("{src,test,e2e,smoke,scripts,docs}/**/*.{ts,tsx,astro,css,md,mdx,mjs}"),
  ...globSync("*.{css,md,mjs,sh}"),
];
const generated = (path: string): boolean =>
  path === "CHANGELOG.md" || path.endsWith("routeTree.gen.ts") || path.startsWith("src/generated/");
// The rules file holds the very patterns and messages it checks for, so it would match itself.
// It is still typechecked, oxlinted and tested (themes-shared's slopRules.test.ts).
const isRulesFile = (path: string): boolean => path === "scripts/slopRules.ts";
const hits = sources
  .filter((path) => !generated(path) && !isRulesFile(path))
  .flatMap((path) => slopRules(path, readFileSync(path, "utf8"), pkg, palette));
if (hits.length > 0) {
  console.error(hits.join("\n"));
  process.exit(1);
}
