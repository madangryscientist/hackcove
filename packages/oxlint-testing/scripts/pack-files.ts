/**
 * Pack check: the published tarball holds the plugin, the config, the README, the licence and the
 * manifest, and nothing else (no fixtures, tests or scripts). Reads the JSON report
 * `npm pack --dry-run --json --ignore-scripts` writes, on stdin, as `themes/scripts/pack-files.ts`
 * does. A path that would ship and should not, or one that should ship and would not, fails here
 * by name.
 */
import { readFileSync } from "node:fs";

type Report = { files?: { path: string }[] };

const raw = readFileSync(0, "utf8");
const [report] = Object.values<Report>(JSON.parse(raw));

if (!report?.files) {
  throw new Error(`npm pack --dry-run --json printed no file list:\n${raw}`);
}

const packed = report.files.map((file) => file.path).toSorted();
const expected = [".oxlintrc.json", "LICENSE", "README.md", "package.json", "plugin.js"];

const listed = new Set(packed);
const expectedSet = new Set(expected);
const wrong = [
  ...packed.filter((path) => !expectedSet.has(path)).map((path) => `would ship: ${path}`),
  ...expected.filter((path) => !listed.has(path)).map((path) => `missing: ${path}`),
];

if (wrong.length > 0) {
  throw new Error(`npm pack would publish the wrong files\n${wrong.join("\n")}`);
}

process.stdout.write(`pack-files: ok (${packed.join(", ")})\n`);
