import { parseArgs } from "node:util";
import { parseGlobs } from "./glob.js";

export type CommonArgs = {
  base: string;
  head: string;
  hackcove: string;
  globs: string[];
  rest: Record<string, string | boolean | undefined>;
};

/**
 * The flags both entry points share. `--paths` (or the `PATHS` env var, which a workflow input
 * fills) is one glob per line.
 */
export function readArgs(
  argv: readonly string[],
  env: Record<string, string | undefined>,
  extra: Record<string, { type: "string" | "boolean" }> = {},
): CommonArgs {
  const { values } = parseArgs({
    args: [...argv],
    options: {
      base: { type: "string" },
      head: { type: "string", default: "HEAD" },
      hackcove: { type: "string", default: ".hackcove" },
      paths: { type: "string" },
      ...extra,
    },
  });
  const { base, head, hackcove, paths, ...rest } = values;
  if (base === undefined) throw new Error("--base <sha> is required");
  return { base, head, hackcove, globs: parseGlobs(paths ?? env["PATHS"] ?? ""), rest };
}
