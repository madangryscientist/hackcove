/**
 * What `pixelslash builds` said about a project, and the failure an upload reports when it gave no
 * listing. Pure, so `visual-lookup.test.ts` needs no CLI; `visual-remote.ts` runs the CLI for it.
 */

/**
 * What `pixelslash builds` said about a project. Its exit code tells a missing project from a
 * server that did not answer: 2 is the CLI's usage error, which is how an unknown project, or one
 * the token cannot see, comes back (no other flag this script passes can cause one, so any other
 * exit 2 is a bug here and its line shows it); 3 is a remote error, whose line ends
 * `-> <status> <detail>` or reads `cannot fetch <url>: ...`. Any other non-zero exit is a failure
 * too. `line` is the CLI's own first line on stderr.
 */
export type LookupResult =
  | { kind: "ok"; listing: unknown }
  | { kind: "missing"; line: string }
  | { kind: "failed"; line: string };

/** The `LookupResult` for one `pixelslash builds --json` run, from its exit code and output. */
export function lookupResult(exitCode: number, stdout: string, stderr: string): LookupResult {
  if (exitCode === 0) return { kind: "ok", listing: JSON.parse(stdout) };
  const line =
    stderr
      .split("\n")
      .map((each) => each.trim())
      .find((each) => each !== "") ?? `pixelslash builds exited ${exitCode} and printed nothing`;
  return { kind: exitCode === 2 ? "missing" : "failed", line };
}

/** A lookup that gave no listing: the project and what the CLI said. */
export type LookupMiss = { project: string; result: Exclude<LookupResult, { kind: "ok" }> };

const UNAUTHORIZED = / -> 401\b/;

/**
 * Why the lookups failed, one line per kind: the server not answering first, since that hides
 * whether the other projects exist, then a token it refused, then the projects it does not have.
 * Each names its projects with the CLI's line. `undefined` when there is nothing to report.
 */
export function lookupFailure(misses: LookupMiss[]): string | undefined {
  const named = (keep: (miss: LookupMiss) => boolean) =>
    misses
      .filter(keep)
      .map(({ project, result }) => `${project} (pixelslash: ${result.line})`)
      .join(", ");
  const isFailed = ({ result }: LookupMiss) => result.kind === "failed";
  const down = named((miss) => isFailed(miss) && !UNAUTHORIZED.test(miss.result.line));
  const refused = named((miss) => isFailed(miss) && UNAUTHORIZED.test(miss.result.line));
  const missing = named((miss) => !isFailed(miss));
  const lines: string[] = [];
  if (down !== "")
    lines.push(
      `PixelSlash did not answer for ${down}. This is a PixelSlash failure, not a missing ` +
        "project, so do not create it: report it to the PixelSlash architect with this output",
    );
  if (refused !== "")
    lines.push(
      `PixelSlash refused the token for ${refused}: it is missing, wrong, expired or revoked ` +
        "and needs reissuing (an org token, psorg_, or a personal one, psu_); do not create the project",
    );
  if (missing !== "")
    lines.push(
      `the server has no PixelSlash project ${missing} (or the token cannot see it); ` +
        "create each with `pixelslash project create <name>` and re-run",
    );
  return lines.length > 0 ? lines.join("\n") : undefined;
}
