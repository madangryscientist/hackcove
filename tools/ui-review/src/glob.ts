const SIMPLE: Record<string, string> = {
  "**/": "(?:.*/)?",
  "**": ".*",
  "*": "[^/]*",
  "?": "[^/]",
};
const TOKEN = /\*\*\/|\*\*|\*|\?|\{|\}|,|[.+^$()|[\]\\]/g;

/** `**`, `*`, `?` and `{a,b}`; a path is matched whole, from the repo root. */
export function globToRegExp(glob: string): RegExp {
  let depth = 0;
  const body = glob.replace(TOKEN, (token) => {
    if (token === "{") depth += 1;
    if (token === "}") depth = Math.max(0, depth - 1);
    if (token === "{") return "(?:";
    if (token === "}") return ")";
    if (token === ",") return depth > 0 ? "|" : ",";
    return SIMPLE[token] ?? `\\${token}`;
  });
  return new RegExp(`^${body}$`);
}

/** One glob per line; blank lines are skipped, a leading `!` excludes. */
export function parseGlobs(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

/** The paths some include glob matches (all of them when there is none) and no exclude glob does. */
export function selectPaths(paths: readonly string[], globs: readonly string[]): string[] {
  const include = globs.filter((g) => !g.startsWith("!")).map(globToRegExp);
  const exclude = globs.filter((g) => g.startsWith("!")).map((g) => globToRegExp(g.slice(1)));
  return paths.filter(
    (path) =>
      (include.length === 0 || include.some((re) => re.test(path))) &&
      !exclude.some((re) => re.test(path)),
  );
}
