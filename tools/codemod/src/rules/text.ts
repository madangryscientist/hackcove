import ts from "typescript";
import {
  attributeOf,
  attributesOf,
  insert,
  isOn,
  literalOf,
  nameOf,
  remove,
  replace,
  valueOf,
} from "../attributes.js";
import { type Context, meaningfulChildren, report, type Tag, type TagRule } from "../source.js";

const INLINE = ["Text", "Caption", "Overline"];
const HEADINGS = ["Display", "Lead", "PageHeading", "SectionHeading", "SubsectionHeading"];

/** The `color` values that have a `tone` with the same meaning. */
const COLOR_TO_TONE: Readonly<Record<string, string>> = {
  muted: "muted",
  tertiary: "muted",
  brand: "accent",
};

/** `color` on the text roles: `tone` where there is one, a report where a person picks. */
export function textColor(tag: Tag, component: string, context: Context): void {
  const color = attributeOf(tag, "color");
  if (color === undefined) return;
  if (HEADINGS.includes(component)) {
    report(context, color, `${component} color is gone: each heading has its fixed ink`);
    return;
  }
  if (!INLINE.includes(component)) return;
  const value = literalOf(color);
  const tone = COLOR_TO_TONE[value ?? ""];
  if (tone !== undefined) replace(context, color, `tone="${tone}"`);
  else if (!(component === "Text" && value === "secondary")) {
    report(context, color, `${component} color="${value ?? "…"}" has no tone: pick one by hand`);
  }
}

/** A bare `Text` or `Caption` was a `<span>`; pin it, so the DOM does not change. */
export function inlineElement(tag: Tag, component: string, context: Context): void {
  if (component !== "Text" && component !== "Caption") return;
  if (attributeOf(tag, "as") === undefined) insert(context, tag, 'as="span"');
}

/** `Callout` with no `tone` was `info`; pin it, so the box stays blue. */
export function calloutTone(tag: Tag, component: string, context: Context): void {
  if (component === "Callout" && attributeOf(tag, "tone") === undefined) {
    insert(context, tag, 'tone="info"');
  }
}

/** `tone: "violet"` in a chart's data is `accent`. Every object literal in the file is read. */
export function vizTones(context: Context): void {
  const charts = ["StackedBar", "Legend", "TrendChart"];
  if (![...context.imports.named.values()].some((name) => charts.includes(name))) return;
  const visit = (node: ts.Node): void => {
    if (
      ts.isPropertyAssignment(node) &&
      node.name.getText(context.file) === "tone" &&
      ts.isStringLiteral(node.initializer) &&
      node.initializer.text === "violet"
    ) {
      replace(context, node.initializer, '"accent"');
    }
    ts.forEachChild(node, visit);
  };
  visit(context.file);
}

/** A `BulletList` takes `BulletItem` children now. */
export function bulletItems(tag: Tag, component: string, context: Context): void {
  if (component !== "BulletList") return;
  const raw = meaningfulChildren(tag).some(
    (child) =>
      (ts.isJsxElement(child) && child.openingElement.tagName.getText(context.file) === "li") ||
      child.getText(context.file).includes('as="li"'),
  );
  if (raw) report(context, tag, "BulletList children are BulletItem parts now");
}

/** The parts that took their element's every attribute, and now take `id`, `data-*` and `aria-*`. */
const PASSTHROUGH: Readonly<Record<string, readonly string[]>> = {
  Callout: ["title"],
  StatTile: [],
  Badge: [],
  Kbd: [],
  Code: [],
  Divider: [],
  BulletList: [],
  KeyValueList: [],
  KeyValue: [],
  PageFade: [],
  Morph: [],
  CopyLine: [],
  ButtonGroup: [],
  Avatar: ["onClick"],
  AppShell: [],
};

/** HTML attributes the passthrough parts no longer take. */
const HTML = /^(on[A-Z].*|title|role|tabIndex|hidden|lang|dir|draggable|translate)$/;

export function passthrough(tag: Tag, component: string, context: Context): void {
  const own = PASSTHROUGH[component];
  if (own === undefined) return;
  for (const attribute of attributesOf(tag)) {
    const name = nameOf(attribute);
    if (HTML.test(name) && !own.includes(name)) {
      report(context, attribute, `${component} takes only id, data-* and aria-*: ${name} is gone`);
    }
  }
}

/** `truncate` on `Text` and `Caption` is `lines={1}`; an `Overline` takes no clamp. */
export function truncateLines(tag: Tag, component: string, context: Context): void {
  if (!INLINE.includes(component)) return;
  const truncate = attributeOf(tag, "truncate");
  if (truncate === undefined) return;
  if (component === "Overline") {
    report(context, truncate, "Overline truncate is gone: an overline is a short label");
  } else if (isOn(truncate)) {
    replace(context, truncate, "lines={1}");
  } else if (valueOf(truncate)?.kind === ts.SyntaxKind.FalseKeyword) {
    remove(context, truncate);
  } else {
    report(context, truncate, `${component} truncate is lines={1}: rewrite this one by hand`);
  }
}

export const tagRules: readonly TagRule[] = [
  textColor,
  truncateLines,
  inlineElement,
  calloutTone,
  bulletItems,
  passthrough,
];
