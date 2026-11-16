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

/**
 * The comma that follows `end`, past spaces, block comments and a line comment on the same line
 * (`A // x` then `, B`, comma-first), with the spaces after it unless a comment follows them.
 * A comment on a line of its own stops it. No part of the pattern can match the same text two
 * ways, so it never backtracks far.
 */
function commaAfter(text: string, end: number): Span | undefined {
  const match =
    /^[ \t]*(?:\/\*[^\n*]*(?:\*(?!\/)[^\n*]*)*\*\/[ \t]*)*(?:\/\/[^\n]*)?\s*,(?:(?![ \t]*\/[/*])[ \t]*)?/.exec(
      text.slice(end),
    );
  if (match === null) return undefined;
  return { start: end + match[0].lastIndexOf(","), end: end + match[0].length };
}

/** A dead specifier with the comma after it, or the one before it on its line (comma-first). */
function deadSpan(element: ts.ImportSpecifier, file: ts.SourceFile): Span {
  const start = element.getStart(file);
  const after = commaAfter(file.text, element.end);
  if (after !== undefined) return { start, end: after.end };
  const before = /,[ \t]*$/.exec(file.text.slice(0, start));
  return { start: start - (before?.[0].length ?? 0), end: element.end };
}

/**
 * Each dead specifier with its comma. When the last one dies and the app wrote no trailing
 * comma, the new last specifier's comma goes too (only the comma), so the style stays.
 */
function deadSpans(
  bindings: ts.NamedImports,
  dead: readonly ts.ImportSpecifier[],
  file: ts.SourceFile,
): Span[] {
  const elements = bindings.elements;
  const spans = dead.map((element) => deadSpan(element, file));
  const last = elements.at(-1);
  const lastKept = elements.findLast((element) => !dead.includes(element));
  if (last !== undefined && dead.includes(last) && !elements.hasTrailingComma && lastKept) {
    const comma = commaAfter(file.text, lastKept.end);
    if (comma !== undefined) spans.push(comma);
  }
  return spans;
}

/**
 * The span widened to its whole line, newline included, when the line is left with nothing but
 * whitespace or the comment that sat beside the dead specifier. Otherwise it takes the spaces
 * before it when only the line's end or a kept comment follows, or the spaces after it when it
 * began the line.
 */
function onItsLine(text: string, span: Span): Span {
  const start = text.lastIndexOf("\n", span.start - 1) + 1;
  // A newline always follows: the closing brace and `from` come after any specifier.
  const end = text.indexOf("\n", span.end);
  const before = text.slice(start, span.start);
  const after = text.slice(span.end, end);
  const opens = before.trim() === "";
  const rest = after.trim();
  if (opens && (rest === "" || rest.startsWith("//"))) return { start, end: end + 1 };
  if (rest === "" || rest.startsWith("//"))
    return { start: start + before.trimEnd().length, end: span.end };
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
