import ts from "typescript";
import { attributeOf, insert, isOn, literalOf, remove, replace, valueOf } from "../attributes.js";
import {
  componentOf,
  type Context,
  enclosing,
  meaningfulChildren,
  report,
  type Tag,
  type TagRule,
} from "../source.js";

/** The icon name of a lone `<Icon name="x" />` child, if that is all the element holds. */
function loneIcon(tag: Tag, context: Context): string | undefined {
  const children = meaningfulChildren(tag);
  const only = children[0];
  if (children.length !== 1 || only === undefined || !ts.isJsxSelfClosingElement(only)) {
    return undefined;
  }
  if (componentOf(only, context.imports) !== "Icon") return undefined;
  return literalOf(attributeOf(only, "name"));
}

/** `<IconButton label="Close"><Icon name="close" /></IconButton>` is `<IconButton label="Close" icon="close" />`. */
export function iconButtonChild(tag: Tag, component: string, context: Context): void {
  if (component !== "IconButton" || !ts.isJsxOpeningElement(tag)) return;
  const icon = loneIcon(tag, context);
  if (icon === undefined) {
    if (meaningfulChildren(tag).length > 0) {
      report(context, tag, 'IconButton takes icon="name" and no children: move the icon by hand');
    }
    return;
  }
  insert(context, tag, `icon="${icon}"`);
  context.edits.push({ start: tag.end - 1, end: tag.parent.end, text: " />" });
}

/** An `<Icon>` as a `Button`'s first child is `icon="name"`, by hand. */
export function buttonIcon(tag: Tag, component: string, context: Context): void {
  if (component !== "Button") return;
  const first = meaningfulChildren(tag)[0];
  if (first !== undefined && ts.isJsxSelfClosingElement(first)) {
    if (componentOf(first, context.imports) === "Icon") {
      report(context, first, 'a Button\'s icon is icon="name", before the label');
    }
  }
}

/** `busy={x} busyLabel="Saving"` is `busy={x && "Saving"}`. */
export function busyLabel(tag: Tag, component: string, context: Context): void {
  const label = attributeOf(tag, "busyLabel");
  if (component !== "Button" || label === undefined) return;
  const busy = attributeOf(tag, "busy");
  const words = valueOf(label)?.getText(context.file);
  remove(context, label);
  if (busy === undefined || words === undefined) return;
  const when = condition(busy, context);
  replace(context, busy, when === undefined ? `busy={${words}}` : `busy={${when} && ${words}}`);
}

/** A boolean attribute's condition, bracketed unless it is a name; undefined when it is just on. */
export function condition(attribute: ts.JsxAttribute, context: Context): string | undefined {
  const value = isOn(attribute) ? undefined : valueOf(attribute);
  if (value === undefined) return undefined;
  const text = value.getText(context.file);
  return ts.isIdentifier(value) || ts.isPropertyAccessExpression(value) ? text : `(${text})`;
}

/** `Pill tone="sky"` became the blue `info` tint; a person checks it reads right. */
export function skyPill(tag: Tag, component: string, context: Context): void {
  const tone = attributeOf(tag, "tone");
  if (component === "Pill" && literalOf(tone) === "sky" && tone !== undefined) {
    report(context, tone, 'Pill tone="sky" is now "info", the blue tint: check it');
  }
}

/** The parts that take their container's size; a field keeps `md` wherever it sits. */
const SIZED = ["Button", "IconButton", "Pill"];

/** The size the nearest density container in the file sets, if one does. */
function containerSize(tag: Tag, context: Context): string | undefined {
  for (const outer of enclosing(tag, context.imports)) {
    const size = literalOf(attributeOf(outer.tag, "size"));
    if (outer.name === "Table") return size ?? "sm";
    if ((outer.name === "Card" || outer.name === "ListRow") && size === "sm") return "sm";
  }
  return undefined;
}

/** A control's `size` that equals its container's is the default now, so it goes. */
export function containerSizes(tag: Tag, component: string, context: Context): void {
  if (!SIZED.includes(component)) return;
  const size = attributeOf(tag, "size");
  if (size !== undefined && literalOf(size) === containerSize(tag, context)) {
    remove(context, size);
  }
}

/** Each density container is reported, so a person checks the controls inside it. */
export function densityContainers(tag: Tag, component: string, context: Context): void {
  const size = literalOf(attributeOf(tag, "size"));
  const sets =
    component === "Table" || ((component === "Card" || component === "ListRow") && size === "sm");
  if (sets) {
    report(
      context,
      tag,
      `a Button, IconButton or Pill with no size in this ${component} is now ${size ?? "sm"}`,
    );
  }
}

export const tagRules: readonly TagRule[] = [
  iconButtonChild,
  buttonIcon,
  busyLabel,
  skyPill,
  containerSizes,
  densityContainers,
];
