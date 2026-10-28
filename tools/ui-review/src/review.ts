/**
 * Layer 2: an advisory model review of the pull request's UI, from the library's own rubric
 * (AGENTS.md `## Purpose` plus the generated `/ui/llms.txt`). The findings are advisory and never
 * fail the pull request. A review that did not happen does: a model crash, an unparsable reply, a
 * timeout or a GitHub error is an `::error` annotation, a step summary and exit 1. Skipping for
 * no key, no app files, or `--dry-run` is a success.
 *
 *   bun tools/ui-review/src/review.ts --base <sha> --llms <llms.txt> [--pr N --repo owner/name] [--dry-run]
 *
 * `--dry-run` prints the command and the prompt it would send, and sends nothing. Otherwise it
 * needs `OPENCODE_API_KEY`, and `GITHUB_TOKEN` to comment.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readArgs } from "./args.js";
import { fitDiff, leftLines, type Left } from "./budget.js";
import { onlyFiles, parseDiff, type FileDiff } from "./diff.js";
import { bodyOf, parseReply, place, type ModelFinding } from "./findings.js";
import { selectPaths } from "./glob.js";
import { post } from "./github.js";
import { DEFAULT_PATHS, gitDiff } from "./layer1.js";
import { didNotRun, noteInSummary } from "./failure.js";
import { ask, commandFor } from "./opencode.js";
import { buildPrompt, purposeOf } from "./prompt.js";

const say = (text: string) => process.stdout.write(`${text}\n`);

type Job = {
  changed: FileDiff[];
  /** What the prompt leaves out on purpose, and the prompt itself. */
  left: Left[];
  prompt: string;
  dryRun: boolean;
  target: { repo: string; pr: number } | undefined;
};

function plan(): Job {
  const { base, head, hackcove, globs, rest } = readArgs(process.argv.slice(2), process.env, {
    llms: { type: "string" },
    pr: { type: "string" },
    repo: { type: "string" },
    "dry-run": { type: "boolean" },
  });
  const llms = rest["llms"];
  if (typeof llms !== "string") throw new Error("--llms <path to llms.txt> is required");
  const diff = gitDiff(process.cwd(), base, head, 3);
  const files = parseDiff(diff);
  const kept = new Set(
    selectPaths(
      files.map((file) => file.path),
      globs.length === 0 ? DEFAULT_PATHS : globs,
    ),
  );
  const pr = Number(rest["pr"]);
  const repo = rest["repo"];
  const fitted = fitDiff(onlyFiles(diff, kept));
  return {
    changed: files.filter((file) => kept.has(file.path)),
    left: fitted.left,
    prompt: buildPrompt({
      purpose: purposeOf(readFileSync(join(hackcove, "AGENTS.md"), "utf8")),
      reference: readFileSync(llms, "utf8"),
      diff: fitted.diff,
      left: fitted.left.length,
    }),
    dryRun: rest["dry-run"] === true,
    target: Number.isInteger(pr) && typeof repo === "string" ? { repo, pr } : undefined,
  };
}

/** Says, in the log and the step summary, how many files the model was not sent. */
function announce(count: number, notReviewed: readonly string[]): void {
  if (count === 0) return;
  say(`::notice title=Hack Cove UI review::${count} file(s) were left out of the model review.`);
  noteInSummary(notReviewed, process.env);
}

/** The model's findings, timed and printed. Rejects when the run fails or the reply cannot be parsed. */
async function askModel(prompt: string, apiKey: string): Promise<ModelFinding[]> {
  const started = Date.now();
  const findings = parseReply(await ask(prompt, apiKey));
  const seconds = Math.round((Date.now() - started) / 1000);
  say(`The model replied in ${seconds} s with ${findings.length} finding(s).`);
  for (const f of findings) say(`${f.path}:${f.line} [${f.kind}] ${bodyOf(f)}`);
  return findings;
}

async function run(): Promise<void> {
  const { changed, left, prompt, dryRun, target } = plan();
  const notReviewed = leftLines(left);
  if (dryRun) {
    say(
      `${commandFor().join(" ")} < prompt\n\n${notReviewed.join("\n")}\n\n----- prompt (${prompt.length} chars) -----\n${prompt}`,
    );
    return;
  }
  if (changed.length === 0) {
    say("No app files changed; nothing to review.");
    return;
  }
  const apiKey = process.env["OPENCODE_API_KEY"] ?? "";
  if (apiKey === "") {
    say(
      "::notice title=Hack Cove UI review::OPENCODE_API_KEY is not set; the model review is skipped.",
    );
    return;
  }
  announce(left.length, notReviewed);
  if (left.length === changed.length) {
    say("Every changed file was left out of the model review; nothing was sent.");
    return;
  }
  const findings = await askModel(prompt, apiKey);
  const token = process.env["GITHUB_TOKEN"] ?? "";
  if (target === undefined || token === "") {
    say("No pull request to comment on (--pr, --repo, GITHUB_TOKEN); printed only.");
    return;
  }
  await post({ ...target, token }, place(findings, changed), findings.length, notReviewed);
}

run().then(
  () => process.exit(0),
  (error: unknown) => {
    say(didNotRun(error instanceof Error ? error.message : String(error), process.env));
    process.exit(1);
  },
);
