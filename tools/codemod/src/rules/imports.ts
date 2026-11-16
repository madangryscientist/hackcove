import ts from "typescript";
import { type Edit } from "../edits.js";
import { type Context, packageImports, parse, report } from "../source.js";

/** Exported names that were renamed: the file's own uses of them are renamed too. */
const RENAMED: Readonly<Record<string, string>> = {
  CalloutTone: "Tone",
  LinkRenderProps: "LinkAdapterProps",
  LinkRender: "LinkAdapter",
  FilterGroup: "Fieldset",
  AppShellHideBelow: "Show",
  AppShellBreakpoint: "Breakpoint",
};

const PROPS_TYPES = [
  "PageHeaderProps",
  "HeroProps",
  "ListRowProps",
  "DialogProps",
  "DrawerProps",
  "BottomSheetProps",
  "LightboxProps",
  "TabsProps",
  "FieldDialogProps",
  "ImageProps",
  "MediaTileProps",
  "ScrollStripProps",
  "TypographyProps",
  "DateFieldProps",
  "DateRangePickerProps",
];

/** Exported names that are gone, and what to write instead. */
const REMOVED: Readonly<Record<string, string>> = {
  TypographyColor: "TypographyColor is gone: a text role takes tone",
  ButtonLook: "ButtonLook is no longer exported",
  EpicHeader: "EpicHeader is gone: a SubsectionHeading over the group",
  groupByEpic: "groupByEpic is gone: Object.groupBy in the app",
  ToolCallCard: "ToolCallCard is gone: a bordered Disclosure",
  ControlAlign: "ControlAlign is gone: an Input for a figure is numeric",
  avatarColourClass: "avatarColourClass is no longer exported: Avatar picks the colour from name",
  initialsOf: "initialsOf is no longer exported: Avatar draws the initials from name",
  ...Object.fromEntries(
    PROPS_TYPES.map((name) => [name, `${name} is not exported: use ComponentProps<typeof …>`]),
  ),
};

/** Every identifier in the file with this text, except a property name. */
function usesOf(file: ts.SourceFile, name: string): ts.Identifier[] {
  const out: ts.Identifier[] = [];
  const visit = (node: ts.Node): void => {
    const parent = node.parent;
    const isPropertyName =
      parent !== undefined &&
      (ts.isPropertyAccessExpression(parent) || ts.isPropertyAssignment(parent)) &&
      parent.name === node;
    if (ts.isIdentifier(node) && node.text === name && !isPropertyName) out.push(node);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return out;
}

/** Removes an import specifier with the comma that joins it to the next one, or the one before. */
function specifierRemoval(element: ts.ImportSpecifier, file: ts.SourceFile): Edit {
  const text = file.text;
  const start = element.getStart(file);
  const after = /^\s*,\s*/.exec(text.slice(element.end));
  if (after) return { start, end: element.end + after[0].length, text: "" };
  const before = /\s*,\s*$/.exec(text.slice(0, start));
  return { start: start - (before?.[0].length ?? 0), end: element.end, text: "" };
}

type Span = { start: number; end: number };

/** The spans sorted, with any two that overlap or touch made one. */
function merged(spans: readonly Span[]): Span[] {
  const out: Span[] = [];
  for (const span of spans.toSorted((a, b) => a.start - b.start)) {
    const last = out.at(-1);
    if (last !== undefined && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else out.push({ ...span });
  }
  return out;
}

/** A block comment, unrolled so it can match only one way. */
const BLOCK = String.raw`\/\*[^\n*]*(?:\*(?!\/)[^\n*]*)*\*\/`;
/**
 * Spaces, block comments and a line comment on the same line, then the comma (`A // x` then
 * `, B` is comma-first), with the spaces after it unless a line comment follows them. A comment on a
 * line of its own stops it. No part can match the same text two ways, so it never backtracks far.
 */
const COMMA_AFTER = new RegExp(
  String.raw`^[ \t]*(?:${BLOCK}[ \t]*)*(?:\/\/[^\n]*(?=\n))?\s*,(?:(?![ \t]*\/\/)[ \t]*)?`,
);

/** The comma that follows `end`, as `COMMA_AFTER` finds it. */
function commaAfter(text: string, end: number): Span | undefined {
  const match = COMMA_AFTER.exec(text.slice(end));
  if (match === null) return undefined;
  return { start: end + match[0].lastIndexOf(","), end: end + match[0].length };
}

/** What is left of a line when nothing but comments (or nothing) is. */
const COMMENTS_ONLY = new RegExp(String.raw`^(?:${BLOCK}[ \t]*)*(?:\/\/.*)?$`);
/** The block comments right before a specifier on its line, which go with it when it dies. */
const BLOCKS_BEFORE = new RegExp(String.raw`(?:${BLOCK}[ \t]*)+$`);

/** The comma token the parser put after `element`, if any. */
function commaToken(element: ts.ImportSpecifier, file: ts.SourceFile): ts.Node | undefined {
  const siblings = element.parent
    .getChildren(file)
    .find((child) => child.kind === ts.SyntaxKind.SyntaxList);
  const tokens = siblings?.getChildren(file) ?? [];
  const next = tokens[tokens.indexOf(element) + 1];
  return next?.kind === ts.SyntaxKind.CommaToken ? next : undefined;
}

/**
 * A dead specifier with any block comment right before it on its line, and its comma: the one
 * after it on its line, else the one before it on its line (comma-first), else the parser's.
 * A comment on a line of its own between the name and that comma stays.
 */
function deadSpan(element: ts.ImportSpecifier, file: ts.SourceFile): Span[] {
  const text = file.text;
  const named = element.getStart(file);
  const line = text.slice(text.lastIndexOf("\n", named - 1) + 1, named);
  const start = named - (BLOCKS_BEFORE.exec(line)?.[0].length ?? 0);
  const after = commaAfter(text, element.end);
  if (after !== undefined) return [{ start, end: after.end }];
  const before = /,[ \t]*$/.exec(text.slice(0, start));
  if (before !== null) return [{ start: start - before[0].length, end: element.end }];
  const token = commaToken(element, file);
  const comma = token === undefined ? undefined : commaAfter(text, token.getStart(file));
  if (comma === undefined) return [{ start, end: element.end }];
  if (/\n[ \t]*\/[/*]/.test(text.slice(element.end, comma.start)))
    return [{ start, end: element.end }, comma];
  return [{ start, end: comma.end }];
}

/**
 * Each dead specifier with its comma. When the last one dies and the app wrote no trailing
 * comma, the new last specifier's comma goes too, so the style stays.
 */
function deadSpans(
  bindings: ts.NamedImports,
  dead: readonly ts.ImportSpecifier[],
  file: ts.SourceFile,
): Span[] {
  const elements = bindings.elements;
  const spans = dead.flatMap((element) => deadSpan(element, file));
  const last = elements.at(-1);
  const lastKept = elements.findLast((element) => !dead.includes(element));
  if (last !== undefined && dead.includes(last) && !elements.hasTrailingComma && lastKept) {
    const comma = commaAfter(file.text, lastKept.end);
    // A block comment after it keeps its space: only the comma goes.
    if (comma !== undefined)
      spans.push(
        file.text.startsWith("/*", comma.end) ? { ...comma, end: comma.start + 1 } : comma,
      );
  }
  return spans;
}

/**
 * The span widened to its whole line, newline included, when the line is left with nothing but
 * whitespace or comments. Otherwise, when only comments follow it, it takes the spaces before
 * it and leaves the ones after it, so a kept comment keeps one space; when it began the line, it
 * takes the spaces after it.
 */
function onItsLine(text: string, span: Span): Span {
  const start = text.lastIndexOf("\n", span.start - 1) + 1;
  // A newline always follows: the closing brace and `from` come after any specifier.
  const end = text.indexOf("\n", span.end);
  const before = text.slice(start, span.start);
  const after = text.slice(span.end, end);
  const opens = before.trim() === "";
  const commentsOnly = COMMENTS_ONLY.test(after.trim());
  if (opens && commentsOnly) return { start, end: end + 1 };
  if (commentsOnly)
    return {
      start: start + before.trimEnd().length,
      end: span.start + text.slice(span.start, span.end).trimEnd().length,
    };
  if (opens) return { start: span.start, end: span.end + after.length - after.trimStart().length };
  return span;
}

/**
 * Removes the dead specifiers from a named import in place, so every kept one keeps its line,
 * indentation, comma and comment as the app wrote them. The edits never overlap or touch, so
 * `applyEdits` takes them together.
 */
function specifiersRemoval(
  bindings: ts.NamedImports,
  dead: readonly ts.ImportSpecifier[],
  file: ts.SourceFile,
): Edit[] {
  const spans = merged(deadSpans(bindings, dead, file)).map((span) => onItsLine(file.text, span));
  return merged(spans).map((span) => ({ ...span, text: "" }));
}

function renameImport(element: ts.ImportSpecifier, context: Context): void {
  const exported = (element.propertyName ?? element.name).text;
  const to = RENAMED[exported];
  if (to === undefined) return;
  if (element.propertyName !== undefined) {
    context.edits.push({
      start: element.propertyName.getStart(context.file),
      end: element.propertyName.end,
      text: to,
    });
    return;
  }
  const already = context.imports.named.has(to);
  for (const use of usesOf(context.file, exported)) {
    if (use === element.name && already)
      context.edits.push(specifierRemoval(element, context.file));
    else context.edits.push({ start: use.getStart(context.file), end: use.end, text: to });
  }
}

/** The renamed types that also mean a person looks at the code that used them. */
const CHECK: Readonly<Record<string, string>> = {
  LinkRenderProps: "a link adapter's props carry href now: spread them and set no href of its own",
  LinkRender: "a link adapter is set once on LinkProvider: a render prop it fed is gone",
};

/** The renamed types follow their new names; a removed export is reported. */
export function imports(context: Context): void {
  for (const declaration of context.imports.declarations) {
    const bindings = declaration.importClause?.namedBindings;
    if (bindings === undefined || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      renameImport(element, context);
      const exported = (element.propertyName ?? element.name).text;
      const gone = REMOVED[exported] ?? CHECK[exported];
      if (gone !== undefined) report(context, element, gone);
    }
  }
}

/**
 * The output with each package import the codemod left unused taken out: an `Icon` that only
 * drew `IconButton` children, say. A name the file never used is left as the app wrote it.
 */
export function pruneImports(before: ts.SourceFile, output: string, fileName: string): Edit[] {
  const file = parse(output, fileName);
  const edits: Edit[] = [];
  for (const declaration of packageImports(file).declarations) {
    const bindings = declaration.importClause?.namedBindings;
    if (bindings === undefined || !ts.isNamedImports(bindings)) continue;
    const dead = bindings.elements.filter(
      (element) =>
        usesOf(file, element.name.text).length === 1 &&
        usesOf(before, element.name.text).length > 1,
    );
    if (dead.length === 0) continue;
    const name = declaration.importClause?.name;
    if (dead.length < bindings.elements.length)
      edits.push(...specifiersRemoval(bindings, dead, file));
    else if (name !== undefined) edits.push({ start: name.end, end: bindings.end, text: "" });
    else edits.push({ start: declaration.getStart(file), end: declaration.end + 1, text: "" });
  }
  return edits;
}
