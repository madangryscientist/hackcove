import { themeScope } from "./scope.js";

/** Property to value, as a theme's rule declares them. */
export type Declarations = Record<string, string>;

const stripComments = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Split a selector list on the commas that are not inside `:is(…)`, `:has(…)` and the like. */
function selectorsOf(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of list) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += char;
  }
  return [...parts, current.trim()].filter(Boolean);
}

function declarationsOf(body: string): Declarations {
  const declarations: Declarations = {};
  for (const declaration of body.split(";")) {
    const colon = declaration.indexOf(":");
    if (colon < 0) continue;
    declarations[declaration.slice(0, colon).trim().toLowerCase()] = declaration
      .slice(colon + 1)
      .replace(/\s+/g, " ")
      .trim();
  }
  return declarations;
}

/** A class name as a selector writes it, with its escapes undone (`hover\\:bg-x` reads `hover:bg-x`). */
const unescapeClass = (name: string): string => name.replace(/\\(.)/g, "$1");

/**
 * Record one selector's declarations: `.<scope> .<tint> .<utility>` as the utility drawn on that tint
 * (keyed `<tint> <utility>`, tints only), and `.<scope> .<utility>[:state]` as the utility itself.
 */
function recordSelector(
  utilities: Map<string, Declarations>,
  selector: string,
  declarations: Declarations,
  patterns: { within: RegExp; plain: RegExp },
): void {
  const inside = patterns.within.exec(selector);
  let key: string | undefined;
  if (inside) {
    const tint = unescapeClass(inside[1] ?? "");
    if (tint.startsWith("bg-")) key = `${tint} ${unescapeClass(inside[2] ?? "")}`;
  } else {
    key = unescapeClass(patterns.plain.exec(selector)?.[1] ?? "") || undefined;
  }
  if (key === undefined) return;
  utilities.set(key, { ...utilities.get(key), ...declarations });
}

/**
 * What a theme's CSS says each utility is under its scope class: `.<scope> .<utility>[:state]` rules
 * keyed by the utility's class name as a component writes it (`hover:bg-violet-700`, with Tailwind's
 * escapes undone). Takes the CSS text, never a path, so a theme can be read from several files.
 * Minified CSS reads the same as the source. A later rule for the same utility wins per property.
 */
export function utilitiesOf(css: string): Map<string, Declarations> {
  const scope = themeScope(css);
  const utilities = new Map<string, Declarations>();
  if (scope === undefined) return utilities;
  const rules = stripComments(css).replace(/@[^;{}]*;/g, "");
  const patterns = {
    within: new RegExp(`^\\.${scope}\\s+\\.((?:\\\\.|[\\w-])+)\\s+\\.((?:\\\\.|[\\w-])+)$`),
    plain: new RegExp(`^\\.${scope}\\s+\\.((?:\\\\.|[\\w-])+)`),
  };
  for (const [, list = "", body = ""] of rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const declarations = declarationsOf(body);
    for (const selector of selectorsOf(list))
      recordSelector(utilities, selector, declarations, patterns);
  }
  return utilities;
}
