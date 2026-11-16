import ts from "typescript";
import type { Edit } from "./edits.js";

/** The package whose elements the codemod touches. */
export const PACKAGE = "@hackcove/ui-react";

/** A JSX element's opening tag, with its attributes. */
export type Tag = ts.JsxOpeningElement | ts.JsxSelfClosingElement;

/** A rule that reads one tag of a package component and edits or reports it. */
export type TagRule = (tag: Tag, component: string, context: Context) => void;

/** One line for a person: where, and what to decide. */
export type Report = { line: number; message: string };

/** A report as a rule makes it: at an offset in the source, before any edit. */
export type Note = { at: number; message: string };

/** What the package's imports bind in one file. */
export type Imports = {
  /** Local name to the exported name: `{ Card as Box }` maps `Box` to `Card`. */
  named: Map<string, string>;
  /** The names of `import * as ui from "@hackcove/ui-react"`. */
  namespaces: Set<string>;
  /** The import declarations themselves. */
  declarations: ts.ImportDeclaration[];
};

/** Everything a rule reads and writes for one file. */
export type Context = {
  file: ts.SourceFile;
  imports: Imports;
  edits: Edit[];
  reports: Note[];
};

export function parse(source: string, fileName: string): ts.SourceFile {
  return ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

/** The bindings of every import from the package in the file. */
export function packageImports(file: ts.SourceFile): Imports {
  const imports: Imports = { named: new Map(), namespaces: new Set(), declarations: [] };
  for (const statement of file.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const from = statement.moduleSpecifier;
    if (!ts.isStringLiteral(from) || from.text !== PACKAGE) continue;
    imports.declarations.push(statement);
    bind(statement.importClause?.namedBindings, imports);
  }
  return imports;
}

function bind(bindings: ts.NamedImportBindings | undefined, imports: Imports): void {
  if (bindings === undefined) return;
  if (ts.isNamespaceImport(bindings)) {
    imports.namespaces.add(bindings.name.text);
    return;
  }
  for (const element of bindings.elements) {
    imports.named.set(element.name.text, (element.propertyName ?? element.name).text);
  }
}

/** The package component a tag draws (`Card` for `<Card>`, `<Box>` aliased or `<ui.Card>`), if any. */
export function componentOf(tag: Tag, imports: Imports): string | undefined {
  const name = tag.tagName;
  if (ts.isIdentifier(name)) return imports.named.get(name.text);
  if (
    ts.isPropertyAccessExpression(name) &&
    ts.isIdentifier(name.expression) &&
    imports.namespaces.has(name.expression.text)
  ) {
    return name.name.text;
  }
  return undefined;
}

/** Records a line for a person at a node. */
export function report(context: Context, node: ts.Node, message: string): void {
  context.reports.push({ at: node.getStart(context.file), message });
}

/** The tag of the element a node sits directly inside, skipping JSX expressions and fragments. */
function parentTag(node: ts.Node): Tag | undefined {
  for (let at = node.parent; at !== undefined; at = at.parent) {
    if (ts.isJsxElement(at) && at.openingElement !== node) return at.openingElement;
    if (ts.isJsxSelfClosingElement(at) && at !== node) return at;
  }
  return undefined;
}

/** The package components that hold a tag, nearest first, each with its tag. */
export function enclosing(tag: Tag, imports: Imports): { name: string; tag: Tag }[] {
  const out: { name: string; tag: Tag }[] = [];
  for (let at = parentTag(tag); at !== undefined; at = parentTag(at)) {
    const name = componentOf(at, imports);
    if (name !== undefined) out.push({ name, tag: at });
  }
  return out;
}

/** The element's children, when the tag opens an element with a closing tag. */
export function childrenOf(tag: Tag): readonly ts.JsxChild[] {
  return ts.isJsxOpeningElement(tag) && ts.isJsxElement(tag.parent) ? tag.parent.children : [];
}

/** The children that are not whitespace-only text. */
export function meaningfulChildren(tag: Tag): ts.JsxChild[] {
  return childrenOf(tag).filter(
    (child) => !(ts.isJsxText(child) && child.containsOnlyTriviaWhiteSpaces),
  );
}
