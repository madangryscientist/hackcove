/**
 * D2 spike: a ui class string → React Native styles, for one theme map.
 *
 * - Colour utilities come from the generated theme map (themes.json), so a theme reskins native
 *   exactly as it reskins the web: by remapping the same utility.
 * - Layout and type utilities come from Tailwind's fixed scale, here (they are not themed).
 * - `hover:` → the pressed slot, `focus-visible:` → focused, `disabled:` → disabled,
 *   `placeholder:` → placeholderTextColor.
 * - Every resolved style is split into a `box` part (View) and a `text` part (Text) by property,
 *   standing in for CSS inheritance: a <button>'s `text-sm text-violet-50` reach its label.
 * - A class that is neither resolved nor on the web-only drop list throws: the set is closed.
 */
import type { TextStyle, ViewStyle } from "react-native";

export type RNStyle = Record<string, string | number>;
export type ThemeMap = {
  scheme: "light" | "dark";
  scope: string | null;
  base: { backgroundColor: string | null; color: string | null; fontFamily: string | null };
  utilities: Record<string, RNStyle>;
  compounds: { utility: string; requiresAny: string[]; style: RNStyle }[];
};

export const SLOTS = ["idle", "pressed", "focused", "disabled"] as const;
export type Slot = (typeof SLOTS)[number];
export type Resolved = {
  box: Record<Slot, ViewStyle>;
  text: Record<Slot, TextStyle>;
  placeholderTextColor: string | undefined;
  /** Classes dropped as web-only, for the report. */
  dropped: string[];
};

const VARIANT_SLOT: Record<string, Slot | "placeholder"> = {
  hover: "pressed",
  "focus-visible": "focused",
  disabled: "disabled",
  placeholder: "placeholder",
};

/** Web-only: transitions, cursors, scroll and :target, layering, arbitrary descendant variants. */
const DROP = [
  /^transition/,
  /^cursor-/,
  /^scroll-mt-/,
  /^target:/,
  /^\[&/,
  /^\*:/,
  /^relative$/,
  /^z-\d+$/,
  /^disabled:pointer-events-none$/,
  /^underline-offset-\d+$/,
  /^max-w-\[\d+ch\]$/, // a measure on wide screens; a phone column is narrower than 72ch
];

const TEXT_PROPS = new Set([
  "color",
  "fontSize",
  "lineHeight",
  "fontWeight",
  "letterSpacing",
  "textTransform",
  "textAlign",
  "textDecorationLine",
  "fontFamily",
  "fontStyle",
  "fontVariant",
]);

const SPACE = (n: string) => Number(n) * 4;
const FONT: Record<string, [number, number]> = {
  xs: [12, 16],
  sm: [14, 20],
  base: [16, 24],
  lg: [18, 28],
  xl: [20, 28],
  "2xl": [24, 32],
  "3xl": [30, 36],
};
const WEIGHT: Record<string, string> = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};
const TRACKING: Record<string, number> = { tight: -0.025, normal: 0, wide: 0.025 }; // em
const RADIUS: Record<string, number> = {
  "": 4,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  full: 9999,
};
const SPACING_PROP: Record<string, string[]> = {
  p: ["padding"],
  px: ["paddingHorizontal"],
  py: ["paddingVertical"],
  pt: ["paddingTop"],
  pb: ["paddingBottom"],
  pl: ["paddingLeft"],
  pr: ["paddingRight"],
  m: ["margin"],
  mx: ["marginHorizontal"],
  my: ["marginVertical"],
  mt: ["marginTop"],
  mb: ["marginBottom"],
  gap: ["gap"],
};
/** Tailwind v4 `shadow-sm`, which New Architecture RN takes as a CSS box-shadow string. */
const SHADOW: Record<string, string> = {
  "shadow-sm": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
};

/** Layout, type and effect utilities: Tailwind's fixed scale, the same in every theme. */
function staticUtility(c: string): RNStyle | null {
  let m: RegExpExecArray | null;
  if (c === "flex") return { display: "flex", flexDirection: "row" }; // CSS flex is a row; RN's default is a column
  // An RN parent is always a flex container, where CSS aligns an inline-flex item by the parent's
  // align-items too. The block/inline-flow case (shrink to content) has no RN equivalent: the
  // caller's container decides, so a Button in a column Stack stretches unless the parent says not.
  if (c === "inline-flex") return { flexDirection: "row" };
  if (c === "flex-col") return { flexDirection: "column" };
  if (c === "flex-wrap") return { flexWrap: "wrap" };
  if ((m = /^items-(center|start|end|baseline|stretch)$/.exec(c)))
    return {
      alignItems: {
        center: "center",
        start: "flex-start",
        end: "flex-end",
        baseline: "baseline",
        stretch: "stretch",
      }[m[1]!]!,
    };
  if ((m = /^justify-(center|start|end|between)$/.exec(c)))
    return {
      justifyContent: {
        center: "center",
        start: "flex-start",
        end: "flex-end",
        between: "space-between",
      }[m[1]!]!,
    };
  if (c === "w-full") return { alignSelf: "stretch" };
  if ((m = /^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|gap)-(\d+(?:\.\d+)?)$/.exec(c)))
    return Object.fromEntries(SPACING_PROP[m[1]!]!.map((p) => [p, SPACE(m![2]!)]));
  if ((m = /^rounded(?:-(sm|md|lg|xl|2xl|full))?$/.exec(c)))
    return { borderRadius: RADIUS[m[1] ?? ""]! };
  if (c === "border") return { borderWidth: 1, borderStyle: "solid" };
  if (c === "border-b") return { borderBottomWidth: 1 };
  if (c === "border-dashed") return { borderStyle: "dashed" };
  if ((m = /^text-(xs|sm|base|lg|xl|2xl|3xl)(?:\/(\d+))?$/.exec(c))) {
    const [size, lh] = FONT[m[1]!]!;
    return { fontSize: size, lineHeight: m[2] ? SPACE(m[2]) : lh };
  }
  if ((m = /^font-(normal|medium|semibold|bold)$/.exec(c))) return { fontWeight: WEIGHT[m[1]!]! };
  if ((m = /^tracking-(tight|normal|wide)$/.exec(c))) return { letterSpacingEm: TRACKING[m[1]!]! };
  if (c === "uppercase") return { textTransform: "uppercase" };
  if (c === "underline") return { textDecorationLine: "underline" };
  if ((m = /^opacity-(\d+)$/.exec(c))) return { opacity: Number(m[1]) / 100 };
  if ((m = /^outline-(\d)$/.exec(c))) return { outlineWidth: Number(m[1]), outlineStyle: "solid" };
  if ((m = /^outline-offset-(\d)$/.exec(c))) return { outlineOffset: Number(m[1]) };
  if (c in SHADOW) return { boxShadow: SHADOW[c]! };
  return null;
}

/** Colours outside the palette that a component may still use; the same in every theme. */
const FIXED_COLOUR: Record<string, RNStyle> = {
  "border-transparent": { borderColor: "transparent" },
  "bg-transparent": { backgroundColor: "transparent" },
};

export function resolve(classString: string, theme: ThemeMap): Resolved {
  const slot: Record<Slot, RNStyle> = { idle: {}, pressed: {}, focused: {}, disabled: {} };
  let placeholderTextColor: string | undefined;
  const dropped: string[] = [];
  const classes = classString.split(/\s+/).filter(Boolean);

  for (const c of classes) {
    if (DROP.some((d) => d.test(c))) {
      dropped.push(c);
      continue;
    }
    const themed = theme.utilities[c] ?? FIXED_COLOUR[c];
    const v = /^([a-z-]+):(.+)$/.exec(c);
    const target = v ? VARIANT_SLOT[v[1]!] : "idle";
    if (target === undefined)
      throw new Error(`useStyles: no native slot for the variant in "${c}"`);
    const style = themed ?? staticUtility(v ? v[2]! : c);
    if (style === null) throw new Error(`useStyles: unknown class "${c}"`);
    if (target === "placeholder") {
      placeholderTextColor = String(style.color);
      continue;
    }
    Object.assign(slot[target], style);
  }

  // A theme rule keyed on two classes at once (Mocha's flat plain-disabled solid Button).
  for (const k of theme.compounds)
    if (classes.includes(k.utility) && k.requiresAny.some((r) => classes.includes(r)))
      Object.assign(slot.disabled, k.style);

  const box = {} as Record<Slot, ViewStyle>;
  const text = {} as Record<Slot, TextStyle>;
  for (const s of SLOTS) {
    const b: RNStyle = {};
    const t: RNStyle = {};
    const own = slot[s];
    for (const [k, val] of Object.entries(own)) {
      if (k === "letterSpacingEm") continue;
      (TEXT_PROPS.has(k) ? t : b)[k] = val;
    }
    if ("letterSpacingEm" in own) {
      const size = Number(own.fontSize ?? slot.idle.fontSize ?? 16);
      t.letterSpacing = Number(own.letterSpacingEm) * size;
    }
    box[s] = b as ViewStyle;
    text[s] = t as TextStyle;
  }
  return { box, text, placeholderTextColor, dropped };
}

/** The style for a state: idle, then each active state slot over it (CSS source order: hover, focus, disabled). */
export function pick(
  r: Resolved,
  state: { pressed?: boolean; focused?: boolean; disabled?: boolean } = {},
): { box: ViewStyle; text: TextStyle } {
  const on: Slot[] = ["idle"];
  if (state.pressed && !state.disabled) on.push("pressed");
  if (state.focused) on.push("focused");
  if (state.disabled) on.push("disabled");
  return {
    box: Object.assign({}, ...on.map((s) => r.box[s])),
    text: Object.assign({}, ...on.map((s) => r.text[s])),
  };
}
