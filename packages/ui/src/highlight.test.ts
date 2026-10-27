import { describe, expect, it } from "vitest";
import { highlight, type CodeLanguage, type Token } from "./highlight.js";

const INSTALL =
  "bun add @hackcove/ui\nbunx nx run-many -t typecheck lint test build --skip-nx-cache";
const TSX = [
  'import { Button, ButtonGroup } from "@hackcove/ui";\n\n<ButtonGroup>\n  <Button>Save</Button>\n  <Button variant="outline">Cancel</Button>\n</ButtonGroup>',
  "function Example() {\n  const { name } = props; // keep the label\n  return (\n    <Stack>\n      <Row label={name} count={2} />\n    </Stack>\n  );\n}",
  "<p>Don't panic</p>",
  "<div>{count > 0 && <Badge count={count} />}</div>",
  '<Button disabledReason="Pick a shop first">Save</Button>',
];

const SAMPLES: { language: CodeLanguage; code: string }[] = [
  { language: "text", code: "anything at all, colourless" },
  ...TSX.map((code) => ({ language: "tsx" as const, code })),
  {
    language: "ts",
    code: "export function add(a: number, b: number): number {\n  return a + b;\n}",
  },
  { language: "json", code: '{\n  "name": "@hackcove/ui",\n  "private": true,\n  "count": 3\n}' },
  { language: "bash", code: INSTALL },
  { language: "bash", code: "# install first\nbun install" },
  { language: "bash", code: 'echo "done # this is not a comment"' },
  {
    language: "css",
    code: '@import "tailwindcss";\n\n.dark .bg-white {\n  background-color: #1e1e2e;\n}',
  },
];

const kinds = (tokens: Token[]): string[] => tokens.map((token) => token.kind);
const textOf = (tokens: Token[], kind: string): string[] =>
  tokens.filter((token) => token.kind === kind).map((token) => token.text);

describe("highlight", () => {
  it("gives back exactly the text it was given, in every language", () => {
    for (const { language, code } of SAMPLES) {
      const joined = highlight(code, language)
        .map((token) => token.text)
        .join("");
      expect(joined, `${language}: ${code}`).toBe(code);
    }
  });

  it("colours nothing without a language, and keeps the code in one run", () => {
    expect(highlight(INSTALL, "text")).toEqual([{ kind: "plain", text: INSTALL }]);
  });

  it("knows keywords, numbers and comments in code", () => {
    const tokens = highlight("const count = 1; // one", "ts");
    expect(textOf(tokens, "keyword")).toEqual(["const"]);
    expect(textOf(tokens, "number")).toEqual(["1"]);
    expect(textOf(tokens, "comment")).toEqual(["// one"]);
  });

  it("colours a JSX element name, its attributes and the strings they hold", () => {
    const tokens = highlight('<Button variant="primary">Save</Button>', "tsx");
    expect(textOf(tokens, "tag")).toEqual(["Button", "Button"]);
    expect(textOf(tokens, "attr")).toEqual(["variant"]);
    expect(textOf(tokens, "string")).toEqual(['"primary"']);
  });

  it("treats JSX text as text, so an apostrophe does not open a string", () => {
    const tokens = highlight("<p>Don't panic</p>", "tsx");
    expect(kinds(tokens)).not.toContain("string");
    expect(tokens.map((token) => token.text).join("")).toContain("Don't panic");
  });

  it("returns to code after an expression that holds an element", () => {
    const tokens = highlight("<div>{open && <b>hi</b>}</div>\n<Button>Save</Button>", "tsx");
    expect(textOf(tokens, "tag")).toEqual(["div", "b", "b", "div", "Button", "Button"]);
  });

  it("colours a call by the parenthesis that follows it", () => {
    expect(textOf(highlight("useState(value)", "tsx"), "function")).toEqual(["useState"]);
    expect(textOf(highlight("const value = 1", "tsx"), "function")).toEqual([]);
  });

  it("colours a bash command, a flag and a comment", () => {
    const tokens = highlight("# go\nbun add --save @hackcove/ui", "bash");
    expect(textOf(tokens, "comment")).toEqual(["# go"]);
    expect(textOf(tokens, "function")).toEqual(["bun"]);
    expect(textOf(tokens, "attr")).toEqual(["--save"]);
  });

  it("does not read a # inside a bash string as a comment", () => {
    expect(kinds(highlight('echo "a # b"', "bash"))).not.toContain("comment");
  });

  it("colours a CSS property and a hex value", () => {
    const tokens = highlight(".dark .bg-white {\n  background-color: #1e1e2e;\n}", "css");
    expect(textOf(tokens, "attr")).toEqual(["background-color"]);
    expect(textOf(tokens, "number")).toEqual(["#1e1e2e"]);
  });

  it("colours an @import and its string", () => {
    const tokens = highlight('@import "tailwindcss";', "css");
    expect(textOf(tokens, "keyword")).toEqual(["@import"]);
    expect(textOf(tokens, "string")).toEqual(['"tailwindcss"']);
  });
});
