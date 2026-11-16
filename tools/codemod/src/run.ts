import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { transform } from "./transform.js";

// bun tools/codemod/src/run.ts <src dir> [--write]
// Rewrites an app's @hackcove/ui-react 0.10 code for 0.11. A dry run by default: it prints the files
// it would change and a file:line for every swap a person has to make. --write saves the changes.

const SKIP = new Set(["node_modules", "dist", ".git"]);

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(tsx|ts|jsx|js)$/.test(name) && !name.endsWith(".d.ts") ? [path] : [];
  });
}

/** One file's rewrite, or undefined when a rule trips on it, so one odd file does not stop the run. */
function attempt(source: string, path: string): ReturnType<typeof transform> | undefined {
  try {
    return transform(source, path);
  } catch {
    return undefined;
  }
}

function main(args: readonly string[]): number {
  const dir = args.find((arg) => !arg.startsWith("--"));
  if (dir === undefined) {
    process.stderr.write("usage: bun tools/codemod/src/run.ts <src dir> [--write]\n");
    return 2;
  }
  const write = args.includes("--write");
  let changed = 0;
  let reported = 0;
  for (const path of filesUnder(dir)) {
    const source = readFileSync(path, "utf8");
    const name = relative(process.cwd(), path);
    const result = attempt(source, path);
    if (result === undefined) {
      process.stdout.write(`${name}:1: the codemod could not rewrite this file: do it by hand\n`);
      reported += 1;
      continue;
    }
    const { output, reports } = result;
    if (output !== source) {
      changed += 1;
      if (write) writeFileSync(path, output);
      process.stdout.write(`${write ? "rewrote" : "would rewrite"} ${name}\n`);
    }
    for (const line of reports) process.stdout.write(`${name}:${line.line}: ${line.message}\n`);
    reported += reports.length;
  }
  const done = write ? "rewritten" : "to rewrite";
  process.stdout.write(`${changed} files ${done}, ${reported} lines to check by hand
`);
  return 0;
}

process.exitCode = main(process.argv.slice(2));
