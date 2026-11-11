import { describe, expect, it } from "vitest";
import { highlight, type Token } from "./highlight.js";

const kinds = (tokens: Token[]): string[] => tokens.map((token) => token.kind);
const textOf = (tokens: Token[], kind: string): string[] =>
  tokens.filter((token) => token.kind === kind).map((token) => token.text);

describe("yaml", () => {
  it("reads a comment, a key, a list marker and each kind of value", () => {
    const code = [
      "# build",
      "name: CI",
      "retries: 3",
      "ratio: -1.5",
      "ready: true",
      "empty: ~",
      "nothing: null",
      "label: 'it''s' # why",
      '- "quoted key": v',
      "  - uses: actions/checkout@v4",
    ].join("\n");
    expect(highlight(code, "yaml")).toEqual([
      { kind: "comment", text: "# build" },
      { kind: "plain", text: "\n" },
      { kind: "attr", text: "name" },
      { kind: "plain", text: ": CI\n" },
      { kind: "attr", text: "retries" },
      { kind: "plain", text: ": " },
      { kind: "number", text: "3" },
      { kind: "plain", text: "\n" },
      { kind: "attr", text: "ratio" },
      { kind: "plain", text: ": " },
      { kind: "number", text: "-1.5" },
      { kind: "plain", text: "\n" },
      { kind: "attr", text: "ready" },
      { kind: "plain", text: ": " },
      { kind: "keyword", text: "true" },
      { kind: "plain", text: "\n" },
      { kind: "attr", text: "empty" },
      { kind: "plain", text: ": " },
      { kind: "keyword", text: "~" },
      { kind: "plain", text: "\n" },
      { kind: "attr", text: "nothing" },
      { kind: "plain", text: ": " },
      { kind: "keyword", text: "null" },
      { kind: "plain", text: "\n" },
      { kind: "attr", text: "label" },
      { kind: "plain", text: ": " },
      { kind: "string", text: "'it''s'" },
      { kind: "plain", text: " " },
      { kind: "comment", text: "# why" },
      { kind: "plain", text: "\n- " },
      { kind: "string", text: '"quoted key"' },
      { kind: "plain", text: ": v\n  - " },
      { kind: "attr", text: "uses" },
      { kind: "plain", text: ": actions/checkout@v4" },
    ]);
  });

  it("keeps expressions, anchors, tags, a document marker and a colon inside a value plain", () => {
    const code =
      "---\nif: ${{ github.ref == 'main' }}\nbase: &base\ncopy: *base\nt: !!str 5\nat: 10:30\nurl: http://x.y/z\n";
    const tokens = highlight(code, "yaml");
    expect(textOf(tokens, "attr")).toEqual(["if", "base", "copy", "t", "at", "url"]);
    expect(kinds(tokens)).not.toContain("number");
    expect(kinds(tokens)).not.toContain("string");
    expect(kinds(tokens)).not.toContain("keyword");
    expect(kinds(tokens)).not.toContain("comment");
  });

  it("does not read a # in a value that is not preceded by space as a comment", () => {
    const tokens = highlight("color: red#1\n", "yaml");
    expect(kinds(tokens)).not.toContain("comment");
  });

  it("shows a run: | script as one plain block, with a # and a colon in it staying plain", () => {
    const code = "run: |\n  # not a comment\n  echo a: b\n\n  true\nnext: 1 # yes";
    expect(highlight(code, "yaml")).toEqual([
      { kind: "attr", text: "run" },
      { kind: "plain", text: ": |\n  # not a comment\n  echo a: b\n\n  true\n" },
      { kind: "attr", text: "next" },
      { kind: "plain", text: ": " },
      { kind: "number", text: "1" },
      { kind: "plain", text: " " },
      { kind: "comment", text: "# yes" },
    ]);
  });

  it("ends a block scalar at the first non-blank line indented no deeper than its key", () => {
    const code = "- run: >-\n    one\n   two\n  - name: x\n";
    expect(highlight(code, "yaml")).toEqual([
      { kind: "plain", text: "- " },
      { kind: "attr", text: "run" },
      { kind: "plain", text: ": >-\n    one\n   two\n  - " },
      { kind: "attr", text: "name" },
      { kind: "plain", text: ": x\n" },
    ]);
  });

  it("measures the block to the key's column after the list markers", () => {
    // `run` is at column 4, so a line indented 4 ends the block and one indented 5 stays in it.
    const code = "  - run: |\n     inside: 1\n    outside: 2\n";
    const tokens = highlight(code, "yaml");
    expect(textOf(tokens, "attr")).toEqual(["run", "outside"]);
  });

  it("ends a top-level block scalar at the next line in column 0", () => {
    const code = "a: |\n x: 1\nb: 2";
    expect(textOf(highlight(code, "yaml"), "attr")).toEqual(["a", "b"]);
  });
});
