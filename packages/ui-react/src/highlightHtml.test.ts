import { describe, expect, it } from "vitest";
import { highlight, type Token } from "./highlight.js";

const kinds = (tokens: Token[]): string[] => tokens.map((token) => token.kind);
const textOf = (tokens: Token[], kind: string): string[] =>
  tokens.filter((token) => token.kind === kind).map((token) => token.text);

describe("html", () => {
  it("colours a tag name, attributes, quoted and unquoted values", () => {
    expect(highlight('<a href="/x" target=_blank hidden>go</a>', "html")).toEqual([
      { kind: "plain", text: "<" },
      { kind: "tag", text: "a" },
      { kind: "plain", text: " " },
      { kind: "attr", text: "href" },
      { kind: "plain", text: "=" },
      { kind: "string", text: '"/x"' },
      { kind: "plain", text: " " },
      { kind: "attr", text: "target" },
      { kind: "plain", text: "=_blank " },
      { kind: "attr", text: "hidden" },
      { kind: "plain", text: ">go</" },
      { kind: "tag", text: "a" },
      { kind: "plain", text: ">" },
    ]);
  });

  it("reads a comment across lines, a doctype in any case and a custom element", () => {
    expect(highlight("<!DocType html>\n<!-- one\ntwo -->\n<my-card:x/>", "html")).toEqual([
      { kind: "keyword", text: "<!DocType html>" },
      { kind: "plain", text: "\n" },
      { kind: "comment", text: "<!-- one\ntwo -->" },
      { kind: "plain", text: "\n<" },
      { kind: "tag", text: "my-card:x" },
      { kind: "plain", text: "/>" },
    ]);
  });

  it("carries a start tag across lines", () => {
    expect(highlight('<input\n  type="text"\n  disabled\n>', "html")).toEqual([
      { kind: "plain", text: "<" },
      { kind: "tag", text: "input" },
      { kind: "plain", text: "\n  " },
      { kind: "attr", text: "type" },
      { kind: "plain", text: "=" },
      { kind: "string", text: '"text"' },
      { kind: "plain", text: "\n  " },
      { kind: "attr", text: "disabled" },
      { kind: "plain", text: "\n>" },
    ]);
  });

  it("leaves text between tags plain, and a < that opens nothing", () => {
    const tokens = highlight("<p>It's {a} and 1 < 2, a<3, 5 <- 4</p>", "html");
    expect(textOf(tokens, "tag")).toEqual(["p", "p"]);
    expect(kinds(tokens)).not.toContain("string");
    expect(kinds(tokens)).not.toContain("attr");
  });

  it("scans the content of a script as js, to the first </script in any case", () => {
    const code = '<script type="module">\nconst s = "</p>"; // go\n</SCRIPT><p>x</p>';
    expect(highlight(code, "html")).toEqual([
      { kind: "plain", text: "<" },
      { kind: "tag", text: "script" },
      { kind: "plain", text: " " },
      { kind: "attr", text: "type" },
      { kind: "plain", text: "=" },
      { kind: "string", text: '"module"' },
      { kind: "plain", text: ">\n" },
      { kind: "keyword", text: "const" },
      { kind: "plain", text: " s = " },
      { kind: "string", text: '"</p>"' },
      { kind: "plain", text: "; " },
      { kind: "comment", text: "// go" },
      { kind: "plain", text: "\n</" },
      { kind: "tag", text: "SCRIPT" },
      { kind: "plain", text: "><" },
      { kind: "tag", text: "p" },
      { kind: "plain", text: ">x</" },
      { kind: "tag", text: "p" },
      { kind: "plain", text: ">" },
    ]);
  });

  it("ends a script at a </script inside a string, as a browser does", () => {
    const tokens = highlight("<script>const a = '</script>';</script>", "html");
    expect(textOf(tokens, "keyword")).toEqual(["const"]);
    expect(textOf(tokens, "tag")).toEqual(["script", "script", "script"]);
  });

  it("does not end a script at a longer tag name that starts with script", () => {
    const tokens = highlight("<script>const a = '</scripture>';</script>", "html");
    expect(textOf(tokens, "keyword")).toEqual(["const"]);
    expect(textOf(tokens, "tag")).toEqual(["script", "script"]);
  });

  it("scans the content of a style as css", () => {
    const code = "<style>\n.a { color: #fff; }\n</style>";
    expect(highlight(code, "html")).toEqual([
      { kind: "plain", text: "<" },
      { kind: "tag", text: "style" },
      { kind: "plain", text: ">\n.a { " },
      { kind: "attr", text: "color" },
      { kind: "plain", text: ": " },
      { kind: "number", text: "#fff" },
      { kind: "plain", text: "; }\n</" },
      { kind: "tag", text: "style" },
      { kind: "plain", text: ">" },
    ]);
  });
});
