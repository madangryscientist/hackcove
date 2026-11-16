import ts from "typescript";
import { attributeOf, insert } from "../attributes.js";
import {
  componentOf,
  type Context,
  meaningfulChildren,
  report,
  type Tag,
  type TagRule,
} from "../source.js";

/** `Stack` and `Section` with no `gap` were `md`; pin it, so nothing moves inside a container. */
export function stackGap(tag: Tag, component: string, context: Context): void {
  if ((component === "Stack" || component === "Section") && !attributeOf(tag, "gap")) {
    insert(context, tag, 'gap="md"');
  }
}

/** `Cluster` was one line and `xs` apart; pin both, so a row does not start to wrap or spread. */
export function clusterDefaults(tag: Tag, component: string, context: Context): void {
  if (component !== "Cluster") return;
  if (attributeOf(tag, "wrap") === undefined) insert(context, tag, "wrap={false}");
  if (attributeOf(tag, "gap") === undefined) insert(context, tag, 'gap="xs"');
}

/** The card's one child, when it is an `EmptyState`. */
function loneEmptyState(tag: Tag, context: Context): ts.JsxChild | undefined {
  const children = meaningfulChildren(tag);
  const only = children[0];
  if (children.length !== 1 || only === undefined) return undefined;
  const inner = ts.isJsxElement(only) ? only.openingElement : only;
  if (!ts.isJsxOpeningElement(inner) && !ts.isJsxSelfClosingElement(inner)) return undefined;
  return componentOf(inner, context.imports) === "EmptyState" ? only : undefined;
}

/** `Card dashed` round a lone `EmptyState` is the `EmptyState`: it draws the dashed frame itself. */
export function dashedCard(tag: Tag, component: string, context: Context): void {
  const dashed = attributeOf(tag, "dashed");
  if (component !== "Card" || dashed === undefined) return;
  const only = loneEmptyState(tag, context);
  if (!ts.isJsxOpeningElement(tag) || only === undefined) {
    report(context, dashed, "Card dashed is gone: an EmptyState draws the dashed frame");
    return;
  }
  const card = tag.parent;
  context.edits.push({
    start: card.getStart(context.file),
    end: only.getStart(context.file),
    text: "",
  });
  context.edits.push({ start: only.end, end: card.end, text: "" });
}

export const tagRules: readonly TagRule[] = [stackGap, clusterDefaults, dashedCard];
