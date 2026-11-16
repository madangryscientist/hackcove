import ts from "typescript";
import { attributeOf, literalOf, remove, replace } from "../attributes.js";
import { type Context, report, type Tag, type TagRule } from "../source.js";

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

export const tagRules: readonly TagRule[] = [filterGroup, inputAlign];
