import { attributeOf, isOn, literalOf, remove, replace, valueOf } from "../attributes.js";
import { type Context, report, type Tag, type TagRule } from "../source.js";

/** `ListLayout isEmpty` goes: `empty` shows when there are no children. */
export function listEmpty(tag: Tag, component: string, context: Context): void {
  const isEmpty = attributeOf(tag, "isEmpty");
  if (component !== "ListLayout" || isEmpty === undefined) return;
  remove(context, isEmpty);
  report(context, isEmpty, "isEmpty is gone: check empty shows when the list has no children");
}

/** `AppShell hideChromeInPrint` is `printChrome={false}`; every shell is reported for its density. */
export function appShell(tag: Tag, component: string, context: Context): void {
  if (component !== "AppShell") return;
  const hide = attributeOf(tag, "hideChromeInPrint");
  if (hide !== undefined) {
    const when = valueOf(hide)?.getText(context.file);
    replace(
      context,
      hide,
      isOn(hide) ? "printChrome={false}" : `printChrome={!(${when ?? "false"})}`,
    );
  }
  if (attributeOf(tag, "density") === undefined) {
    report(context, tag, 'text is 1rem now: set density="compact" to keep the old size');
  }
}

/** `Tabs` takes its look from `orientation`: `variant` goes, and so does `size` across. */
export function tabsVariant(tag: Tag, component: string, context: Context): void {
  if (component !== "Tabs") return;
  const vertical = literalOf(attributeOf(tag, "orientation")) === "vertical";
  const variant = attributeOf(tag, "variant");
  if (variant !== undefined) {
    remove(context, variant);
    if (!vertical && literalOf(variant) !== "underline") {
      report(context, variant, "a Tabs row across is underline now: the pill look is gone");
    }
  }
  const size = attributeOf(tag, "size");
  if (!vertical && size !== undefined) remove(context, size);
}

export const tagRules: readonly TagRule[] = [listEmpty, appShell, tabsVariant];
