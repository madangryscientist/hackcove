import ts from "typescript";
import { attributeOf, isOn, literalOf, remove, valueOf } from "../attributes.js";
import {
  componentOf,
  type Context,
  enclosing,
  meaningfulChildren,
  report,
  type Tag,
  type TagRule,
} from "../source.js";

// The second step, `--unpin`: it takes out the pins the 0.11 pass wrote so nothing moved, where
// the new default is what the pin meant. It cannot tell a pin it wrote from one a person wrote, so
// it removes one only where the new default draws the same thing, and reports the rest.

/** The package parts that lay their children out in a flex column: each child is its own row. */
const COLUMN_PARTS = new Set(["Stack", "Section", "Field"]);

/**
 * The package parts and HTML elements whose children flow as plain blocks: a lone child that turns
 * from a `<span>` into a `<p>` looks the same, but a `<p>` next to inline siblings breaks the line.
 */
const BLOCK_PARTS = new Set(["Card", "Dialog", "Drawer", "BottomSheet", "Callout", "Fieldset"]);
const BLOCK_ELEMENTS = new Set(["div", "section", "article", "main", "header", "footer", "li"]);

/** The containers whose `Stack` and `Section` default to the `xs` gap, not `md`. */
const TIGHT = new Set(["Card", "Dialog", "Drawer", "BottomSheet", "Callout", "ListRow"]);

/**
 * Whether the element would look the same as a `<p>`, read from the JSX alone: in a flex column it
 * is its own row whatever sits beside it; in a plain block only when it is the block's one child.
 */
function inBlock(tag: Tag, context: Context): boolean {
  const element = ts.isJsxOpeningElement(tag) ? tag.parent : tag;
  const parent = element.parent;
  if (!ts.isJsxElement(parent)) return false;
  const opening = parent.openingElement;
  const part = componentOf(opening, context.imports);
  if (part !== undefined && COLUMN_PARTS.has(part)) return true;
  const name = opening.tagName;
  const block =
    part === undefined
      ? ts.isIdentifier(name) && BLOCK_ELEMENTS.has(name.text)
      : BLOCK_PARTS.has(part);
  return block && meaningfulChildren(opening).length === 1;
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
  const size = attributeOf(tag, "size");
  if (component === "Section" && size !== undefined && literalOf(size) !== "md") {
    report(context, gap, 'gap="md" kept: this Section\'s size sets its own gap, check it');
    return;
  }
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
