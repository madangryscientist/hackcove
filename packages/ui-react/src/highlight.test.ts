import { describe, expect, it } from "vitest";
import { consoleCommands, highlight, type CodeLanguage, type Token } from "./highlight.js";

const INSTALL =
  "bun add @hackcove/ui-react\nbunx nx run-many -t typecheck lint test build --skip-nx-cache";
const TSX = [
  'import { Button, ButtonGroup } from "@hackcove/ui-react";\n\n<ButtonGroup>\n  <Button>Save</Button>\n  <Button variant="outline">Cancel</Button>\n</ButtonGroup>',
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
  {
    language: "json",
    code: '{\n  "name": "@hackcove/ui-react",\n  "private": true,\n  "count": 3\n}',
  },
  { language: "bash", code: INSTALL },
  { language: "bash", code: "# install first\nbun install" },
  { language: "bash", code: 'echo "done # this is not a comment"' },
  {
    language: "css",
    code: '@import "tailwindcss";\n\n.dark .bg-white {\n  background-color: #1e1e2e;\n}',
  },
  { language: "js", code: "export const a = 1; // one" },
  { language: "yaml", code: "name: CI\non:\n  push:\n    branches: [main]\n" },
  { language: "yaml", code: "- run: |\n    echo # hi\n\n  - next: 1\r\nkey: 'a' # c\n" },
  {
    language: "html",
    code: "<!doctype html>\n<p class=a>Don't</p>\n<script>let a = '</p>';</script><i",
  },
  { language: "console", code: "$ bun add a \\\n  b\nadded 2\n$ bun test\r\nok" },
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
    const tokens = highlight("# go\nbun add --save @hackcove/ui-react", "bash");
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

  describe("js", () => {
    it("is scanned as ts is", () => {
      const code = "export async function load(id) { return await fetch(`/a/${id}`); } // go";
      expect(highlight(code, "js")).toEqual(highlight(code, "ts"));
    });
  });

  describe("console", () => {
    it("dims the prompt, colours the command as bash and leaves output plain", () => {
      const code = "$ bun add --dev vitest\nbun add v1.3 (abc)\n+ vitest@5\n$ bun test # all";
      expect(highlight(code, "console")).toEqual([
        { kind: "prompt", text: "$ " },
        { kind: "function", text: "bun" },
        { kind: "plain", text: " add " },
        { kind: "attr", text: "--dev" },
        { kind: "plain", text: " vitest\nbun add v1.3 (abc)\n+ vitest@5\n" },
        { kind: "prompt", text: "$ " },
        { kind: "function", text: "bun" },
        { kind: "plain", text: " test " },
        { kind: "comment", text: "# all" },
      ]);
    });

    it("scans the lines after a trailing \\ as bash too, with no prompt", () => {
      const code =
        "$ bunx playwright test \\\n  --project=chromium \\\n  --reporter=list\ndone --not-a-flag";
      expect(highlight(code, "console")).toEqual([
        { kind: "prompt", text: "$ " },
        { kind: "function", text: "bunx" },
        { kind: "plain", text: " playwright test \\\n  " },
        { kind: "attr", text: "--project" },
        { kind: "plain", text: "=chromium \\\n  " },
        { kind: "attr", text: "--reporter" },
        { kind: "plain", text: "=list\ndone --not-a-flag" },
      ]);
    });

    it("takes a $ that is not followed by a space, or not at the line start, as output", () => {
      expect(highlight("$HOME\n $ x\n$", "console")).toEqual([
        { kind: "plain", text: "$HOME\n $ x\n$" },
      ]);
    });
  });

  describe("consoleCommands", () => {
    it("lists each command without its prompt and leaves the output out", () => {
      expect(consoleCommands("$ bun add a\nadded 1 package\n$ bun test\nok")).toBe(
        "bun add a\nbun test",
      );
    });

    it("keeps continuation lines as written, the backslash and indentation included", () => {
      const code =
        "$ bunx playwright test \\\n  --project=chromium \\\n  --reporter=list\n2 passed\n$ echo done";
      expect(consoleCommands(code)).toBe(
        "bunx playwright test \\\n  --project=chromium \\\n  --reporter=list\necho done",
      );
    });

    it("gives back a session with no command exactly as given", () => {
      const code = "added 1 package\n  $HOME\n";
      expect(consoleCommands(code)).toBe(code);
    });
  });
});
