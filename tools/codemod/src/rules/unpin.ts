import ts from "typescript";
import { attributeOf, isOn, literalOf, remove, valueOf } from "../attributes.js";
import { componentOf, type Context, enclosing, report, type Tag, type TagRule } from "../source.js";

// The second step, `--unpin`: it takes out the pins the 0.11 pass wrote so nothing moved, where
// the new default is what the pin meant. It cannot tell a pin it wrote from one a person wrote, so
// it removes one only where the new default draws the same thing, and reports the rest.

/** The package parts that lay their children out as blocks, one under the other. */
const BLOCK_PARTS = new Set([
  "Stack",
  "Section",
  "Card",
  "Dialog",
  "Drawer",
  "BottomSheet",
  "Callout",
  "Field",
  "Fieldset",
]);

/** The HTML elements whose children are blocks. */
const BLOCK_ELEMENTS = new Set(["div", "section", "article", "main", "header", "footer", "li"]);

/** The containers whose `Stack` and `Section` default to the `xs` gap, not `md`. */
const TIGHT = new Set(["Card", "Dialog", "Drawer", "BottomSheet", "Callout", "ListRow"]);

/** Whether the element's direct parent, read from the JSX alone, lays it out as a block. */
function inBlock(tag: Tag, context: Context): boolean {
  const element = ts.isJsxOpeningElement(tag) ? tag.parent : tag;
  const parent = element.parent;
  if (!ts.isJsxElement(parent)) return false;
  const opening = parent.openingElement;
  const part = componentOf(opening, context.imports);
  if (part !== undefined) return BLOCK_PARTS.has(part);
  const name = opening.tagName;
  return ts.isIdentifier(name) && BLOCK_ELEMENTS.has(name.text);
}

/** `Text`/`Caption` `as="span"` goes where a paragraph sits as well: in a block container. */
export function unpinSpan(tag: Tag, component: string, context: Context): void {
  if (component !== "Text" && component !== "Caption") return;
  const as = attributeOf(tag, "as");
  if (literalOf(as) !== "span" || as === undefined) return;
  if (inBlock(tag, context)) remove(context, as);
  else report(context, as, 'as="span" kept: inline here, check it');
}

/** `Stack`/`Section` `gap="md"` goes at page level, where `md` is the default. */
export function unpinGap(tag: Tag, component: string, context: Context): void {
  if (component !== "Stack" && component !== "Section") return;
  const gap = attributeOf(tag, "gap");
  if (literalOf(gap) !== "md" || gap === undefined) return;
  if (enclosing(tag, context.imports).some(({ name }) => TIGHT.has(name))) {
    report(
      context,
      gap,
      'gap="md" kept: the default here is xs, remove it if the tighter gap is wanted',
    );
  } else {
    remove(context, gap);
  }
}

/** `Cluster wrap={false}` stays: letting a row wrap is the new look, but it changes a layout. */
export function reportNoWrap(tag: Tag, component: string, context: Context): void {
  if (component !== "Cluster") return;
  const wrap = attributeOf(tag, "wrap");
  if (wrap !== undefined && valueOf(wrap)?.kind === ts.SyntaxKind.FalseKeyword) {
    report(context, wrap, "wrap={false}: remove it unless this row must stay on one line");
  }
}

/** A `numeric` cell's `align="start"` goes: end aligned figures are the look. */
export function unpinNumericStart(tag: Tag, component: string, context: Context): void {
  if (component !== "TableCell" && component !== "TableEditCell") return;
  const align = attributeOf(tag, "align");
  const numeric = attributeOf(tag, "numeric");
  if (literalOf(align) !== "start" || align === undefined || numeric === undefined) return;
  if (isOn(numeric)) remove(context, align);
  else if (valueOf(numeric)?.kind !== ts.SyntaxKind.FalseKeyword) {
    report(context, align, 'align="start" kept: numeric is not a literal, check it');
  }
}

export const tagRules: readonly TagRule[] = [unpinSpan, unpinGap, reportNoWrap, unpinNumericStart];
