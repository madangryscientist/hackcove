/**
 * The contrast contract, as data: which palette utilities are measured against which, and the
 * bar each pair must clear. Everything is chosen by the palette's role (`ink`, `accent`, `danger`,
 * …) and by the utility's own shape, never by a theme's name, so a new theme is held to it with
 * no edit here. A utility the contract neither measures nor exempts fails the check
 * (`contrast.ts`), so a palette change cannot slip past it unmeasured.
 */

/** Role name to the Tailwind utilities `packages/ui-react/palette.json` lists for it. */
export type Palette = Record<string, readonly string[]>;

/** WCAG 2.x AA for text. */
export const TEXT_BAR = 4.5;
/** WCAG 2.x AA for large text, and for the parts of a control or graphic that identify it. */
export const UI_BAR = 3;

/**
 * One family of pairs. Every `fg` is painted on every `on` stack; a stack is a list of background
 * utilities, bottom layer first (`["bg-black/90", "hover:bg-white/10"]`). A stack that starts
 * translucent is laid over each of `base` in turn, so a tint is measured on every surface it can
 * sit on.
 */
export type Rule = {
  name: string;
  bar: number;
  fg: string[];
  on: string[][];
  base: string[];
};

/** A group of palette utilities held to no bar, and why. */
export type Exemption = { role: string; match: RegExp; why: string };

/**
 * What the contract does not measure, by role, with the reason. WCAG 1.4.3 and 1.4.11 bind text and
 * the parts of a control that identify it; they do not bind decoration or a disabled control.
 */
export const EXEMPTIONS: readonly Exemption[] = [
  {
    role: "scrim",
    match: /^/,
    why: "the dimming veil behind a modal: a decorative wash, not text or a control edge",
  },
  {
    role: "media-matte",
    match: /^/,
    why: "the white mat under a QR code or a logo: it carries no text, the picture on it is the consumer's own, and a scanner needs it white (themes.test.ts keeps it white in every theme)",
  },
  {
    role: "ink",
    match: /^text-slate-300$/,
    why: "dimmed text of an inactive item (a calendar day outside the month, a disabled day): WCAG 1.4.3 exempts inactive components",
  },
  {
    role: "line",
    match: /^border-slate-(?:50|100|200)(?:\/\d+)?$/,
    why: "hairline dividers and card edges: decorative, the content and the fills carry the structure (WCAG 1.4.11 asks 3:1 only of the edge that identifies a control, which is border-slate-300)",
  },
  {
    role: "subtle",
    match: /^border-slate-50$/,
    why: "the avatar-stack ring takes the page colour on purpose; it is a gap, not an edge",
  },
  {
    role: "any",
    match: /^border-(?:emerald|amber|blue)-200$/,
    why: "the tinted edge of a callout or an outline button: its words and fill carry the meaning (the invalid field's edge, border-red-200, is held to 3:1 below)",
  },
  {
    role: "identity",
    match: /^bg-/,
    why: "an avatar's fill is identified by its initials, which are held to AA on it; the fill itself needs no edge contrast",
  },
];

const isBackground = (utility: string): boolean => /^(?:[\w-]+:)*bg-/.test(utility);
const roleOf = (palette: Palette, ...roles: string[]): string[] =>
  roles.flatMap((role) => palette[role] ?? []);
const stacks = (utilities: string[]): string[][] => utilities.map((utility) => [utility]);

/**
 * The surfaces page content sits on. `inset` is a hover, pressed or active fill, so it carries
 * neutral ink (`wide`) but not tone text, muted text or a control edge (`narrow`).
 */
function surfaces(palette: Palette) {
  const wide = roleOf(palette, "canvas", "surface", "subtle", "inset").filter(isBackground);
  const narrow = roleOf(palette, "canvas", "surface", "subtle").filter(isBackground);
  return { wide, narrow };
}

const TONES = ["accent", "positive", "warn", "danger", "info", "sky"] as const;

/** The rules for one tone role: its text, its labels, its edges, measured on what they sit on. */
function toneRules(palette: Palette, role: string, narrow: string[]): Rule[] {
  const own = roleOf(palette, role);
  const pick = (pattern: RegExp): string[] => own.filter((utility) => pattern.test(utility));
  const text = pick(/^(?:hover:)?text-[a-z]+-(?:600|700|800|900)$/);
  const soft = stacks(pick(/^(?:hover:)?bg-[a-z]+-50$/));
  const solid = stacks(pick(/^(?:hover:)?bg-[a-z]+-(?:600|700)$/));
  const edges = pick(/^(?:[\w-]+:)?border-[a-z]+-(?:400|600)$/);
  const label = pick(/^text-[a-z]+-50$/);
  return [
    { name: `${role} text`, bar: TEXT_BAR, fg: text, on: stacks(narrow), base: narrow },
    { name: `${role} text on its tint`, bar: TEXT_BAR, fg: text, on: soft, base: narrow },
    { name: `${role} label on its fill`, bar: TEXT_BAR, fg: label, on: solid, base: narrow },
    { name: `${role} control edge`, bar: UI_BAR, fg: edges, on: stacks(narrow), base: narrow },
    {
      name: `${role} focus ring and native control`,
      bar: UI_BAR,
      fg: pick(/(?:^|:)(?:outline|accent)-/),
      on: stacks(narrow),
      base: narrow,
    },
  ];
}

/** The invalid field's edge is the one tinted edge that must be seen: nothing else marks it. */
function invalidEdge(palette: Palette, narrow: string[]): Rule {
  const danger = roleOf(palette, "danger");
  return {
    name: "invalid field edge",
    bar: UI_BAR,
    fg: danger.filter((utility) => /^border-[a-z]+-200$/.test(utility)),
    on: stacks(narrow),
    base: narrow,
  };
}

/** The media scrim is dark in every theme; its light text and focus ring are measured on it. */
function scrimRules(palette: Palette, narrow: string[]): Rule[] {
  const own = roleOf(palette, "media-scrim");
  const scrim = own.filter((utility) => utility.startsWith("bg-"));
  const lit = own.filter((utility) => utility.startsWith("hover:bg-"));
  const on = [
    ...scrim.map((fill) => [fill]),
    ...scrim.flatMap((fill) => lit.map((tint) => [fill, tint])),
  ];
  return [
    {
      name: "media scrim text",
      bar: TEXT_BAR,
      fg: own.filter((utility) => utility.startsWith("text-")),
      on,
      base: narrow,
    },
    {
      name: "media scrim focus ring",
      bar: UI_BAR,
      fg: own.filter((utility) => /outline-/.test(utility)),
      on,
      base: narrow,
    },
  ];
}

/**
 * The hero's text over its glow (`Hero`). The glow is decoration, a translucent wash with no text or
 * edge of its own, so it is never held to a bar itself: it is measured only as what the hero's text
 * sits on. Its title (`text-slate-900`), lede (`text-slate-600`) and overline (`text-slate-500`),
 * and the accent text of the outline and ghost buttons and links in its actions, are held to AA
 * over the page canvas and a card's surface (what a page's top block sits on) with each
 * ribbon on it, and with all of them stacked, where they overlap. Each is taken at the full strength
 * the theme gives it; the blur only softens it.
 */
function glowRules(palette: Palette): Rule[] {
  const glow = roleOf(palette, "glow").filter(isBackground);
  if (glow.length === 0) return [];
  return [
    {
      name: "hero text over the glow",
      bar: TEXT_BAR,
      fg: [
        ...roleOf(palette, "ink").filter((utility) => /^text-slate-(?:900|600|500)$/.test(utility)),
        ...roleOf(palette, "accent").filter((utility) =>
          /^(?:hover:)?text-[a-z]+-(?:600|700)$/.test(utility),
        ),
      ],
      on: glow.length > 1 ? [...stacks(glow), glow] : stacks(glow),
      base: roleOf(palette, "canvas", "surface").filter(isBackground),
    },
  ];
}

/** Every rule of the contract for this palette. */
export function rulesFor(palette: Palette): Rule[] {
  const { wide, narrow } = surfaces(palette);
  const ink = roleOf(palette, "ink");
  const identity = roleOf(palette, "identity");
  const accentLabel = roleOf(palette, "accent").filter((utility) =>
    /^text-[a-z]+-50$/.test(utility),
  );
  return [
    {
      name: "ink text",
      bar: TEXT_BAR,
      fg: ink.filter((utility) => !/slate-(?:400|300)$/.test(utility)),
      on: stacks(wide),
      base: wide,
    },
    {
      name: "muted and placeholder text",
      bar: TEXT_BAR,
      fg: ink.filter((utility) => utility.endsWith("slate-400")),
      on: stacks(narrow),
      base: narrow,
    },
    {
      name: "neutral control edge",
      bar: UI_BAR,
      fg: roleOf(palette, "line").filter((utility) => /^border-slate-300$/.test(utility)),
      on: stacks(narrow),
      base: narrow,
    },
    { name: "avatar initials", bar: TEXT_BAR, fg: accentLabel, on: stacks(identity), base: narrow },
    {
      name: "chart colour",
      bar: UI_BAR,
      fg: roleOf(palette, "viz"),
      on: stacks(narrow),
      base: narrow,
    },
    ...TONES.flatMap((role) => toneRules(palette, role, narrow)),
    invalidEdge(palette, narrow),
    ...scrimRules(palette, narrow),
    ...glowRules(palette),
  ];
}
