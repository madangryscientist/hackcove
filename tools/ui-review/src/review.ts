/**
 * Layer 2: an advisory model review of the pull request's UI, from the library's own rubric
 * (AGENTS.md `## Purpose` plus the generated `/ui/llms.txt`). It never fails the pull request: a
 * missing key, a model error or a GitHub error is a warning and exit 0.
 *
 *   bun tools/ui-review/src/review.ts --base <sha> --llms <llms.txt> [--pr N --repo owner/name] [--dry-run]
 *
 * `--dry-run` prints the command and the prompt it would send, and sends nothing. Otherwise it
 * needs `OPENCODE_API_KEY`, and `GITHUB_TOKEN` to comment.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readArgs } from "./args.js";
import { onlyFiles, parseDiff, type FileDiff } from "./diff.js";
import { bodyOf, parseReply, place } from "./findings.js";
import { selectPaths } from "./glob.js";
import { post } from "./github.js";
import { DEFAULT_PATHS, gitDiff } from "./layer1.js";
import { ask, commandFor } from "./opencode.js";
import { buildPrompt, purposeOf } from "./prompt.js";

const say = (text: string) => process.stdout.write(`${text}\n`);

type Job = {
  changed: FileDiff[];
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
  return {
    changed: files.filter((file) => kept.has(file.path)),
    prompt: buildPrompt({
      purpose: purposeOf(readFileSync(join(hackcove, "AGENTS.md"), "utf8")),
      reference: readFileSync(llms, "utf8"),
      diff: onlyFiles(diff, kept),
    }),
    dryRun: rest["dry-run"] === true,
    target: Number.isInteger(pr) && typeof repo === "string" ? { repo, pr } : undefined,
  };
}

async function run(): Promise<void> {
  const { changed, prompt, dryRun, target } = plan();
  if (dryRun) {
    say(
      `${commandFor("<prompt file>").join(" ")}\n\n----- prompt (${prompt.length} chars) -----\n${prompt}`,
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
  const findings = parseReply(await ask(prompt, apiKey));
  for (const f of findings) say(`${f.path}:${f.line} [${f.kind}] ${bodyOf(f)}`);
  const token = process.env["GITHUB_TOKEN"] ?? "";
  if (target === undefined || token === "") {
    say("No pull request to comment on (--pr, --repo, GITHUB_TOKEN); printed only.");
    return;
  }
  await post({ ...target, token }, place(findings, changed), findings.length);
}

run().then(
  () => process.exit(0),
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    say(
      `::warning title=Hack Cove UI review::the model review did not run: ${message.replaceAll("\n", " ")}`,
    );
    process.exit(0);
  },
);
