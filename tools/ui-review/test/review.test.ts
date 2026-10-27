import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { onlyFiles, parseDiff } from "../src/diff.js";
import { bodyOf, parseReply, place, summaryOf } from "../src/findings.js";
import { commandFor } from "../src/opencode.js";
import { MAX_DIFF_CHARS, MODEL, buildPrompt, purposeOf } from "../src/prompt.js";
import { diffOf } from "./fixtures.js";

const agents = readFileSync(join(import.meta.dirname, "..", "..", "..", "AGENTS.md"), "utf8");

describe("prompt", () => {
  it("takes the Purpose section of AGENTS.md", () => {
    const purpose = purposeOf(agents);
    expect(purpose).toContain("opinionated, strict UI library");
    expect(purpose).not.toContain("## Layout");
  });

  it("carries the purpose, the reference and the diff, and cuts a long diff", () => {
    const prompt = buildPrompt({ purpose: "P-URPOSE", reference: "R-EFERENCE", diff: "D-IFF" });
    for (const part of ["P-URPOSE", "R-EFERENCE", "D-IFF", "ask hackcove", "missing_part"]) {
      expect(prompt.toLowerCase()).toContain(part.toLowerCase());
    }
    const long = buildPrompt({
      purpose: "p",
      reference: "r",
      diff: "x".repeat(MAX_DIFF_CHARS + 5),
    });
    expect(long).toContain("cut here for length");
  });

  it("runs the pinned model through OpenCode Zen", () => {
    expect(MODEL).toBe("opencode/deepseek-v4.1-flash");
    expect(commandFor("p.md")).toContain(MODEL);
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
