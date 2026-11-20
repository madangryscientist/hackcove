/**
 * The anti-slop rules Oxlint has no rule for, as one pure function so they can be tested:
 * a TODO/FIXME with no ticket ref, commented-out code, and anything time dependent, which read
 * only TypeScript, and an em or en dash, which reads every file (copy, CSS, docs, scripts). Docs
 * prose (the site's component pages, a README) calls the palette's purple the accent. In a
 * `@slashsuite/ui-react` component it also holds the palette: a stock colour utility the themes do not
 * remap (one outside `palette.json`), or one behind an arbitrary `[&...]` variant, which no theme can
 * reach; and the content width and side padding outside `Container`. `check-slop.ts` globs the files and prints what this returns.
 */

const TODO_WITHOUT_REF = /\b(TODO|FIXME|XXX|HACK)\b(?!\s*\((?:ob\s*)?#?[\w-]*\d+\))/;
// Two signals, so prose does not trip it: a statement keyword AND a trailing ; { } or ).
const CODE_IN_COMMENT =
  /^\s*\/\/\s*(?:const|let|var|import|export|return|await|if|for|while|function|throw)\b.*[;{})]\s*$/;

// A component renders from the value it is given, and a test passes that value and asserts what
// renders: nothing waits on elapsed time. A timer is bare when it is the global one (or reached
// through `window`, `globalThis` or `self`), so a method of the same name, Playwright's
// `test.setTimeout` (the test's own time limit), does not hit.
const BARE_TIMER = /(?:^|[^\w$.])(?:(?:window|globalThis|self)\.)?set(?:Timeout|Interval)\s*\(/;
/** A fake or waited-on clock, in any file, a test harness included: Vitest's and Playwright's. */
const FAKE_CLOCK =
  /\b(?:useFakeTimers|advanceTimers\w*|runAllTimers\w*|runOnlyPendingTimers\w*|setSystemTime|waitForTimeout)\b|\.clock\.(?:install|runFor|fastForward|pauseAt|resume|setFixedTime|setSystemTime)\(/;
/** A line with this comment, or the line under it, is exempt; the reason is required. */
const EXEMPT = /\/\/.*\btime-dependent:\s*\S/;

/** An em dash (U+2014) or an en dash (U+2013), written as escapes so this file is clean. */
const DASH = /[\u2013\u2014]/;
const DASH_RULE =
  'em or en dash; rewrite with a full stop, comma, colon or brackets (a range is "to")';

const TIME_RULE =
  "time dependent; render from the value given and assert without a clock (CSS for a delay), or say why with `// time-dependent: <why>`";

// The stock colour utilities a theme remaps, with their variants (`hover:bg-slate-50`, `bg-black/90`).
const COLOUR =
  /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|outline|ring|accent|fill|stroke|decoration|divide)-(?:white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?(?![\w-])/g;
const BEHIND_ARBITRARY = new RegExp(`\\[[^\\]\\s]+\\]:(?:[a-z-]+:)*${COLOUR.source}`, "g");

/** The palette hits on one line of a component: each utility outside `palette`, and each behind `[&...]`. */
function paletteHits(line: string, palette: ReadonlySet<string>): string[] {
  const outside = (line.match(COLOUR) ?? [])
    .filter((utility) => !palette.has(utility))
    .map((utility) => `${utility} is not in palette.json; a new colour is a palette change`);
  const arbitrary = (line.match(BEHIND_ARBITRARY) ?? []).map(
    (utility) => `${utility} sits behind an arbitrary variant, which no theme remaps`,
  );
  return [...outside, ...arbitrary];
}

// The content width and side padding belong to `Container` alone; a component that wants them
// renders one instead of copying its classes.
const CONTENT_EDGE = /max-w-6xl|px-4 sm:px-6/;

// The palette's names are the theme's: the purple ink is the accent in every theme, so docs prose
// that calls it violet is wrong in all but one. A value in backticks (`violet`) is code and passes.
// Both names while consumers move to @slashsuite: a package still named @hackcove/ui-react is the same library.
const UI_REACT = new Set(["@slashsuite/ui-react", "@hackcove/ui-react"]);

const VIOLET = /(?<![\w-])violet(?![\w-])/i;
const VIOLET_RULE = '"violet" in prose; the palette calls it accent';
/** The component docs, the site's words and any package README: prose a reader takes the palette's names from. */
const isDocsProse = (path: string, pkg: string): boolean =>
  path === "README.md" ||
  path.endsWith("/README.md") ||
  (UI_REACT.has(pkg) && path.startsWith("docs/")) ||
  (pkg === "hack-cove-site" && path.startsWith("src/content/"));
const outsideBackticks = (line: string): string => line.replace(/`[^`]*`/g, "``");

const isTest = (path: string): boolean =>
  /\.test\.tsx?$/.test(path) ||
  path.endsWith(".stories.tsx") ||
  path.startsWith("e2e/") ||
  path.startsWith("test/");

/** What the rules need to know about one file, worked out once. */
type FileKind = {
  path: string;
  /** TypeScript: every rule but the dash and "violet" reads only these. */
  code: boolean;
  test: boolean;
  component: boolean;
  /** The palette to hold a component's `.tsx` to; undefined when the palette rule does not apply. */
  palette: ReadonlySet<string> | undefined;
  prose: boolean;
};

/** The rules that read every file: a dash, and "violet" in docs prose. */
function anyFileHits(line: string, file: FileKind): string[] {
  const hits: string[] = [];
  if (DASH.test(line)) hits.push(DASH_RULE);
  if (file.prose && VIOLET.test(outsideBackticks(line))) hits.push(VIOLET_RULE);
  return hits;
}

/** A component's palette and content edge. */
function componentHits(line: string, file: FileKind): string[] {
  const hits = file.palette === undefined ? [] : paletteHits(line, file.palette);
  if (file.component && file.path !== "src/Container.tsx" && CONTENT_EDGE.test(line))
    hits.push("the content width and side padding are Container's; render a Container");
  return hits;
}

/** A TODO with no ticket ref and commented-out code. */
function commentHits(line: string): string[] {
  const hits: string[] = [];
  if (TODO_WITHOUT_REF.test(line)) hits.push("TODO/FIXME needs a ticket ref, e.g. TODO(#123)");
  if (CODE_IN_COMMENT.test(line)) hits.push("commented-out code; delete it (git keeps it)");
  return hits;
}

/** A fake clock anywhere, or a bare timer in a test or a component, unless the line is exempt. */
function timeHits(line: string, previous: string, file: FileKind): string[] {
  if (EXEMPT.test(line) || EXEMPT.test(previous)) return [];
  const timed = FAKE_CLOCK.test(line) || ((file.test || file.component) && BARE_TIMER.test(line));
  return timed ? [TIME_RULE] : [];
}

/** Every message for one line, in the order the rules are listed above. */
function lineHits(line: string, previous: string, file: FileKind): string[] {
  const hits = anyFileHits(line, file);
  if (!file.code) return hits;
  return [
    ...hits,
    ...componentHits(line, file),
    ...commentHits(line),
    ...timeHits(line, previous, file),
  ];
}

/**
 * Each hit as `path:line: message`. `path` is relative to the package; `pkg` is its `name`.
 * `palette` is every utility `packages/ui-react/palette.json` lists, for `@slashsuite/ui-react`.
 */
export function slopRules(
  path: string,
  text: string,
  pkg: string,
  palette?: ReadonlySet<string>,
): string[] {
  const test = isTest(path);
  const component = UI_REACT.has(pkg) && path.startsWith("src/") && !test;
  const file: FileKind = {
    path,
    code: /\.tsx?$/.test(path),
    test,
    component,
    palette: component && path.endsWith(".tsx") ? palette : undefined,
    prose: isDocsProse(path, pkg),
  };
  const lines = text.split("\n");
  return lines.flatMap((line, i) =>
    lineHits(line, lines[i - 1] ?? "", file).map((message) => `${path}:${i + 1}: ${message}`),
  );
}
