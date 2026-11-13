/**
 * Pack check: the published tarball holds every theme, the manifest, the README and both licences,
 * and nothing else. Reads the JSON report `npm pack --dry-run --json --ignore-scripts` writes, on
 * stdin, so it spawns nothing and runs on no wall clock. It used to run inside a vitest test, where
 * the gate's parallel load stretched the npm process start past vitest's 5 s test timeout.
 *
 * Reads npm's JSON as an array, or as the object keyed by package that npm 12 writes. Run by
 * `pack-check`; a path that would ship and should not, or one that should ship and would not, fails
 * here by name.
 */
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

type Report = { files?: { path: string }[] };

const dir = resolve(import.meta.dirname, "..");
const raw = readFileSync(0, "utf8");
const [report] = Object.values<Report>(JSON.parse(raw));

// npm reports an error of its own as JSON too, with no file list; print that instead of "missing".
if (!report?.files) {
  throw new Error(`npm pack --dry-run --json printed no file list:\n${raw}`);
}

const packed = report.files.map((file) => file.path).toSorted();

// The scope glob `*.css` picks up a theme without naming it, so a new theme needs no edit here.
const expected = [
  ...readdirSync(dir).filter((file) => file.endsWith(".css")),
  "LICENSE",
  "NOTICE",
  "README.md",
  "package.json",
];

const listed = new Set(packed);
const expectedSet = new Set(expected);
const wrong = [
  ...packed.filter((path) => !expectedSet.has(path)).map((path) => `would ship: ${path}`),
  ...expected.filter((path) => !listed.has(path)).map((path) => `missing: ${path}`),
];

if (wrong.length > 0) {
  throw new Error(`npm pack would publish the wrong files\n${wrong.join("\n")}`);
}

process.stdout.write(`pack-files: ok (${packed.length} files, every theme and nothing else)\n`);
