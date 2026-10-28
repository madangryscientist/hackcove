import { appendFileSync } from "node:fs";

const TITLE = "Hack Cove UI review";

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
