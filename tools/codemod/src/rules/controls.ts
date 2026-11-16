import ts from "typescript";
import { attributeOf, literalOf, remove, replace, valueOf } from "../attributes.js";
import { condition } from "./actions.js";
import {
  componentOf,
  type Context,
  enclosing,
  meaningfulChildren,
  report,
  type Tag,
  type TagRule,
} from "../source.js";

const DATES = ["DateField", "DateRangePicker"];

/** `isInvalid errorMessage="…"` is `error="…"`; either one alone is for a person. */
export function dateErrors(tag: Tag, component: string, context: Context): void {
  if (!DATES.includes(component)) return;
  const invalid = attributeOf(tag, "isInvalid");
  const message = attributeOf(tag, "errorMessage");
  if (invalid !== undefined && message !== undefined) {
    remove(context, invalid);
    replace(context, message, errorFrom(invalid, message, context));
  } else if (invalid !== undefined) {
    report(context, invalid, "isInvalid is gone: give error the reason the field is wrong");
  } else if (message !== undefined) {
    report(context, message, "errorMessage is gone: error is the message, and marks it invalid");
  }
}

/** `error` with the message, shown only while `isInvalid` holds when that is a condition. */
function errorFrom(invalid: ts.JsxAttribute, message: ts.JsxAttribute, context: Context): string {
  const when = condition(invalid, context);
  const text = valueOf(message)?.getText(context.file) ?? '""';
  return when === undefined
    ? `error=${message.initializer?.getText(context.file) ?? '""'}`
    : `error={${when} ? ${text} : undefined}`;
}

/** The uses of a parameter, and whether each one reads its `target.checked`. */
function checkedUses(arrow: ts.ArrowFunction, name: string): ts.Node[] | undefined {
  const uses: ts.Node[] = [];
  let other = false;
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === name && node.parent !== arrow.parameters[0]) {
      const target = node.parent;
      const checked = target.parent;
      if (
        ts.isPropertyAccessExpression(target) &&
        ["target", "currentTarget"].includes(target.name.text) &&
        ts.isPropertyAccessExpression(checked) &&
        checked.name.text === "checked"
      ) {
        uses.push(checked);
      } else other = true;
    }
    ts.forEachChild(node, visit);
  };
  visit(arrow.body);
  return other ? undefined : uses;
}

/** `Checkbox onChange={(e) => f(e.target.checked)}` is `onChange={f}`: it is handed the new state. */
export function checkboxChange(tag: Tag, component: string, context: Context): void {
  const change = attributeOf(tag, "onChange");
  if (component !== "Checkbox" || change === undefined) return;
  const handler = eventHandler(valueOf(change), context);
  if (handler === undefined) {
    report(context, change, "Checkbox onChange is handed checked, not the event: rewrite it");
    return;
  }
  const { arrow, param, uses } = handler;
  const callee = passedOn(arrow, uses);
  if (callee !== undefined && ts.isIdentifier(callee)) {
    replace(context, arrow, callee.getText(context.file));
    return;
  }
  replace(context, param, "checked");
  for (const use of uses) replace(context, use, "checked");
}

/** An arrow that reads its one parameter only as `p.target.checked`, with those reads. */
function eventHandler(value: ts.Expression | undefined, context: Context) {
  if (value === undefined || !ts.isArrowFunction(value)) return undefined;
  const param = value.parameters[0];
  if (param === undefined || !ts.isIdentifier(param.name)) return undefined;
  const uses = checkedUses(value, param.name.getText(context.file));
  return uses === undefined ? undefined : { arrow: value, param, uses };
}

/** `f` when the arrow is `(e) => f(e.target.checked)` and nothing more. */
function passedOn(arrow: ts.ArrowFunction, uses: readonly ts.Node[]): ts.Expression | undefined {
  const body = arrow.body;
  if (!ts.isCallExpression(body) || body.arguments.length !== 1 || uses.length !== 1) {
    return undefined;
  }
  return body.arguments[0] === uses[0] ? body.expression : undefined;
}

/** `Input icon={<Icon name="search" />}` is `icon="search"`. */
export function inputIcon(tag: Tag, component: string, context: Context): void {
  const icon = attributeOf(tag, "icon");
  if (component !== "Input" || icon === undefined || literalOf(icon) !== undefined) return;
  const value = valueOf(icon);
  const element = value !== undefined && ts.isJsxSelfClosingElement(value) ? value : undefined;
  const name =
    element && componentOf(element, context.imports) === "Icon"
      ? literalOf(attributeOf(element, "name"))
      : undefined;
  if (name === undefined) report(context, icon, 'Input icon takes a name: icon="search"');
  else replace(context, icon, `icon="${name}"`);
}

/** The `{ value, label }` of one literal `<option>`, or undefined when it is not one. */
function optionItem(child: ts.JsxChild, context: Context): string | undefined {
  if (!ts.isJsxElement(child) || child.openingElement.tagName.getText(context.file) !== "option") {
    return undefined;
  }
  const texts = child.children.filter(ts.isJsxText);
  if (texts.length !== child.children.length) return undefined;
  const label = texts
    .map((text) => text.text)
    .join("")
    .trim();
  const value =
    optionValue(attributeOf(child.openingElement, "value"), context) ?? JSON.stringify(label);
  const disabled = attributeOf(child.openingElement, "disabled") ? ", disabled: true" : "";
  return `{ value: ${value}, label: ${JSON.stringify(label)}${disabled} }`;
}

/** An option's value as an item's string: a literal as it is, a number quoted, anything else through `String`. */
function optionValue(value: ts.JsxAttribute | undefined, context: Context): string | undefined {
  const literal = literalOf(value);
  if (literal !== undefined) return JSON.stringify(literal);
  const code = value === undefined ? undefined : valueOf(value);
  if (code === undefined) return undefined;
  return ts.isNumericLiteral(code)
    ? JSON.stringify(code.text)
    : `String(${code.getText(context.file)})`;
}

/** Literal `<option>` children are `items`; any other children are for a person. */
export function selectOptions(tag: Tag, component: string, context: Context): void {
  if (component !== "Select" || !ts.isJsxOpeningElement(tag)) return;
  const children = meaningfulChildren(tag);
  if (children.length === 0) return;
  const items = children.map((child) => optionItem(child, context));
  if (items.some((item) => item === undefined)) {
    report(context, tag, "Select takes items, not children: move the options by hand");
    return;
  }
  context.edits.push({
    start: tag.end - 1,
    end: tag.parent.end,
    text: ` items={[${items.join(", ")}]} />`,
  });
}

/**
 * Outside a `Field` a `Select` is `auto` now, so one with no width outside a `Field` in this file is
 * reported. A `width="auto"` stays: it is right in a `Field` and outside one, and a `Field` in
 * another file is out of sight.
 */
export function selectWidth(tag: Tag, component: string, context: Context): void {
  if (component !== "Select" || attributeOf(tag, "width") !== undefined) return;
  const inField = enclosing(tag, context.imports).some((outer) => outer.name === "Field");
  if (!inField) {
    report(
      context,
      tag,
      'a Select outside a Field fits its choices now: width="full" keeps the row',
    );
  }
}

export const tagRules: readonly TagRule[] = [
  dateErrors,
  checkboxChange,
  inputIcon,
  selectOptions,
  selectWidth,
];
