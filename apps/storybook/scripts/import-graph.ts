/**
 * The import graph the visual plan reads: which repo files a story file reaches through its static
 * imports, following `@hackcove/ui-react` through its barrel to the module that exports each name.
 */
import { posix } from "node:path";

/** A file's text, or `undefined` for no such file: everything the graph reads goes through this. */
export type Reader = (path: string) => string | undefined;

const UI_BARREL = "packages/ui-react/src/index.ts";

// `import x, { a, type b } from "s"` and `export { a } from "s"`: the clause is names, braces,
// commas and `* as`, so a match never runs across code.
const FROM = /\b(import|export)\s+(type\s+)?([\w$\s,{}*]*?)\s*from\s*["']([^"']+)["']/g;
const BARE = /\bimport\s*["']([^"']+)["']/g;
const DYNAMIC = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

type Edge = { spec: string; names: string[] | "all" };

/** The value names a clause brings in (`type` ones dropped), or "all" for a namespace or default. */
function namesOf(clause: string): string[] | "all" {
  if (clause.includes("*")) return "all";
  const braced = /\{([^}]*)\}/.exec(clause)?.[1];
  const outside = clause
    .replace(/\{[^}]*\}/, "")
    .replaceAll(",", " ")
    .trim();
  if (outside !== "") return "all";
  return (braced ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "" && !part.startsWith("type "))
    .map((part) => part.split(/\s+as\s+/)[0]?.trim() ?? part);
}

/** `import`/`export … from` edges that bring in a value: a `type`-only one brings in none. */
function fromEdges(source: string): Edge[] {
  return [...source.matchAll(FROM)].flatMap(([, , type, clause = "", spec = ""]) => {
    const names = type === undefined ? namesOf(clause) : [];
    return names === "all" || names.length > 0 ? [{ spec, names }] : [];
  });
}

export function importsOf(source: string): Edge[] {
  const whole = (regex: RegExp) =>
    [...source.matchAll(regex)].map(([, spec = ""]): Edge => ({ spec, names: "all" }));
  return [...fromEdges(source), ...whole(BARE), ...whole(DYNAMIC)];
}

/** A relative specifier as a repo file: `./ui.js` is `ui.tsx` or `ui.ts`, `./x` may be `x/index.ts`. */
function resolveRelative(from: string, spec: string, read: Reader): string | undefined {
  const base = posix.join(posix.dirname(from), spec);
  const stem = base.replace(/\.js$/, "");
  const tries = [base, `${stem}.ts`, `${stem}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
  return tries.find((path) => read(path) !== undefined);
}

/** `export { A, type B } from "./X.js"` in the ui barrel: each value name's module. */
export function barrelOf(read: Reader): Map<string, string> {
  const modules = new Map<string, string>();
  const source = read(UI_BARREL) ?? "";
  for (const [, kind, type, clause = "", spec = ""] of source.matchAll(FROM)) {
    if (kind !== "export" || type !== undefined) continue;
    const path = resolveRelative(UI_BARREL, spec, read);
    const names = namesOf(clause);
    if (path === undefined || names === "all") continue;
    for (const name of names) modules.set(name, path);
  }
  return modules;
}

/** The repo files one import of `from` reaches directly. */
function targetsOf(from: string, edge: Edge, read: Reader, barrel: Map<string, string>) {
  if (edge.spec.startsWith(".")) return [resolveRelative(from, edge.spec, read)];
  // Any other package is the lockfile's, which is shared ground.
  if (edge.spec !== "@hackcove/ui-react") return [];
  const modules =
    edge.names === "all" ? [...barrel.values()] : edge.names.map((n) => barrel.get(n));
  return [UI_BARREL, ...modules];
}

/** Every repo file `entry` reaches through its imports, itself included. */
export function closureOf(entry: string, read: Reader, barrel: Map<string, string>): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const path = queue.pop();
    if (path === undefined || seen.has(path)) continue;
    seen.add(path);
    const source = read(path);
    // The barrel is in the closure (a change to it reaches every importer) but its own exports are
    // not followed: an import reaches only the modules of the names it takes.
    if (source === undefined || path === UI_BARREL || !/\.(ts|tsx)$/.test(path)) continue;
    const next = importsOf(source).flatMap((edge) => targetsOf(path, edge, read, barrel));
    for (const target of next) if (target !== undefined && !seen.has(target)) queue.push(target);
  }
  return seen;
}
