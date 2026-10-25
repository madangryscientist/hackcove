import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeBlock } from "./CodeBlock.js";

describe("CodeBlock", () => {
  it("renders a string as one pre/code in mono, wrapping", () => {
    const out = renderToStaticMarkup(<CodeBlock>{"bun add @hackcove/ui\nbun install"}</CodeBlock>);
    expect(out).toContain("<pre");
    expect(out).toContain("whitespace-pre-wrap");
    expect(out).toContain("font-mono");
    expect(out).toContain("<code>bun add @hackcove/ui\nbun install</code>");
  });

  it("joins `lines` with newlines, the same markup as the equivalent string", () => {
    const fromLines = renderToStaticMarkup(<CodeBlock lines={["a", "b", "c"]} />);
    expect(fromLines).toBe(renderToStaticMarkup(<CodeBlock>{"a\nb\nc"}</CodeBlock>));
  });

  it("shows the label as a caption above the code, and none without it", () => {
    const labelled = renderToStaticMarkup(<CodeBlock label="bash">x</CodeBlock>);
    expect(labelled).toContain(">bash</figcaption>");
    expect(labelled.indexOf("figcaption")).toBeLessThan(labelled.indexOf("<pre"));
    expect(renderToStaticMarkup(<CodeBlock>x</CodeBlock>)).not.toContain("figcaption");
  });

  it("appends caller classes and forwards props to the root", () => {
    const out = renderToStaticMarkup(
      <CodeBlock className="mt-4" data-testid="install">
        x
      </CodeBlock>,
    );
    expect(out.startsWith("<figure")).toBe(true);
    expect(out).toContain(" mt-4");
    expect(out).toContain('data-testid="install"');
  });
});
