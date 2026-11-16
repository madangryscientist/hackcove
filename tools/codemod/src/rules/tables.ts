import ts from "typescript";
import { attributeOf, insert, isOn, remove, replace } from "../attributes.js";
import { componentOf, type Context, report, type Tag, type TagRule } from "../source.js";

function tagOf(node: ts.Node): Tag | undefined {
  if (ts.isJsxElement(node)) return node.openingElement;
  return ts.isJsxSelfClosingElement(node) ? node : undefined;
}

/** The text of a string-literal attribute. */
function stringOf(attribute: ts.JsxAttribute | undefined): string | undefined {
  const init = attribute?.initializer;
  return init !== undefined && ts.isStringLiteral(init) ? init.text : undefined;
}

/** How many columns a cell spans: a literal `colSpan={n}`, else one. */
function spanOf(tag: Tag): number {
  const span = attributeOf(tag, "colSpan")?.initializer;
  const value = span && ts.isJsxExpression(span) ? span.expression : undefined;
  return value && ts.isNumericLiteral(value) ? Number(value.text) : 1;
}

/** The first element under `root` drawn by `component`. */
function firstUnder(root: ts.Node, component: string, context: Context): Tag | undefined {
  let found: Tag | undefined;
  const visit = (node: ts.Node): void => {
    if (found !== undefined) return;
    const tag = tagOf(node);
    if (tag !== undefined && node !== root && componentOf(tag, context.imports) === component) {
      found = tag;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(root);
  return found;
}

/** The first `TableRow` in the table's first `TableHead` or `TableBody`. */
function firstRow(table: ts.Node, section: string, context: Context): Tag | undefined {
  const part = firstUnder(table, section, context);
  return part === undefined ? undefined : firstUnder(part.parent, "TableRow", context);
}

/** A row's cells in column order, each with the column it starts at; fragments are opened. */
function cellsOf(row: Tag): { column: number; tag: Tag }[] {
  const out: { column: number; tag: Tag }[] = [];
  let column = 0;
  const walk = (children: readonly ts.JsxChild[]): void => {
    for (const child of children) {
      if (ts.isJsxFragment(child)) walk(child.children);
      const tag = tagOf(child);
      if (tag === undefined) continue;
      out.push({ column, tag });
      column += spanOf(tag);
    }
  };
  if (ts.isJsxOpeningElement(row) && ts.isJsxElement(row.parent)) walk(row.parent.children);
  return out;
}

const isNumeric = (tag: Tag | undefined) => tag !== undefined && isOn(attributeOf(tag, "numeric"));

/** A head cell `align="end"` over a column whose first body row's cell is `numeric` is `numeric`. */
export function numericHead(tag: Tag, component: string, context: Context): void {
  if (component !== "Table" || !ts.isJsxOpeningElement(tag)) return;
  const headRow = firstRow(tag.parent, "TableHead", context);
  const bodyRow = firstRow(tag.parent, "TableBody", context);
  if (headRow === undefined || bodyRow === undefined) return;
  const bodyCells = new Map(cellsOf(bodyRow).map((cell) => [cell.column, cell.tag]));
  for (const { column, tag: cell } of cellsOf(headRow)) {
    const align = attributeOf(cell, "align");
    if (align !== undefined && stringOf(align) === "end" && isNumeric(bodyCells.get(column))) {
      replace(context, align, "numeric");
    }
  }
}

/** A `numeric` cell is end aligned by itself: `align="end"` goes, and one with no `align` keeps `start`. */
export function numericCell(tag: Tag, component: string, context: Context): void {
  if ((component !== "TableCell" && component !== "TableEditCell") || !isNumeric(tag)) return;
  const align = attributeOf(tag, "align");
  if (align === undefined) insert(context, tag, 'align="start"');
  else if (stringOf(align) === "end") remove(context, align);
}

/** A `Table` needs a `label` now. */
export function tableLabel(tag: Tag, component: string, context: Context): void {
  if (component !== "Table") return;
  if (attributeOf(tag, "label") === undefined && attributeOf(tag, "caption") === undefined) {
    report(context, tag, "a Table needs a label, the name a screen reader hears");
  }
}

export const tagRules: readonly TagRule[] = [numericHead, numericCell, tableLabel];
