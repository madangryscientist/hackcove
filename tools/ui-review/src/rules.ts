import type { Context } from "./context.js";
import type { AddedLine } from "./diff.js";
import { importedFromUi, stylingProps } from "./jsx.js";

export type RuleId =
  | "new-css"
  | "style-block"
  | "raw-colour"
  | "dark-variant"
  | "styling-prop"
  | "duplicate-component";

export type Finding = { rule: RuleId; path: string; line: number; message: string };

/** A file a pull request touches: the lines it adds and, for the JSX rule, its whole new text. */
export type ReviewFile = {
  path: string;
  isNew: boolean;
  added: readonly AddedLine[];
  content: string | undefined;
};

const CODE = /\.(?:[cm]?[jt]sx?|astro|vue|svelte|html|mdx)$/;
const STYLESHEET = /\.(?:css|scss|sass|less|styl|pcss)$/;
const NOT_APP_CODE = /(?:\.(?:test|spec)\.[cm]?[jt]sx?|\.d\.ts)$/;

const isCode = (path: string) => CODE.test(path) && !NOT_APP_CODE.test(path);
const isStylesheet = (path: string) => STYLESHEET.test(path);

/** The stock colour utilities `packages/ui/src/palette.test.ts` looks for, with their variants. */
const COLOUR =
  /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|outline|ring|accent|fill|stroke|decoration|divide)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?(?![\w-])/g;
const ARBITRARY_COLOUR =
  /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|outline|ring|accent|fill|stroke|decoration|divide)-\[(?:#[0-9a-fA-F]{3,8}|(?:rgb|hsl|oklch|oklab|color)\([^\]]*\))\]/g;
const DARK = /(?<![\w-])dark:[\w[\]-]/;
const STYLE_BLOCK = /<style[\s>]/i;
const STYLESHEET_SETUP = /^\s*(?:$|@(?:import|source|plugin|config)\b|\/\/)/;
const CSS_COMMENT = /\/\*[\s\S]*?(?:\*\/|$)/g;
const FUNCTION_DECLARATION =
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?|class)\s+([A-Z]\w*)\b/;
const CONST_DECLARATION =
  /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Z]\w*)\b[^=\n]*=\s*(?:async\s*)?(?:\(|function\b|memo\(|forwardRef\(|React\.)/;

const found = (rule: RuleId, file: ReviewFile, line: number, message: string): Finding => ({
  rule,
  path: file.path,
  line,
  message,
});

/** A stylesheet that only wires Tailwind and a theme in (`@import`, `@source`) is the one allowed. */
export function newCss(file: ReviewFile): Finding[] {
  const [first] = file.added;
  const uncommented = file.added
    .map((added) => added.text)
    .join("\n")
    .replace(CSS_COMMENT, "");
  const setupOnly = uncommented.split("\n").every((text) => STYLESHEET_SETUP.test(text));
  if (!file.isNew || !isStylesheet(file.path) || first === undefined || setupOnly) return [];
  return [
    found(
      "new-css",
      file,
      first.line,
      "New stylesheet. Hack Cove apps write no CSS of their own: compose @hackcove/ui parts, and ask hackcove for a part or variant that is missing.",
    ),
  ];
}

export function styleBlocks(file: ReviewFile): Finding[] {
  if (!isCode(file.path)) return [];
  return file.added
    .filter((added) => STYLE_BLOCK.test(added.text))
    .map((added) =>
      found(
        "style-block",
        file,
        added.line,
        "<style> block. Hack Cove apps write no CSS of their own: compose @hackcove/ui parts, and ask hackcove for what is missing.",
      ),
    );
}

export function rawColours(file: ReviewFile, ctx: Context): Finding[] {
  if (!isCode(file.path) && !isStylesheet(file.path)) return [];
  return file.added.flatMap((added) => {
    const used = [...added.text.matchAll(COLOUR), ...added.text.matchAll(ARBITRARY_COLOUR)].map(
      (match) => match[0],
    );
    if (used.length === 0) return [];
    const roles = [...new Set(used.flatMap((utility) => ctx.palette.get(utility) ?? []))];
    const role = roles.length === 0 ? "" : ` (the ${roles.join(", ")} role of the palette)`;
    return [
      found(
        "raw-colour",
        file,
        added.line,
        `Raw colour utility ${used.map((u) => `\`${u}\``).join(", ")}${role}. Colour belongs to the theme and to @hackcove/ui parts; use the part that carries it, or ask hackcove for one.`,
      ),
    ];
  });
}

export function darkVariants(file: ReviewFile): Finding[] {
  if (!isCode(file.path) && !isStylesheet(file.path)) return [];
  return file.added
    .filter((added) => DARK.test(added.text))
    .map((added) =>
      found(
        "dark-variant",
        file,
        added.line,
        "`dark:` variant. A theme decides light or dark; an app never branches on it. Remove the variant.",
      ),
    );
}

export function stylingPropsRule(file: ReviewFile): Finding[] {
  if (!isCode(file.path) || file.content === undefined) return [];
  const addedAt = new Set(file.added.map((added) => added.line));
  return stylingProps(file.content)
    .filter((use) => addedAt.has(use.line))
    .map((use) =>
      found(
        "styling-prop",
        file,
        use.line,
        `\`${use.prop}\` on <${use.component}>. @hackcove/ui components take no styling props: compose the parts, or ask hackcove for the variant you need.`,
      ),
    );
}

function duplicateMessage(name: string): string {
  return `Local component \`${name}\` has the same name as an @hackcove/ui export. If it does the same job, import the Hack Cove one, and if that one does not fit, ask hackcove for what is missing rather than building a look-alike. If it is a different thing, rename it so it is not mistaken for the Hack Cove one.`;
}

export function duplicateComponents(file: ReviewFile, ctx: Context): Finding[] {
  if (!isCode(file.path)) return [];
  const stem = /([^/]+?)(?:\.[^./]+)$/.exec(file.path)?.[1] ?? "";
  const [first] = file.added;
  const byFile =
    file.isNew && first !== undefined && ctx.components.has(stem) && !file.path.endsWith("index.ts")
      ? [found("duplicate-component", file, first.line, duplicateMessage(stem))]
      : [];
  const imported = importedFromUi(file.content ?? "");
  const byDeclaration = file.added.flatMap((added) => {
    const name = (FUNCTION_DECLARATION.exec(added.text) ?? CONST_DECLARATION.exec(added.text))?.[1];
    return name !== undefined && ctx.components.has(name) && !imported.has(name)
      ? [found("duplicate-component", file, added.line, duplicateMessage(name))]
      : [];
  });
  return [...byFile, ...byDeclaration];
}

/** Every layer-1 rule over one file. */
export function reviewFile(file: ReviewFile, ctx: Context): Finding[] {
  return [
    ...newCss(file),
    ...styleBlocks(file),
    ...rawColours(file, ctx),
    ...darkVariants(file),
    ...stylingPropsRule(file),
    ...duplicateComponents(file, ctx),
  ];
}
