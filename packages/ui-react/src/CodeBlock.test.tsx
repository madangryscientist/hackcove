import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock.js";

/** The text a reader selects and copies: the markup stripped, the entities put back. */
const text = (html: string): string =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&");

/** The words that sit in an atomic inline box, each as its own text. */
const wordBoxes = (html: string): string[] =>
  [
    ...html.matchAll(
      /<span class="inline-block[^"]*">((?:(?!<span class="inline-block).)*?)<\/span>(?=[\s<]|$)/gs,
    ),
  ].map(([, inner]) => (inner ?? "").replace(/<[^>]+>/g, ""));

describe("CodeBlock", () => {
  it("renders a string as one pre/code in mono, wrapping", () => {
    const out = renderToStaticMarkup(
      <CodeBlock>{"bun add @hackcove/ui-react\nbun install"}</CodeBlock>,
    );
    expect(out).toContain("<pre");
    expect(out).toContain("whitespace-pre-wrap");
    expect(out).toContain("font-mono");
    expect(text(out)).toContain("bun add @hackcove/ui-react\nbun install");
  });

  it("joins `lines` with newlines, the same markup as the equivalent string", () => {
    const fromLines = renderToStaticMarkup(<CodeBlock lines={["a", "b", "c"]} />);
    expect(fromLines).toBe(renderToStaticMarkup(<CodeBlock>{"a\nb\nc"}</CodeBlock>));
  });

  it("colours the code when it is given a language, and leaves it plain otherwise", () => {
    const plain = renderToStaticMarkup(<CodeBlock label="bash">bun install</CodeBlock>);
    expect(plain).not.toContain('<span class="text-');
    expect(text(plain)).toContain("bun install");
    const coloured = renderToStaticMarkup(
      <CodeBlock language="bash" lines={["bun install", "# then"]} />,
    );
    expect(coloured).toContain('<span class="text-blue-700">bun</span>');
    expect(coloured).toContain('<span class="text-slate-500 italic">#</span>');
    expect(coloured).toContain('<span class="text-slate-500 italic">then</span>');
    expect(coloured.replace(/<[^>]+>/g, "")).toContain("bun install\n# then");
  });

  it("shows the label as a caption above the code, and none without it", () => {
    const labelled = renderToStaticMarkup(<CodeBlock label="bash">x</CodeBlock>);
    expect(labelled).toContain(">bash</figcaption>");
    expect(labelled.indexOf("figcaption")).toBeLessThan(labelled.indexOf("<pre"));
    expect(renderToStaticMarkup(<CodeBlock>x</CodeBlock>)).not.toContain("figcaption");
  });

  it('scrolls under a themed thin scrollbar with `overflow="scroll"`, and never wraps then', () => {
    const out = renderToStaticMarkup(<CodeBlock overflow="scroll">{"a".repeat(200)}</CodeBlock>);
    expect(out).toContain("overflow-x-auto");
    expect(out).toContain("[scrollbar-width:thin]");
    expect(out).toContain("[scrollbar-color:currentColor_transparent]");
    expect(out).toMatch(/<pre class="[^"]*whitespace-pre"/);
    expect(out).not.toMatch(/whitespace-pre-wrap|break-words/);
  });

  it("wraps by default and has no scroller, so it can never clip", () => {
    const out = renderToStaticMarkup(<CodeBlock>{"a".repeat(200)}</CodeBlock>);
    expect(out).not.toContain("overflow-x-auto");
    expect(out).not.toContain("scrollbar");
  });

  it("has no copy button, and so no client JS, unless `copy` is set", () => {
    expect(renderToStaticMarkup(<CodeBlock>x</CodeBlock>)).not.toContain("<button");
  });

  it("with `copy` has a button beside the code, named by its visible text", () => {
    const out = renderToStaticMarkup(<CodeBlock copy>x</CodeBlock>);
    expect(out).toMatch(/<button [^>]*type="button"[^>]*>copy<\/button>/);
    expect(out.indexOf("</pre>")).toBeLessThan(out.indexOf("<button"));
  });

  it("forwards props to the root", () => {
    const out = renderToStaticMarkup(<CodeBlock data-testid="install">x</CodeBlock>);
    expect(out.startsWith("<figure")).toBe(true);
    expect(out).toContain('data-testid="install"');
  });

  it("wraps at whitespace only: each word, a hyphenated flag included, is one atomic inline box", () => {
    const code = "bunx nx run-many -t build --skip-nx-cache --output-style=stream";
    const out = renderToStaticMarkup(<CodeBlock language="bash">{code}</CodeBlock>);
    expect(wordBoxes(out)).toEqual(code.split(" "));
    // The boxes are capped at the line, so a word wider than the box still breaks inside itself.
    expect(out).toContain("inline-block max-w-full");
    expect(out).toContain("break-words");
  });

  it("adds no characters when it keeps words whole: the text is the source, byte for byte", () => {
    const code = 'a  b\n\t--flag-x  "quoted string"\n# comment here\n';
    for (const language of ["text", "bash", "tsx"] as const) {
      const out = renderToStaticMarkup(<CodeBlock language={language}>{code}</CodeBlock>);
      expect(text(out)).toContain(code);
      expect(out).not.toMatch(/[\u2010-\u2015\u2060\u00a0\u200b\u00ad]/);
    }
  });

  it("scroll mode keeps lines whole with no word boxes", () => {
    const out = renderToStaticMarkup(
      <CodeBlock overflow="scroll">{"bunx --skip-nx-cache"}</CodeBlock>,
    );
    expect(out).not.toContain("inline-block");
  });
});
