import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MAX_DIFF_CHARS, fitDiff, isGenerated, leftLines } from "../src/budget.js";
import { onlyFiles, parseDiff, splitDiff } from "../src/diff.js";
import { didNotRun, noteInSummary } from "../src/failure.js";
import { bodyOf, parseReply, place, summaryOf } from "../src/findings.js";
import { commandFor } from "../src/opencode.js";
import { MODEL, buildPrompt, purposeOf } from "../src/prompt.js";
import { diffOf } from "./fixtures.js";

const agents = readFileSync(join(import.meta.dirname, "..", "..", "..", "AGENTS.md"), "utf8");

describe("prompt", () => {
  it("takes the Purpose section of AGENTS.md", () => {
    const purpose = purposeOf(agents);
    expect(purpose).toContain("opinionated, strict UI library");
    expect(purpose).not.toContain("## Layout");
  });

  it("carries the purpose, the reference and the diff, and says when files were left out", () => {
    const prompt = buildPrompt({ purpose: "P-URPOSE", reference: "R-EFERENCE", diff: "D-IFF" });
    for (const part of ["P-URPOSE", "R-EFERENCE", "D-IFF", "ask hackcove", "missing_part"]) {
      expect(prompt.toLowerCase()).toContain(part.toLowerCase());
    }
    const left = buildPrompt({ purpose: "p", reference: "r", diff: "d", left: 2 });
    expect(left).toContain("2 more files were left out");
    expect(buildPrompt({ purpose: "p", reference: "r", diff: "d" })).not.toContain("left out");
  });

  it("runs the pinned model through OpenCode Zen", () => {
    expect(MODEL).toBe("opencode/deepseek-v4.1-flash");
    expect(commandFor()).toContain(MODEL);
  });
});

describe("model reply", () => {
  const reply = `Here you go:\n\`\`\`json\n${JSON.stringify({
    findings: [
      { path: "src/List.tsx", line: 4, kind: "hand-rolled-layout", message: "Use ListLayout." },
      {
        path: "src/List.tsx",
        line: 9,
        kind: "missing-part",
        message: "A kanban board.",
        missing_part: "a Board",
      },
      { path: "src/List.tsx", line: 9, kind: "missing-part", message: "no part named" },
      { path: "src/List.tsx", line: "x", kind: "wrong-component", message: "bad line" },
      { path: "src/List.tsx", line: 2, kind: "vibes", message: "unknown kind" },
    ],
  })}\n\`\`\``;

  it("keeps the well-formed findings and drops the rest", () => {
    expect(parseReply(reply).map((f) => f.line)).toEqual([4, 9]);
  });

  it("always phrases a missing part as an ask to hackcove", () => {
    const body = bodyOf(parseReply(reply)[1]!);
    expect(body).toContain("Ask hackcove for a Board");
    expect(body).not.toMatch(/build (?:it|one) locally\b(?!\.)/);
  });

  it("rejects a reply that is not the JSON object", () => {
    expect(() => parseReply("no json here")).toThrow(/JSON/);
    expect(() => parseReply('{"nope":[]}')).toThrow(/findings/);
  });

  it("puts a finding inline only on a line the diff adds", () => {
    const files = parseDiff(diffOf({ path: "src/List.tsx", start: 4, lines: ["a", "b"] }));
    const { inline, loose } = place(parseReply(reply), files);
    expect(inline.map((f) => f.line)).toEqual([4]);
    expect(loose.map((f) => f.line)).toEqual([9]);
  });

  it("ends with one summary: the all-clear line, or a count", () => {
    expect(summaryOf(0, [])).toBe("**Hack Cove UI review:** matches Hack Cove.");
    expect(summaryOf(2, [])).toContain("2 notes");
  });

  it("does not say it all matches when files were left out, and lists them", () => {
    const left = leftLines([{ path: "src/a.tsx", reason: "over the size limit" }]);
    const text = summaryOf(0, [], left);
    expect(text).not.toContain("matches Hack Cove");
    expect(text).toContain("`src/a.tsx` (over the size limit)");
    expect(summaryOf(1, [], left)).toContain("Not reviewed by the model: 1 file");
  });

  it("carries no AI attribution", () => {
    const texts = [
      summaryOf(0, []),
      summaryOf(1, parseReply(reply)),
      bodyOf(parseReply(reply)[0]!),
    ];
    for (const text of texts)
      expect(text).not.toMatch(/co-authored|generated with|claude|\bAI\b|deepseek/i);
  });
});

it("onlyFiles keeps the chunks of the kept files", () => {
  const diff = diffOf({ path: "a.tsx", lines: ["1"] }, { path: "b.tsx", lines: ["2"] });
  expect(onlyFiles(diff, new Set(["b.tsx"]))).toContain("b.tsx");
  expect(onlyFiles(diff, new Set(["b.tsx"]))).not.toContain("a.tsx");
});

describe("opencode command", () => {
  it("sends the prompt on stdin, not as an attached file the model pages through", () => {
    const command = commandFor();
    expect(command).not.toContain("--file");
    expect(command[command.indexOf("run") + 1]).toMatch(/^Follow the instructions/);
  });
});

const file = (path: string, lines: number, width = 20) =>
  diffOf({ path, lines: Array.from({ length: lines }, (_, i) => `${i}`.padEnd(width, "x")) });

describe("the diff budget", () => {
  it("splits a diff into one chunk per file", () => {
    const parts = splitDiff(
      diffOf({ path: "a.tsx", lines: ["1"] }, { path: "b.tsx", lines: ["2"] }),
    );
    expect(parts.map((part) => part.path)).toEqual(["a.tsx", "b.tsx"]);
  });

  it("knows the generated files", () => {
    for (const path of [
      "packages/ui/props.json",
      "bun.lock",
      "package-lock.json",
      "src/a.test.tsx.snap",
      "apps/x/dist/index.js",
      "public/app.min.js",
      "app.js.map",
    ])
      expect(isGenerated(path)).toBe(true);
    for (const path of ["src/Page.tsx", "src/props.tsx", "README.md", "src/style.css"])
      expect(isGenerated(path)).toBe(false);
  });

  it("sends a small diff whole", () => {
    const diff = diffOf({ path: "a.tsx", lines: ["1"] }, { path: "b.css", lines: ["2"] });
    expect(fitDiff(diff)).toEqual({ diff, left: [] });
  });

  it("drops generated files first and names them", () => {
    const diff = [file("src/a.tsx", 2), file("props.json", 2), file("bun.lock", 2)].join("\n");
    const fitted = fitDiff(diff + "\n");
    expect(fitted.diff).toContain("src/a.tsx");
    expect(fitted.diff).not.toContain("props.json");
    expect(fitted.left).toEqual([
      { path: "props.json", reason: "generated" },
      { path: "bun.lock", reason: "generated" },
    ]);
  });

  it("keeps source files and the largest additions within the limit, whole, in diff order", () => {
    const small = file("src/small.tsx", 2);
    const big = file("src/big.tsx", 20);
    const style = file("src/app.css", 40);
    const huge = file("src/huge.tsx", 400);
    const diff = [small, style, huge, big].join("\n") + "\n";
    const max = big.length + small.length + 300;
    const fitted = fitDiff(diff, max);
    expect(fitted.diff.length).toBeLessThanOrEqual(max);
    expect(splitDiff(fitted.diff).map((part) => part.path)).toEqual([
      "src/small.tsx",
      "src/big.tsx",
    ]);
    expect(fitted.left).toEqual([
      { path: "src/huge.tsx", reason: "over the size limit" },
      { path: "src/app.css", reason: "over the size limit" },
    ]);
  });

  it("is never over the limit, however large the pull request", () => {
    const diff =
      Array.from({ length: 60 }, (_, i) => file(`src/f${i}.tsx`, 30 + i)).join("\n") + "\n";
    const fitted = fitDiff(diff);
    expect(fitted.diff.length).toBeLessThanOrEqual(MAX_DIFF_CHARS);
    expect(fitted.left.length).toBeGreaterThan(0);
    expect(splitDiff(fitted.diff).length + fitted.left.length).toBe(60);
  });

  it("writes what was left out to the step summary", () => {
    const dir = mkdtempSync(join(tmpdir(), "ui-review-left-"));
    const summary = join(dir, "summary.md");
    try {
      noteInSummary(leftLines([{ path: "props.json", reason: "generated" }]), {
        GITHUB_STEP_SUMMARY: summary,
      });
      expect(readFileSync(summary, "utf8")).toContain("`props.json` (generated)");
      noteInSummary(["x"], {});
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("a review that did not run", () => {
  it("is an ::error annotation and a step summary, on one line", () => {
    const dir = mkdtempSync(join(tmpdir(), "ui-review-failure-"));
    const summary = join(dir, "summary.md");
    try {
      const annotation = didNotRun("opencode exited 1:\nFile not found: x", {
        GITHUB_STEP_SUMMARY: summary,
      });
      expect(annotation).toBe(
        "::error title=Hack Cove UI review::the model review did not run: opencode exited 1: File not found: x",
      );
      const text = readFileSync(summary, "utf8");
      expect(text).toContain("did not run");
      expect(text).toContain("File not found: x");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("still returns the annotation with no step summary", () => {
    expect(didNotRun("boom", {})).toMatch(/^::error /);
  });
});
