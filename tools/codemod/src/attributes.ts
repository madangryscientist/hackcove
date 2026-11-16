import ts from "typescript";
import type { Edit } from "./edits.js";
import type { Context, Tag } from "./source.js";

/** The tag's named attributes, in order (a spread is not one). */
export function attributesOf(tag: Tag): ts.JsxAttribute[] {
  return tag.attributes.properties.filter(ts.isJsxAttribute);
}

export function nameOf(attribute: ts.JsxAttribute): string {
  return ts.isIdentifier(attribute.name) ? attribute.name.text : attribute.name.getText();
}

export function attributeOf(tag: Tag, name: string): ts.JsxAttribute | undefined {
  return attributesOf(tag).find((attribute) => nameOf(attribute) === name);
}

/** The expression inside `{…}`, or the string literal of `="…"`. */
export function valueOf(attribute: ts.JsxAttribute): ts.Expression | undefined {
  const init = attribute.initializer;
  if (init === undefined) return undefined;
  if (ts.isJsxExpression(init)) return init.expression;
  return ts.isStringLiteral(init) ? init : undefined;
}

/** The text of a literal value: `="x"`, `{"x"}` or `` {`x`} ``; undefined for anything else. */
export function literalOf(attribute: ts.JsxAttribute | undefined): string | undefined {
  if (attribute === undefined) return undefined;
  const value = valueOf(attribute);
  if (value === undefined) return undefined;
  if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) return value.text;
  return undefined;
}

/** Whether a boolean attribute is set: bare, or `={true}`. */
export function isOn(attribute: ts.JsxAttribute | undefined): boolean {
  if (attribute === undefined) return false;
  if (attribute.initializer === undefined) return true;
  return valueOf(attribute)?.kind === ts.SyntaxKind.TrueKeyword;
}

/** Renames an attribute, keeping its value. */
export function rename(context: Context, attribute: ts.JsxAttribute, name: string): void {
  context.edits.push({
    start: attribute.name.getStart(context.file),
    end: attribute.name.end,
    text: name,
  });
}

/** Removes an attribute and the space before it. */
export function remove(context: Context, attribute: ts.JsxAttribute): void {
  context.edits.push(removal(context, attribute));
}

export function removal(context: Context, node: ts.Node): Edit {
  const text = context.file.text;
  let start = node.getStart(context.file);
  while (start > 0 && /\s/.test(text.charAt(start - 1))) start -= 1;
  return { start, end: node.end, text: "" };
}

/** Writes a whole attribute in place of one (`color="muted"` to `tone="muted"`). */
export function replace(context: Context, node: ts.Node, text: string): void {
  context.edits.push({ start: node.getStart(context.file), end: node.end, text });
}

/** Adds an attribute right after the tag name. */
export function insert(context: Context, tag: Tag, text: string): void {
  const after = tag.typeArguments?.end ?? tag.tagName.end;
  context.edits.push({ start: after, end: after, text: ` ${text}` });
}
