import { appendFileSync } from "node:fs";

const TITLE = "Hack Cove UI review";

/** Appends a section to `$GITHUB_STEP_SUMMARY` (when set): what a green review did not cover. */
export function noteInSummary(
  lines: readonly string[],
  env: Record<string, string | undefined>,
): void {
  const file = env["GITHUB_STEP_SUMMARY"];
  if (file !== undefined && file !== "")
    appendFileSync(file, `## ${TITLE}\n\n${lines.join("\n")}\n`);
}

/** True when the model provider refused the run because the account has run out of credits. */
export function isOutOfCredits(reason: string): boolean {
  return /insufficient (account )?(funds|credits?|balance)|credit balance is too low/i.test(reason);
}

/**
 * Records that the model review was skipped for lack of credits: a step summary and the `::warning`
 * annotation to print. The review is an optional extra, so the caller exits 0.
 */
export function outOfCredits(env: Record<string, string | undefined>): string {
  noteInSummary(["**The model review was skipped**: the model account is out of credits."], env);
  return `::warning title=${TITLE}::the model review was skipped: the model account is out of credits`;
}

/**
 * Records that the model review did not run: appends a short section to `$GITHUB_STEP_SUMMARY`
 * (when set) and returns the `::error` annotation to print. The caller exits 1, so a review that
 * never happened is red instead of green.
 */
export function didNotRun(reason: string, env: Record<string, string | undefined>): string {
  const oneLine = reason.replaceAll(/\s+/g, " ").trim();
  const file = env["GITHUB_STEP_SUMMARY"];
  if (file !== undefined && file !== "")
    appendFileSync(
      file,
      `## ${TITLE}\n\n**The model review did not run**, so this pull request has not been reviewed.\n\nReason: ${oneLine}\n`,
    );
  return `::error title=${TITLE}::the model review did not run: ${oneLine.replaceAll("%", "%25")}`;
}
