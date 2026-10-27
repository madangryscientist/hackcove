/** A styling attribute written on a Hack Cove component's opening tag. */
export type StylingProp = { component: string; prop: string; line: number };

const STYLING = new Set(["className", "class", "class:list", "style"]);
const IMPORT = /import\s+(?!type\b)(?:[\w$]+\s*,\s*)?\{([^}]*)\}\s*from\s*["']@hackcove\/ui["']/g;
const OPEN_TAG = /<([A-Z][\w$]*)(?=[\s/>])/g;

/** The local names `import { A, B as C } from "@hackcove/ui"` brings in (types are skipped). */
export function importedFromUi(source: string): Set<string> {
  const names = new Set<string>();
  for (const statement of source.matchAll(IMPORT)) {
    for (const entry of (statement[1] ?? "").split(",")) {
      const spec = entry.trim();
      const name = spec.split(/\s+as\s+/).at(-1) ?? "";
      if (!spec.startsWith("type ") && /^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  }
  return names;
}

const isQuote = (char: string | undefined) => char === '"' || char === "'";

/** Index just past the quoted string that starts at `from`; a `\` skips the next character. */
function skipString(source: string, from: number): number {
  const quote = source[from];
  for (let i = from + 1; i < source.length; i += 1) {
    if (source[i] === "\\") i += 1;
    else if (source[i] === quote) return i + 1;
  }
  return source.length;
}

/** One step through template text; returns the next index. `` ` `` closes it, `${` opens code. */
function stepTemplate(source: string, i: number, stack: string[]): number {
  const char = source[i];
  if (char === "\\") return i + 2;
  if (char === "`") stack.pop();
  else if (char === "$" && source[i + 1] === "{") {
    stack.push("{");
    return i + 2;
  }
  return i + 1;
}

/** One step through code inside `{ … }`; returns the next index. */
function stepCode(source: string, i: number, stack: string[]): number {
  const char = source[i];
  if (isQuote(char)) return skipString(source, i);
  if (char === "`" || char === "{") stack.push(char);
  else if (char === "}") stack.pop();
  return i + 1;
}

/**
 * Index just past the `{…}`, quoted string or template literal that starts at `from`. A template
 * literal's `${ … }` is code, so braces and templates nest: an explicit stack of the open ones
 * (`` ` `` for template text, `{` for code) keeps deep nesting off the call stack, and every step
 * moves `i` forward.
 */
function skipValue(source: string, from: number): number {
  const open = source[from];
  if (isQuote(open)) return skipString(source, from);
  if (open !== "{" && open !== "`") return from + 1;
  const stack = [open];
  let i = from + 1;
  while (i < source.length) {
    i = stack.at(-1) === "`" ? stepTemplate(source, i, stack) : stepCode(source, i, stack);
    if (stack.length === 0) return i;
  }
  return source.length;
}

type Attribute = { name: string; at: number; end: number };

/** The attributes of the opening tag whose name ends at `from`, and nothing after its `>`. */
export function attributesOf(source: string, from: number): Attribute[] {
  const found: Attribute[] = [];
  let i = from;
  while (i < source.length && source[i] !== ">") {
    const rest = source.slice(i);
    const name = /^[\w$:-]+/.exec(rest)?.[0];
    if (name !== undefined) {
      found.push({ name, at: i, end: i + name.length });
      i += name.length;
    } else if ((rest[0] === "{" || isQuote(rest[0])) && i > from) {
      i = skipValue(source, i);
    } else i += 1;
  }
  return found;
}

/** Every `className`, `class` or `style` attribute on a component imported from `@hackcove/ui`. */
export function stylingProps(source: string): StylingProp[] {
  const imported = importedFromUi(source);
  const lineAt = (index: number) => source.slice(0, index).split("\n").length;
  return [...source.matchAll(OPEN_TAG)].flatMap((tag) => {
    const component = tag[1] ?? "";
    if (!imported.has(component)) return [];
    const from = (tag.index ?? 0) + tag[0].length;
    return attributesOf(source, from)
      .filter((attribute) => STYLING.has(attribute.name))
      .map((attribute) => ({ component, prop: attribute.name, line: lineAt(attribute.at) }));
  });
}
