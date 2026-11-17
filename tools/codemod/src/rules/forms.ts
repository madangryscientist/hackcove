import ts from "typescript";
import { attributeOf, literalOf, nameOf, remove, replace, valueOf } from "../attributes.js";
import { componentOf, type Context, report, type Tag, type TagRule } from "../source.js";
import { usesOf } from "./imports.js";

/**
 * How the file names a package export it may not import yet: its local name when it is imported,
 * `ns.Name` through a namespace import, or the bare name, added to the first named import.
 */
export function importName(context: Context, name: string): string {
  for (const [local, exported] of context.imports.named) if (exported === name) return local;
  const [namespace] = context.imports.namespaces;
  if (namespace !== undefined) return `${namespace}.${name}`;
  const last = valueImports(context)[0]?.elements.at(-1);
  // The same edit for every tag that needs the name, so it lands once.
  if (last !== undefined) context.edits.push({ start: last.end, end: last.end, text: `, ${name}` });
  return name;
}

/** The named imports from the package that can carry a component: not an `import type`. */
function valueImports(context: Context): ts.NamedImports[] {
  return context.imports.declarations.flatMap((declaration) => {
    const clause = declaration.importClause;
    const bindings = clause?.namedBindings;
    if (clause?.isTypeOnly || bindings === undefined || !ts.isNamedImports(bindings)) return [];
    return bindings.elements.length > 0 ? [bindings] : [];
  });
}

/** Renames a namespaced tag, `<ui.Old>` and its closing tag; a named import is renamed with its uses. */
export function renameNamespaced(tag: Tag, to: string, context: Context): void {
  const names = [tag.tagName];
  if (ts.isJsxOpeningElement(tag) && ts.isJsxElement(tag.parent)) {
    names.push(tag.parent.closingElement.tagName);
  }
  for (const name of names) {
    if (!ts.isPropertyAccessExpression(name)) continue;
    context.edits.push({ start: name.name.getStart(context.file), end: name.name.end, text: to });
  }
}

/** `FilterGroup` is a `Fieldset` round a `ButtonGroup` of its chips, which keeps them in a wrapping row. */
export function filterGroup(tag: Tag, component: string, context: Context): void {
  if (component !== "FilterGroup") return;
  renameNamespaced(tag, "Fieldset", context);
  if (!ts.isJsxOpeningElement(tag) || !ts.isJsxElement(tag.parent)) return;
  const group = importName(context, "ButtonGroup");
  const element = tag.parent;
  context.edits.push({ start: tag.end, end: tag.end, text: `<${group}>` });
  const closing = element.closingElement.getStart(context.file);
  context.edits.push({ start: closing, end: closing, text: `</${group}>` });
}

/**
 * `Input align="end"` was always a figure: it is `numeric`, which also sets `inputMode="decimal"`,
 * so that line goes. `align="start"` was the default. Any other value is a person's call.
 */
export function inputAlign(tag: Tag, component: string, context: Context): void {
  if (component !== "Input") return;
  const align = attributeOf(tag, "align");
  if (align === undefined) return;
  const value = literalOf(align);
  if (value === "start") {
    remove(context, align);
    return;
  }
  if (value !== "end") {
    report(context, align, "Input align is gone: a figure is numeric, any other field drops it");
    return;
  }
  replace(context, align, "numeric");
  const mode = attributeOf(tag, "inputMode");
  if (mode !== undefined && literalOf(mode) === "decimal") remove(context, mode);
}

/** The controls that take the enclosing `Field`'s id, so its label names them with no `id` of theirs. */
const FIELD_CONTROLS = new Set(["Input", "Select", "Textarea", "FileDrop"]);

/** The attributes whose value names an element by its id. */
const ID_REFERENCES = /^(id|htmlFor|for|href|form|list|headers|aria-[a-z]+)$/;

/** Every tag under a Field, through expressions too, but not inside a `Field` nested in it. */
function tagsUnder(root: ts.Node, context: Context): Tag[] {
  const out: Tag[] = [];
  const visit = (node: ts.Node): void => {
    const tag = ts.isJsxElement(node) ? node.openingElement : node;
    if (ts.isJsxOpeningElement(tag) || ts.isJsxSelfClosingElement(tag)) {
      if (componentOf(tag, context.imports) === "Field") return;
      if (tag === node) out.push(tag);
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(root, visit);
  return out;
}

/** The attribute a string sits in as its value, `id="x"` or `id={"x"}`. */
function attributeHolding(node: ts.Node): ts.JsxAttribute | undefined {
  const parent = ts.isJsxExpression(node.parent) ? node.parent.parent : node.parent;
  return ts.isJsxAttribute(parent) ? parent : undefined;
}

/**
 * How many strings in the file name `id`, besides the attributes in `skip`: an id reference
 * attribute (`aria-describedby`, `href="#…"`) or any string in code (`getElementById`, a selector).
 */
function otherNames(context: Context, id: string, skip: readonly ts.JsxAttribute[]): number {
  const escaped = id.replaceAll(/[.*+?^$()|[\]{}\\]/g, "\\$&");
  const word = new RegExp(`(^|[^\\w-])${escaped}($|[^\\w-])`);
  let count = 0;
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteralLike(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const attribute = attributeHolding(node);
      const counts =
        !ts.isImportDeclaration(node.parent) &&
        (attribute === undefined ||
          (!skip.includes(attribute) && ID_REFERENCES.test(nameOf(attribute))));
      if (counts && word.test(node.text)) count += 1;
    }
    ts.forEachChild(node, visit);
  };
  visit(context.file);
  return count;
}

/** The `const` a name is declared by, when it is `const name = useId()`: an id the file makes itself. */
function useIdConst(context: Context, name: string): ts.Identifier | undefined {
  return usesOf(context.file, name).find((use) => {
    const parent = use.parent;
    if (!ts.isVariableDeclaration(parent) || parent.name !== use) return false;
    const init = parent.initializer;
    return (
      init !== undefined &&
      ts.isCallExpression(init) &&
      init.expression.getText(context.file).replace(/^React\./, "") === "useId"
    );
  });
}

/** Whether `htmlFor` and the control's `id` name each other and nothing else in the file. */
function onlyPair(
  context: Context,
  htmlFor: ts.JsxAttribute,
  id: ts.JsxAttribute,
): { declaration?: ts.Identifier } | undefined {
  const literal = literalOf(htmlFor);
  if (literal !== undefined) {
    return otherNames(context, literal, [htmlFor, id]) === 0 ? {} : undefined;
  }
  const value = valueOf(htmlFor);
  if (value === undefined || !ts.isIdentifier(value)) return undefined;
  // An id from a prop or anywhere else was chosen by a caller, who may name it from another file.
  const declaration = useIdConst(context, value.text);
  if (declaration === undefined) return undefined;
  const others = usesOf(context.file, value.text).filter(
    (use) =>
      use !== declaration &&
      use !== value &&
      use !== valueOf(id) &&
      !(
        (ts.isPropertySignature(use.parent) || ts.isJsxAttribute(use.parent)) &&
        use.parent.name === use
      ),
  );
  return others.length > 0 ? undefined : { declaration };
}

/** Whether two `htmlFor`/`id` values are the same string, or the same identifier. */
function sameValue(a: ts.JsxAttribute, b: ts.JsxAttribute): boolean {
  const literal = literalOf(a);
  if (literal !== undefined) return literalOf(b) === literal;
  const left = valueOf(a);
  const right = valueOf(b);
  return (
    left !== undefined &&
    right !== undefined &&
    ts.isIdentifier(left) &&
    ts.isIdentifier(right) &&
    left.text === right.text
  );
}

/** The control whose `id` is the `htmlFor`, or why the codemod keeps the pair. */
function pairedControl(
  tag: Tag,
  htmlFor: ts.JsxAttribute,
  context: Context,
): ts.JsxAttribute | string {
  const value = valueOf(htmlFor);
  if (literalOf(htmlFor) === undefined && (value === undefined || !ts.isIdentifier(value))) {
    return "htmlFor kept: the id is not a literal or a name, check it";
  }
  const elsewhere = "htmlFor kept: something else names this id";
  if (!ts.isJsxOpeningElement(tag)) return elsewhere;
  const matches = tagsUnder(tag.parent, context).flatMap((inner) => {
    const id = attributeOf(inner, "id");
    return id !== undefined && sameValue(htmlFor, id) ? [{ inner, id }] : [];
  });
  const [match] = matches;
  if (matches.length !== 1 || match === undefined) return elsewhere;
  if (!FIELD_CONTROLS.has(componentOf(match.inner, context.imports) ?? "")) {
    return "htmlFor kept: the control is not a Field part, check it";
  }
  return match.id;
}

/**
 * `Field htmlFor` and its control's matching `id` go when they only pair the two: a `Field` makes
 * its own id and gives it to the control (`Input`, `Select`, `Textarea`, `FileDrop`), so the label
 * still names it. Anything else that names the id keeps both, reported.
 */
export function fieldPair(tag: Tag, component: string, context: Context): void {
  if (component !== "Field") return;
  const htmlFor = attributeOf(tag, "htmlFor");
  if (htmlFor === undefined) return;
  const id = pairedControl(tag, htmlFor, context);
  if (typeof id === "string") return report(context, htmlFor, id);
  const pair = onlyPair(context, htmlFor, id);
  if (pair === undefined) {
    report(context, htmlFor, "htmlFor kept: something else names this id");
    return;
  }
  remove(context, htmlFor);
  remove(context, id);
  if (pair.declaration !== undefined) {
    report(context, pair.declaration, `${pair.declaration.text} is unused now: remove it`);
  }
}

export const tagRules: readonly TagRule[] = [filterGroup, inputAlign, fieldPair];
