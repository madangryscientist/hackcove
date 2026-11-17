import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { type Options, transform } from "./transform.js";

// bun tools/codemod/src/run.ts <src dir> [--unpin] [--write]
// Rewrites an app's @hackcove/ui-react 0.10 code for 0.11. A dry run by default: it prints the files
// it would change and a file:line for every swap a person has to make. --write saves the changes.
// --unpin runs only the second step instead: it drops the pins the 0.11 pass wrote, where the new
// default means the same (packages/ui-react/MIGRATING.md, "0.11 to 0.12: drop the pins").

const FLAGS = new Set(["--write", "--unpin"]);
const SKIP = new Set(["node_modules", "dist", ".git"]);

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    if (SKIP.has(name)) return [];
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(tsx|ts|jsx|js)$/.test(name) && !name.endsWith(".d.ts") ? [path] : [];
  });
}

/** One file's rewrite, or why a rule tripped on it, so one odd file does not stop the run. */
function attempt(
  source: string,
  path: string,
  options: Options,
): ReturnType<typeof transform> | string {
  try {
    return transform(source, path, options);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/** The folder and flags, or undefined after printing the usage. */
function parseArgs(
  args: readonly string[],
): { dir: string; write: boolean; options: Options } | undefined {
  const dir = args.find((arg) => !arg.startsWith("--"));
  const unknown = args.filter((arg) => arg.startsWith("--") && !FLAGS.has(arg));
  // A mistyped --unpin would otherwise run the 0.11 pass and write every pin back.
  if (unknown.length > 0) process.stderr.write(`unknown flag: ${unknown.join(" ")}\n`);
  if (dir === undefined || unknown.length > 0) {
    process.stderr.write("usage: bun tools/codemod/src/run.ts <src dir> [--unpin] [--write]\n");
    return undefined;
  }
  const options: Options = { step: args.includes("--unpin") ? "unpin" : "0.11" };
  return { dir, write: args.includes("--write"), options };
}

function main(args: readonly string[]): number {
  const parsed = parseArgs(args);
  if (parsed === undefined) return 2;
  const { dir, write, options } = parsed;
  let changed = 0;
  let reported = 0;
  for (const path of filesUnder(dir)) {
    const source = readFileSync(path, "utf8");
    const name = relative(process.cwd(), path);
    const result = attempt(source, path, options);
    if (typeof result === "string") {
      process.stdout.write(
        `${name}:1: the codemod could not rewrite this file (${result}): do it by hand\n`,
      );
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
