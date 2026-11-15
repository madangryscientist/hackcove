/**
 * The anti-slop rules Oxlint has no rule for, as one pure function so they can be tested:
 * a TODO/FIXME with no ticket ref, commented-out code, and anything time dependent, which read
 * only TypeScript, and an em or en dash, which reads every file (copy, CSS, docs, scripts).
 * `check-slop.ts` globs the files and prints what this returns.
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

const isTest = (path: string): boolean =>
  /\.test\.tsx?$/.test(path) ||
  /\.stories\.tsx$/.test(path) ||
  path.startsWith("e2e/") ||
  path.startsWith("test/");

/** Each hit as `path:line: message`. `path` is relative to the package; `pkg` is its `name`. */
export function slopRules(path: string, text: string, pkg: string): string[] {
  const code = /\.tsx?$/.test(path);
  const test = isTest(path);
  const component = pkg === "@hackcove/ui-react" && path.startsWith("src/") && !test;
  const hits: string[] = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    const at = `${path}:${i + 1}`;
    if (DASH.test(line)) hits.push(`${at}: ${DASH_RULE}`);
    if (!code) return;
    if (TODO_WITHOUT_REF.test(line))
      hits.push(`${at}: TODO/FIXME needs a ticket ref, e.g. TODO(#123)`);
    if (CODE_IN_COMMENT.test(line))
      hits.push(`${at}: commented-out code; delete it (git keeps it)`);
    if (EXEMPT.test(line) || EXEMPT.test(lines[i - 1] ?? "")) return;
    if (FAKE_CLOCK.test(line) || ((test || component) && BARE_TIMER.test(line)))
      hits.push(`${at}: ${TIME_RULE}`);
  });
  return hits;
}
