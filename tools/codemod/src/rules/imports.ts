import ts from "typescript";
import { type Edit } from "../edits.js";
import { type Context, packageImports, parse, report } from "../source.js";

/** Exported names that were renamed: the file's own uses of them are renamed too. */
const RENAMED: Readonly<Record<string, string>> = {
  CalloutTone: "Tone",
  LinkRenderProps: "LinkAdapterProps",
  LinkRender: "LinkAdapter",
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
    const whole = dead.length === bindings.elements.length && !declaration.importClause?.name;
    if (whole && dead.length > 0) {
      edits.push({ start: declaration.getStart(file), end: declaration.end + 1, text: "" });
    } else for (const element of dead) edits.push(specifierRemoval(element, file));
  }
  return edits;
}
