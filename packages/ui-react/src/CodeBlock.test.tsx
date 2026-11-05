import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock.js";

describe("CodeBlock", () => {
  it("renders a string as one pre/code in mono, wrapping", () => {
    const out = renderToStaticMarkup(
      <CodeBlock>{"bun add @hackcove/ui-react\nbun install"}</CodeBlock>,
    );
    expect(out).toContain("<pre");
    expect(out).toContain("whitespace-pre-wrap");
    expect(out).toContain("font-mono");
    expect(out).toContain("<code>bun add @hackcove/ui-react\nbun install</code>");
  });

  it("joins `lines` with newlines, the same markup as the equivalent string", () => {
    const fromLines = renderToStaticMarkup(<CodeBlock lines={["a", "b", "c"]} />);
    expect(fromLines).toBe(renderToStaticMarkup(<CodeBlock>{"a\nb\nc"}</CodeBlock>));
  });

  it("colours the code when it is given a language, and leaves it plain otherwise", () => {
    const plain = renderToStaticMarkup(<CodeBlock label="bash">bun install</CodeBlock>);
    expect(plain).toContain("<code>bun install</code>");
    const coloured = renderToStaticMarkup(
      <CodeBlock language="bash" lines={["bun install", "# then"]} />,
    );
    expect(coloured).toContain('<span class="text-blue-700">bun</span>');
    expect(coloured).toContain('<span class="text-slate-500 italic"># then</span>');
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
});
