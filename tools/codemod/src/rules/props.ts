import type { TagRule } from "../source.js";
import {
  attributeOf,
  attributesOf,
  isOn,
  literalOf,
  nameOf,
  remove,
  rename,
  replace,
} from "../attributes.js";
import { type Context, report, type Tag } from "../source.js";

// The swaps that need nothing but the tag: renames, drops and value maps. Each line is one row of
// the 0.10 to 0.11 table in packages/ui-react/MIGRATING.md.

const STATUS_PAGES = ["NotFound", "ErrorPage", "Offline", "Maintenance", "Forbidden"];
const LAYOUTS = ["PageHeader", "ListLayout", "DetailLayout", "FormLayout", "ProseLayout"];
const DATES = ["DateField", "DateRangePicker"];

/** `[components, old name, new name]`: the attribute keeps its value. */
const RENAMES: readonly (readonly [readonly string[], string, string])[] = [
  [["Checkbox", "Switch", "Radio", ...DATES], "description", "hint"],
  [["RadioGroup", "Radio", ...DATES], "isDisabled", "disabled"],
  [["RadioGroup", "Radio", ...DATES], "isRequired", "required"],
  [["ColourSchemeToggle"], "initial", "defaultValue"],
  [["Field"], "hideLabel", "labelHidden"],
  [["FormRow"], "action", "actions"],
  [["IconButton"], "badge", "count"],
  [["Pill"], "label", "name"],
  [[...LAYOUTS, "CenteredLayout"], "subtitle", "description"],
  [["SidebarLayout"], "rail", "aside"],
  [["SidebarLayout"], "railLabel", "asideLabel"],
  [["FullBleedLayout"], "panel", "aside"],
  [["FullBleedLayout"], "panelLabel", "asideLabel"],
  [["DetailLayout"], "stickyAside", "sticky"],
  [STATUS_PAGES, "action", "actions"],
  [["FilterGroup"], "legend", "label"],
  [["Breadcrumbs"], "crumbs", "items"],
  [["AvatarStack"], "people", "items"],
  [["Container"], "elementRef", "ref"],
  [["NavigationProgress"], "active", "loading"],
  [["StackedBar"], "segments", "items"],
  [["ListRow"], "active", "highlighted"],
  [["ListRow"], "detail", "panel"],
  [["Dialog", "Drawer"], "size", "width"],
  [["Table"], "caption", "label"],
  [["TableHeaderCell"], "srLabel", "label"],
];

/** Any value. */
const ANY = Symbol("any");

/** `[components, name, the value it must have]`: the attribute goes, since 0.11 does it by itself. */
const DROPS: readonly (readonly [readonly string[], string, string | typeof ANY])[] = [
  [["Text"], "color", "secondary"],
  [["Text", "Caption"], "as", "p"],
  [["Icon"], "tone", "inherit"],
  [["Button", "IconButton"], "tone", "default"],
  [["Pill"], "tone", "slate"],
  [["Checkbox"], "align", ANY],
  [["MetaList"], "nowrap", ANY],
  [["ListRow"], "static", ANY],
  [["Card"], "as", "section"],
  [["Card"], "as", "div"],
  [["Table"], "variant", "plain"],
  [["TableCell"], "tone", "default"],
  [STATUS_PAGES, "homeHref", "/"],
  [["FieldDialog"], "inputLabel", ANY],
];

/** `[components, name, old value to new value]`. */
const VALUES: readonly (readonly [readonly string[], string, Readonly<Record<string, string>>])[] =
  [
    [["ProgressBar", "SplitBar", "StatTile"], "tone", { negative: "danger" }],
    [["SplitBar"], "toneA", { negative: "danger" }],
    [["SplitBar"], "toneB", { negative: "danger" }],
    [
      ["Pill"],
      "tone",
      {
        amber: "warn",
        emerald: "positive",
        blue: "info",
        red: "danger",
        violet: "accent",
        sky: "info",
      },
    ],
  ];

const applies = (components: readonly string[], name: string) => components.includes(name);

export function renames(tag: Tag, component: string, context: Context): void {
  for (const [components, from, to] of RENAMES) {
    if (!applies(components, component)) continue;
    const attribute = attributeOf(tag, from);
    if (attribute !== undefined) rename(context, attribute, to);
  }
}

export function drops(tag: Tag, component: string, context: Context): void {
  for (const [components, name, value] of DROPS) {
    if (!applies(components, component)) continue;
    const attribute = attributeOf(tag, name);
    if (attribute === undefined) continue;
    if (value === ANY || literalOf(attribute) === value) remove(context, attribute);
  }
}

export function values(tag: Tag, component: string, context: Context): void {
  for (const [components, name, map] of VALUES) {
    if (!applies(components, component)) continue;
    const attribute = attributeOf(tag, name);
    const to = map[literalOf(attribute) ?? ""];
    if (attribute !== undefined && to !== undefined) replace(context, attribute, `${name}="${to}"`);
  }
}

/** The old values a tone gave up, by `component.attribute`: from the drops and the value maps. */
const GONE = new Map<string, string[]>();
for (const [components, name, value] of DROPS) {
  if (value === ANY || name !== "tone") continue;
  for (const component of components) GONE.set(`${component}.${name}`, [value]);
}
for (const [components, name, map] of VALUES) {
  for (const component of components) {
    const key = `${component}.${name}`;
    GONE.set(key, [...(GONE.get(key) ?? []), ...Object.keys(map)]);
  }
}

/** A tone set from code may hold a value that is gone; the codemod cannot see it, so it reports it. */
export function heldTones(tag: Tag, component: string, context: Context): void {
  for (const attribute of attributesOf(tag)) {
    const gone = GONE.get(`${component}.${nameOf(attribute)}`);
    if (gone === undefined || literalOf(attribute) !== undefined) continue;
    const list = gone.map((value) => `"${value}"`).join(" or ");
    report(
      context,
      attribute,
      `${component} ${nameOf(attribute)} is set in code: check it is never ${list}`,
    );
  }
}

/** `Cluster wrap` is the default now; a bare one (or `={true}`) goes. */
export function clusterWrap(tag: Tag, component: string, context: Context): void {
  const wrap = attributeOf(tag, "wrap");
  if (component === "Cluster" && wrap !== undefined && isOn(wrap)) remove(context, wrap);
}

/** The attributes of a tag by name, for rules that read several. */
export function attributeNames(tag: Tag): Set<string> {
  return new Set(attributesOf(tag).map(nameOf));
}

export const tagRules: readonly TagRule[] = [renames, drops, values, heldTones, clusterWrap];
