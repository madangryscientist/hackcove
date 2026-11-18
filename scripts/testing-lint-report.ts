/**
 * The testing lint, in report mode: runs `@hackcove/oxlint-testing`'s config (its own globs) over
 * each project that does not enforce it yet, and prints how many lines each rule reports there.
 * Always exits 0, and is not part of the gate. A project whose count reaches 0 moves into its own
 * `lint` and off this list (packages/oxlint-testing/README.md, "In this repo").
 *
 * Run as `bun run lint:testing`.
 */
import { resolve } from "node:path";
import { lint } from "../packages/oxlint-testing/scripts/lint";

const PROJECTS = [
  "apps/storybook",
  "apps/hack-cove-site",
  "tools/ui-review",
  "packages/themes-shared",
];

const root = resolve(import.meta.dirname, "..");
const rows: [string, string, number][] = [];

for (const project of PROJECTS) {
  const counts = new Map<string, number>();
  for (const hit of lint([project], root)) counts.set(hit.rule, (counts.get(hit.rule) ?? 0) + 1);
  const sorted = [...counts].toSorted(([a, x], [b, y]) => y - x || a.localeCompare(b));
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  rows.push([project, "**total**", total]);
  for (const [rule, count] of sorted) rows.push([project, `\`${rule}\``, count]);
}

console.log("| Project | Rule | Hits |\n| --- | --- | ---: |");
for (const [project, rule, count] of rows) console.log(`| ${project} | ${rule} | ${count} |`);
