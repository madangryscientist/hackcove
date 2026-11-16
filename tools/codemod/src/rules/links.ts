import ts from "typescript";
import { attributeOf, literalOf, nameOf, remove, replace, valueOf } from "../attributes.js";
import { type Context, report, type Tag, type TagRule } from "../source.js";

/** The parts whose `render` gave way to a plain `href`. */
const LINKED = ["Button", "IconButton", "TextLink", "Pill", "Card", "ListRow", "AppShellBrand"];
const STATUS_PAGES = ["NotFound", "ErrorPage", "Offline", "Maintenance", "Forbidden"];

function unwrap(node: ts.Expression): ts.Expression {
  return ts.isParenthesizedExpression(node) ? unwrap(node.expression) : node;
}

/** The element a one-parameter arrow returns, `(p) => <Link … />`. */
function linkElement(node: ts.Expression | undefined): ts.JsxSelfClosingElement | undefined {
  const arrow = node === undefined ? undefined : unwrap(node);
  if (arrow === undefined || !ts.isArrowFunction(arrow) || arrow.parameters.length !== 1) {
    return undefined;
  }
  const body = ts.isBlock(arrow.body) ? undefined : unwrap(arrow.body);
  return body !== undefined && ts.isJsxSelfClosingElement(body) ? body : undefined;
}

/**
 * The path a `render` arrow links to, when it is `(p) => <Link to="/x" {...p} />` or
 * `(p) => <a href="/x" {...p} />` and nothing else; undefined for any other shape.
 */
export function linkTarget(node: ts.Expression | undefined): string | undefined {
  const body = linkElement(node);
  if (body === undefined) return undefined;
  const props = body.attributes.properties;
  const named = props.filter(ts.isJsxAttribute);
  const spreads = props.filter(ts.isJsxSpreadAttribute);
  const only = named[0];
  if (named.length !== 1 || spreads.length !== 1 || only === undefined) return undefined;
  const key = nameOf(only);
  return key === "to" || key === "href" ? literalOf(only) : undefined;
}

/** `render={(p) => <Link to="/x" {...p} />}` is `href="/x"`. */
export function renderToHref(tag: Tag, component: string, context: Context): void {
  const render = attributeOf(tag, "render");
  if (render === undefined || !LINKED.includes(component)) return;
  const target = linkTarget(valueOf(render));
  if (target === undefined) {
    report(context, render, `${component} render is gone: give it an href, by hand`);
  } else if (attributeOf(tag, "href") === undefined) {
    replace(context, render, `href="${target}"`);
  } else {
    remove(context, render);
  }
}

/** A status page links home by itself: a `renderHome` to `/` goes, and any other home is reported. */
export function statusHome(tag: Tag, component: string, context: Context): void {
  if (!STATUS_PAGES.includes(component)) return;
  const home = attributeOf(tag, "renderHome");
  if (home !== undefined) {
    if (linkTarget(valueOf(home)) === "/") remove(context, home);
    else report(context, home, "renderHome is gone: set LinkProvider home once, by hand");
  }
  const href = attributeOf(tag, "homeHref");
  if (href !== undefined && literalOf(href) !== "/") {
    report(context, href, "homeHref is gone: set LinkProvider home once, by hand");
  }
}

/** The object literals of an inline `items` (or `crumbs`) array. */
function inlineItems(attribute: ts.JsxAttribute | undefined): ts.ObjectLiteralExpression[] {
  const value = attribute === undefined ? undefined : valueOf(attribute);
  if (value === undefined || !ts.isArrayLiteralExpression(value)) return [];
  return value.elements.filter(ts.isObjectLiteralExpression);
}

function property(item: ts.ObjectLiteralExpression, name: string, context: Context) {
  return item.properties.find(
    (part): part is ts.PropertyAssignment =>
      ts.isPropertyAssignment(part) && part.name.getText(context.file) === name,
  );
}

/** The attribute that holds a part's link items. */
function itemsOf(tag: Tag, component: string): ts.JsxAttribute | undefined {
  if (component === "Breadcrumbs") return attributeOf(tag, "items") ?? attributeOf(tag, "crumbs");
  if (component === "Tabs" || component === "SegmentedControl") return attributeOf(tag, "items");
  return undefined;
}

/** In inline crumbs and link items: `render` to a literal path is `href`, and `active` is `selected`. */
export function linkItems(tag: Tag, component: string, context: Context): void {
  for (const item of inlineItems(itemsOf(tag, component))) {
    const render = property(item, "render", context);
    if (render !== undefined) {
      const target = linkTarget(render.initializer);
      if (target === undefined)
        report(context, render, "an item's render is gone: give it an href");
      else replace(context, render, `href: "${target}"`);
    }
    const active = property(item, "active", context);
    if (active !== undefined && component !== "Breadcrumbs")
      replace(context, active.name, "selected");
  }
}

export const tagRules: readonly TagRule[] = [renderToHref, statusHome, linkItems];
