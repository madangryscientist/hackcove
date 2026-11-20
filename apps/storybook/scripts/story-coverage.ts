/**
 * Which values of a component's look props the stories render, read from each story file's parsed
 * syntax tree. `story-coverage.test.ts` checks every member of every `size`, `tone`, `variant` and
 * `width` union in the generated prop docs, and `disabled`, against what this finds.
 */
import { parseAst } from "vite";
import { COVERED_PROPS, LOOK_PROPS, type Member } from "./look-props.js";
import { isRecord } from "./visual-index.js";

/** A value a story renders on `<Component prop=…>`: the string form of a literal, or `true`. */
type Seen = Member;
/** An attribute the extractor could not resolve to literals. It covers nothing. */
export type Unresolved = { component: string; prop: string; file: string; line: number };

type Node = Record<string, unknown>;

const typeOf = (node: unknown): string | undefined =>
  isRecord(node) && typeof node["type"] === "string" ? node["type"] : undefined;

/** A child node, or `undefined` when the key holds none. */
const child = (node: unknown, key: string): Node | undefined => {
  const value = isRecord(node) ? node[key] : undefined;
  return isRecord(value) ? value : undefined;
};

/** A list of children; empty when the key holds no list. Holes are kept as `null`. */
const children = (node: unknown, key: string): unknown[] => {
  const value = isRecord(node) ? node[key] : undefined;
  return Array.isArray(value) ? value : [];
};

const text = (node: unknown, key: string): string | undefined => {
  const value = isRecord(node) ? node[key] : undefined;
  return typeof value === "string" ? value : undefined;
};

/** The name of an identifier node (`size`, `Row`), or `undefined`. */
const nameOf = (node: unknown): string | undefined => text(node, "name");

const WRAPPERS = [
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "ParenthesizedExpression",
];

/** `x as const`, `x satisfies T`, `(x)` and `x!` are the value `x`. */
function unwrap(node: unknown): unknown {
  let current = node;
  while (WRAPPERS.includes(typeOf(current) ?? "")) current = child(current, "expression");
  return current;
}

const isUndefined = (node: unknown) =>
  typeOf(node) === "Identifier" && nameOf(node) === "undefined";

/** A template literal with no `${}`: its text. */
function plainTemplate(node: unknown): string | undefined {
  const quasis = children(node, "quasis");
  return quasis.length === 1 ? text(child(quasis[0], "value"), "cooked") : undefined;
}

/** A literal's value as a string (`"sm"`, `true`), `null` for `undefined`, else unresolved. */
function literal(node: unknown): string | null | undefined {
  const value = unwrap(node);
  if (isUndefined(value)) return null;
  if (typeOf(value) === "TemplateLiteral") return plainTemplate(value);
  if (typeOf(value) !== "Literal" || !isRecord(value)) return undefined;
  const v = value["value"];
  if (typeof v === "string") return v;
  return typeof v === "boolean" ? String(v) : undefined;
}

/** Literal values, `undefined` entries dropped; `undefined` when any entry is not a literal. */
function literals(nodes: unknown[]): string[] | undefined {
  const out: string[] = [];
  for (const node of nodes) {
    const value = literal(node);
    if (value === undefined) return undefined;
    if (value !== null) out.push(value);
  }
  return out;
}

const lineOf = (source: string, offset: number) => source.slice(0, offset).split("\n").length;

const startOf = (node: unknown): number => {
  const start = isRecord(node) ? node["start"] : undefined;
  return typeof start === "number" ? start : 0;
};

/** Every node in the tree, depth first. */
function* nodesOf(node: unknown): Generator<Node> {
  if (Array.isArray(node)) {
    for (const item of node) yield* nodesOf(item);
  } else if (isRecord(node)) {
    yield node;
    for (const value of Object.values(node)) yield* nodesOf(value);
  }
}

/**
 * Every `const name = <array literal>` in the file, by name. A name declared more than once in the
 * file (in two functions, say) is left out, so its uses stay unresolved rather than read off the
 * wrong array.
 */
function constArrays(root: unknown): Map<string, unknown[]> {
  const arrays = new Map<string, unknown[]>();
  const declared = new Map<string, number>();
  for (const node of nodesOf(root)) {
    if (typeOf(node) !== "VariableDeclarator") continue;
    const name = nameOf(child(node, "id"));
    const init = unwrap(child(node, "init"));
    if (name === undefined) continue;
    declared.set(name, (declared.get(name) ?? 0) + 1);
    if (typeOf(init) === "ArrayExpression") arrays.set(name, children(init, "elements"));
  }
  for (const [name, count] of declared) if (count > 1) arrays.delete(name);
  return arrays;
}

const FUNCTIONS = ["ArrowFunctionExpression", "FunctionExpression", "FunctionDeclaration"];

const paramNames = (fn: unknown): string[] =>
  children(fn, "params").flatMap((p) => {
    const name = typeOf(p) === "Identifier" ? nameOf(p) : undefined;
    return name === undefined ? [] : [name];
  });

/** `<array literal or same-file const array>.map`: the array, else `undefined`. */
function mapSource(callee: unknown, arrays: Map<string, unknown[]>): unknown[] | undefined {
  if (typeOf(callee) !== "MemberExpression" || (isRecord(callee) && callee["computed"] === true))
    return undefined;
  if (nameOf(child(callee, "property")) !== "map") return undefined;
  const source = unwrap(child(callee, "object"));
  if (typeOf(source) === "ArrayExpression") return children(source, "elements");
  const name = typeOf(source) === "Identifier" ? nameOf(source) : undefined;
  return name === undefined ? undefined : arrays.get(name);
}

/**
 * The array a `.map` callback's parameter runs over: `fn` is the callback, `call` its parent.
 * `undefined` when `call` is not `<array literal or same-file const array>.map(fn)`.
 */
function mappedArray(
  fn: Node,
  call: unknown,
  arrays: Map<string, unknown[]>,
): unknown[] | undefined {
  if (typeOf(call) !== "CallExpression" || children(call, "arguments")[0] !== fn) return undefined;
  return mapSource(child(call, "callee"), arrays);
}

type Binding =
  | { kind: "array"; array: unknown[] }
  | { kind: "prop"; component: string; prop: string };

/** The name a same-file component function goes by: `function Row(` or `const Row = (`. */
function componentName(fn: Node, parent: unknown): string | undefined {
  const own = typeOf(fn) === "FunctionDeclaration" ? nameOf(child(fn, "id")) : undefined;
  const declared =
    typeOf(parent) === "VariableDeclarator" ? nameOf(child(parent, "id")) : undefined;
  const named = own ?? declared;
  return named !== undefined && /^[A-Z]/.test(named) ? named : undefined;
}

/** The prop a component's destructured first parameter binds to `name`: `function Row({ size })`. */
function destructuredProp(fn: Node, name: string): string | undefined {
  const first = children(fn, "params")[0];
  if (typeOf(first) !== "ObjectPattern") return undefined;
  for (const p of children(first, "properties")) {
    if (typeOf(p) !== "Property") continue;
    const value = child(p, "value");
    const bound = typeOf(value) === "AssignmentPattern" ? child(value, "left") : value;
    if (nameOf(bound) === name) return nameOf(child(p, "key"));
  }
  return undefined;
}

/** What one function binds `name` to, if it binds it at all. */
function bindingIn(
  fn: Node,
  parent: unknown,
  name: string,
  arrays: Map<string, unknown[]>,
): Binding | "unbound" | undefined {
  if (paramNames(fn).includes(name)) {
    const array = mappedArray(fn, parent, arrays);
    return array === undefined ? undefined : { kind: "array", array };
  }
  const prop = destructuredProp(fn, name);
  if (prop === undefined) return "unbound";
  const component = componentName(fn, parent);
  return component === undefined ? undefined : { kind: "prop", component, prop };
}

/**
 * What the identifier `name` is bound to by the nearest function that binds it: the array of a
 * `.map` callback over an array literal or a same-file const array, or a prop of a same-file
 * component (`function Row({ size })`). `ancestors` ends at the attribute.
 */
function bindingOf(
  name: string,
  ancestors: unknown[],
  arrays: Map<string, unknown[]>,
): Binding | undefined {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];
    if (!isRecord(node) || !FUNCTIONS.includes(typeOf(node) ?? "")) continue;
    const binding = bindingIn(node, ancestors[i - 1], name, arrays);
    if (binding !== "unbound") return binding;
  }
  return undefined;
}

/** A file's const arrays and every JSX tag in it, with the nodes above each. */
type FileIndex = {
  arrays: Map<string, unknown[]>;
  tags: { tag: string; node: Node; ancestors: unknown[] }[];
};

/** A JSX attribute's name, or `undefined` for a spread or a namespaced name. */
const attributeName = (attribute: unknown): string | undefined =>
  typeOf(attribute) === "JSXAttribute" ? nameOf(child(attribute, "name")) : undefined;

/**
 * Every value a same-file component's prop is given at its call sites (`<Row size="sm" />`). A
 * site that leaves the prop out renders the default, which covers nothing.
 */
function componentProp(
  component: string,
  prop: string,
  file: FileIndex,
  depth: number,
): string[] | undefined {
  if (depth > 4) return undefined;
  const values: string[] = [];
  for (const site of file.tags.filter((t) => t.tag === component)) {
    const attributes = children(site.node, "attributes");
    if (attributes.some((a) => typeOf(a) === "JSXSpreadAttribute")) return undefined;
    for (const attribute of attributes.filter((a) => attributeName(a) === prop)) {
      const found = resolve(child(attribute, "value"), site.ancestors, file, depth + 1);
      if (found === undefined) return undefined;
      values.push(...found);
    }
  }
  return values;
}

/** `name`, where a `.map` over literals or a same-file component's prop binds it. */
function resolveIdentifier(
  name: string | undefined,
  ancestors: unknown[],
  file: FileIndex,
  depth: number,
): string[] | undefined {
  const binding = name === undefined ? undefined : bindingOf(name, ancestors, file.arrays);
  if (binding === undefined) return undefined;
  if (binding.kind === "array") return literals(binding.array);
  return componentProp(binding.component, binding.prop, file, depth);
}

/** The value of `key` in each object literal of `array`. A row without the key is skipped. */
function rowValues(array: unknown[], key: string): unknown[] | undefined {
  const values: unknown[] = [];
  for (const element of array.map(unwrap).filter((e) => !isUndefined(e))) {
    if (typeOf(element) !== "ObjectExpression") return undefined;
    const entry = children(element, "properties").find(
      (p) => typeOf(p) === "Property" && nameOf(child(p, "key")) === key,
    );
    if (entry !== undefined) values.push(child(entry, "value"));
  }
  return values;
}

/** `l.tone`, where `l` runs over an array of object literals. */
function resolveMember(
  member: unknown,
  ancestors: unknown[],
  file: FileIndex,
): string[] | undefined {
  if (isRecord(member) && member["computed"] === true) return undefined;
  const object = unwrap(child(member, "object"));
  const key = nameOf(child(member, "property"));
  const name = typeOf(object) === "Identifier" ? nameOf(object) : undefined;
  if (key === undefined || name === undefined || !LOOK_PROPS.includes(key)) return undefined;
  const binding = bindingOf(name, ancestors, file.arrays);
  if (binding?.kind !== "array") return undefined;
  const values = rowValues(binding.array, key);
  return values === undefined ? undefined : literals(values);
}

/** Both branches of `c ? a : b`, or `undefined` when either is unresolved. */
function resolveBranches(
  node: unknown,
  ancestors: unknown[],
  file: FileIndex,
  depth: number,
): string[] | undefined {
  const a = resolve(child(node, "consequent"), ancestors, file, depth);
  const b = resolve(child(node, "alternate"), ancestors, file, depth);
  return a === undefined || b === undefined ? undefined : [...a, ...b];
}

/** What an attribute value resolves to: the literal values it can take, or `undefined`. */
function resolve(
  value: unknown,
  ancestors: unknown[],
  file: FileIndex,
  depth = 0,
): string[] | undefined {
  // The bare attribute: `<Button disabled>`.
  if (value === undefined) return ["true"];
  const expression =
    typeOf(value) === "JSXExpressionContainer" ? child(value, "expression") : value;
  const direct = literal(expression);
  if (direct !== undefined) return direct === null ? [] : [direct];
  const inner = unwrap(expression);
  switch (typeOf(inner)) {
    // `c ? "a" : "b"`: either branch.
    case "ConditionalExpression":
      return resolveBranches(inner, ancestors, file, depth);
    case "Identifier":
      return resolveIdentifier(nameOf(inner), ancestors, file, depth);
    case "MemberExpression":
      return resolveMember(inner, ancestors, file);
    default:
      return undefined;
  }
}

/** Every JSX tag named by a plain identifier, with copies of the nodes above it. */
function indexTags(root: unknown): FileIndex["tags"] {
  const tags: FileIndex["tags"] = [];
  const ancestors: unknown[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    if (!isRecord(node)) return;
    const tag = child(node, "name");
    const name = typeOf(tag) === "JSXIdentifier" ? nameOf(tag) : undefined;
    if (typeOf(node) === "JSXOpeningElement" && name !== undefined)
      tags.push({ tag: name, node, ancestors: [...ancestors] });
    ancestors.push(node);
    for (const value of Object.values(node)) walk(value);
    ancestors.pop();
  };
  walk(root);
  return tags;
}

/**
 * The values `file`'s JSX passes to each covered prop of each of `components`, and the attributes
 * it could not resolve. It does not follow imports.
 */
export function storyValues(
  file: string,
  source: string,
  components: ReadonlySet<string>,
): { seen: Seen[]; unresolved: Unresolved[]; rendered: Set<string> } {
  const root = parseAst(source, { lang: "tsx" });
  const index: FileIndex = { arrays: constArrays(root), tags: indexTags(root) };
  const seen: Seen[] = [];
  const unresolved: Unresolved[] = [];
  const rendered = new Set<string>();
  for (const site of index.tags.filter((t) => components.has(t.tag))) {
    rendered.add(site.tag);
    for (const attribute of children(site.node, "attributes")) {
      const prop = attributeName(attribute);
      if (prop === undefined || !COVERED_PROPS.includes(prop)) continue;
      const component = site.tag;
      const values = resolve(child(attribute, "value"), [...site.ancestors, site.node], index);
      if (values === undefined)
        unresolved.push({ component, prop, file, line: lineOf(source, startOf(attribute)) });
      for (const value of values ?? []) seen.push({ component, prop, value });
    }
  }
  return { seen, unresolved, rendered };
}
