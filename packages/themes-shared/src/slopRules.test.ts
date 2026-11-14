import { describe, expect, it } from "vitest";
import { slopRules } from "../../../scripts/slopRules";

// This file is linted by the same rules, so the flagged words are built, never written whole.
const w = (...parts: string[]): string => parts.join("");
const fake = w("vi.use", "FakeTimers();");
const timeout = w("set", "Timeout(");
const interval = w("set", "Interval(");
const todo = w("TO", "DO");
const ui = "@hackcove/ui-react";

describe("slopRules: nothing time dependent", () => {
  it("fails a test file that uses fake timers", () => {
    expect(slopRules("src/CopyButton.test.tsx", `beforeEach(() => ${fake});`, ui)).toEqual([
      expect.stringMatching(/^src\/CopyButton\.test\.tsx:1: time dependent/),
    ]);
  });

  it("fails the async and Playwright clocks, and a fake clock in a harness that is not a test", () => {
    expect(
      slopRules("src/a.test.ts", w("await vi.advance", "TimersByTimeAsync(2000);"), "x"),
    ).toHaveLength(1);
    expect(slopRules("src/a.test.ts", w("vi.setSystem", "Time(0);"), "x")).toHaveLength(1);
    expect(slopRules("e2e/a.spec.ts", w("await page.clock.", "install();"), "x")).toHaveLength(1);
    expect(slopRules("e2e/a.spec.ts", w("await page.clock.", "runFor(2000);"), "x")).toHaveLength(
      1,
    );
    expect(slopRules("src/dom.harness.ts", fake, ui)).toHaveLength(1);
  });

  it("fails advancing, running or waiting on a clock in a test or an e2e spec", () => {
    for (const call of [
      w("advance", "TimersByTime(2000)"),
      w("runAll", "Timers()"),
      w("runOnlyPending", "Timers()"),
    ])
      expect(slopRules("src/a.test.ts", `vi.${call};`, "x")).toHaveLength(1);
    expect(slopRules("e2e/a.spec.ts", w("await page.waitFor", "Timeout(60);"), "x")).toHaveLength(
      1,
    );
  });

  it("fails a story that drives itself with a timer", () => {
    expect(slopRules("src/Switch.stories.tsx", `${timeout}() => land(), 1000);`, "x")).toHaveLength(
      1,
    );
    expect(slopRules("src/Switch.stories.tsx", `window.${interval}tick, 10);`, "x")).toHaveLength(
      1,
    );
  });

  it("fails a component with a timer, but not a non-component file or another package's source", () => {
    expect(slopRules("src/CopyButton.tsx", `const t = ${timeout}reset, 2000);`, ui)).toHaveLength(
      1,
    );
    expect(
      slopRules("src/CopyButton.tsx", `const t = ${timeout}reset, 2000);`, "@hackcove/storybook"),
    ).toEqual([]);
  });

  it("fails a timer in a helper under test/, and keeps the other rules on an exempt line", () => {
    expect(slopRules("test/helper.ts", `${timeout}f, 1);`, "x")).toHaveLength(1);
    const why = w("// time-", "dependent: polls");
    expect(slopRules("src/a.test.ts", `${why}\n// ${todo} tidy`, "x")).toEqual([
      expect.stringMatching(/^src\/a\.test\.ts:2: .* needs a ticket ref/),
    ]);
  });

  it("passes Playwright's test.setTimeout, the test's own time limit", () => {
    expect(slopRules("e2e/site-header.spec.ts", w("test.set", "Timeout(120_000);"), "x")).toEqual(
      [],
    );
  });

  it("passes a timer with a time-dependent reason on its line or the line above", () => {
    const why = w("// time-", "dependent: the server polls every minute");
    expect(slopRules("e2e/a.spec.ts", `${timeout}f, 1); ${why}`, "x")).toEqual([]);
    expect(slopRules("e2e/a.spec.ts", `${why}\n${timeout}f, 1);`, "x")).toEqual([]);
    // Two lines down is not covered, and a reason is required.
    expect(slopRules("e2e/a.spec.ts", `${why}\n\n${timeout}f, 1);`, "x")).toHaveLength(1);
    expect(
      slopRules("e2e/a.spec.ts", w(`${timeout}f, 1); // time-`, "dependent:"), "x"),
    ).toHaveLength(1);
  });
});

describe("slopRules: the rules from before", () => {
  it("fails a note with no ticket ref and passes one with a ref", () => {
    expect(slopRules("src/a.ts", `// ${todo} tidy`, "x")).toEqual([
      expect.stringMatching(/^src\/a\.ts:1: .* needs a ticket ref/),
    ]);
    expect(slopRules("src/a.ts", `// ${todo}(#123) tidy`, "x")).toEqual([]);
  });

  it("fails commented-out code and passes prose", () => {
    expect(slopRules("src/a.ts", "// const x = 1;", "x")).toEqual([
      "src/a.ts:1: commented-out code; delete it (git keeps it)",
    ]);
    expect(slopRules("src/a.ts", "// return early when empty", "x")).toEqual([]);
  });
});
