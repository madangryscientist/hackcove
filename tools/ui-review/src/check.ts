/**
 * Layer 1: the hard rules, no model. Reads the pull request's diff and fails, with a file:line
 * annotation each, on anything an app must never do (see `rules.ts`).
 *
 *   bun tools/ui-review/src/check.ts --base <sha> [--head HEAD] [--hackcove .hackcove] [--paths "<globs>"]
 *
 * Exit 0 clean, 1 findings, 2 could not run.
 */
import { appendFileSync } from "node:fs";
import { readArgs } from "./args.js";
import { loadContext } from "./context.js";
import { annotation, summary } from "./format.js";
import { checkChange } from "./layer1.js";

function main(): number {
  try {
    const { base, head, hackcove, globs } = readArgs(process.argv.slice(2), process.env);
    const findings = checkChange({
      cwd: process.cwd(),
      base,
      head,
      globs,
      ctx: loadContext(hackcove),
    });
    for (const finding of findings) process.stdout.write(`${annotation(finding)}\n`);
    const file = process.env["GITHUB_STEP_SUMMARY"];
    if (file !== undefined && file !== "") appendFileSync(file, summary(findings));
    process.stdout.write(
      findings.length === 0
        ? "Hack Cove UI check: clean.\n"
        : `Hack Cove UI check: ${findings.length} violation(s).\n`,
    );
    return findings.length === 0 ? 0 : 1;
  } catch (error) {
    process.stderr.write(
      `ui-review check: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    return 2;
  }
}

process.exit(main());
