import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeExample } from "./CodeExample.js";
import { CodeBlock } from "./CodeBlock.js";
import { CopyLine } from "./CopyLine.js";
import { Prose, Text } from "./typography.js";

const codeParts = () => (
  <>
    <CodeExample code="x">DEMO</CodeExample>
    <CodeBlock language="bash">bun add x</CodeBlock>
    <CopyLine text="bun add x" />
  </>
);
const countLeadings = (html: string) => html.match(/leading-normal/g)?.length ?? 0;

describe("CodeExample", () => {
  const out = renderToStaticMarkup(
    <CodeExample code={"<Button>\n  Save\n</Button>"}>PREVIEW</CodeExample>,
  );

  it("is one figure holding the preview, then the code", () => {
    expect(out.match(/<figure /g)).toHaveLength(1);
    expect(out.indexOf("PREVIEW")).toBeGreaterThanOrEqual(0);
    expect(out.indexOf("PREVIEW")).toBeLessThan(out.indexOf("<pre"));
  });

  it("escapes the code, keeps its newlines, and colours it as TSX", () => {
    const code = out.slice(out.indexOf("<code>"), out.indexOf("</code>") + 7);
    expect(code.replace(/<[^>]+>/g, "")).toBe("&lt;Button&gt;\n  Save\n&lt;/Button&gt;");
    expect(code).toContain('<span class="text-red-700">Button</span>');
  });

  it("keeps the preview its own height: a shared minimum, never grown to fill a cell", () => {
    expect(out).not.toMatch(/\bgrow\b/);
    expect(out).toMatch(/<div class="min-h-24 /);
  });

  it("scrolls long code sideways and does not wrap it", () => {
    const scroller = out.slice(out.indexOf("<pre") - 200, out.indexOf("<pre"));
    expect(scroller).toContain("overflow-x-auto");
    expect(out).toMatch(/<pre class="[^"]*whitespace-pre"/);
    expect(out).not.toMatch(/whitespace-pre-wrap|break-words/);
  });

  it("scrolls a wide preview inside the frame", () => {
    expect(out).toMatch(/<div class="[^"]*overflow-x-auto/);
  });

  it("gives both scrollers the themed thin scrollbar, and the preview keeps a readable text colour", () => {
    expect(out.match(/\[scrollbar-width:thin\]/g)).toHaveLength(2);
    expect(out.match(/\[scrollbar-color:currentColor_transparent\]/g)).toHaveLength(2);
    expect(out).toContain('<div class="text-slate-900">PREVIEW</div>');
  });

  it("has no copy button unless `copy` is set, and then one beside the code", () => {
    expect(out).not.toContain("<button");
    const withCopy = renderToStaticMarkup(
      <CodeExample code="x" copy>
        PREVIEW
      </CodeExample>,
    );
    expect(withCopy.indexOf("</pre>")).toBeLessThan(withCopy.indexOf("<button"));
    expect(withCopy).toContain('aria-label="copy"');
  });

  it("draws one divider between the preview and the code", () => {
    expect(out.match(/border-t/g)).toHaveLength(1);
  });

  it("draws a caption as the last band, under the code, and no band without one", () => {
    const withCaption = renderToStaticMarkup(
      <CodeExample code="x" caption="NOTE">
        PREVIEW
      </CodeExample>,
    );
    expect(withCaption).toMatch(/<figcaption [^>]*>NOTE<\/figcaption><\/figure>$/);
    expect(withCaption.indexOf("<pre")).toBeLessThan(withCaption.indexOf("NOTE"));
    expect(withCaption.match(/border-t/g)).toHaveLength(2);
    expect(out).not.toContain("figcaption");
  });

  it("keeps its demo on the app scale inside a Prose, while the Prose body stays text-base", () => {
    const html = renderToStaticMarkup(
      <Prose>
        <Text>BODY</Text>
        <CodeExample code="x">
          <Text>DEMO</Text>
        </CodeExample>
      </Prose>,
    );
    const classOfText = (word: string) =>
      new RegExp(`<span class="([^"]*)">${word}</span>`).exec(html)?.[1] ?? "";
    expect(classOfText("BODY")).toContain("text-base/7");
    expect(classOfText("DEMO")).toContain("text-sm/5");
    expect(classOfText("DEMO")).not.toContain("text-base/7");
  });

  it("keeps the code's own line height inside a Prose, the same as outside", () => {
    const outside = renderToStaticMarkup(codeParts());
    const inside = renderToStaticMarkup(<Prose>{codeParts()}</Prose>);
    // CodeExample (its code pane), CodeBlock, CopyLine: each sets leading-normal itself.
    expect(countLeadings(outside)).toBe(countLeadings(inside));
    expect(countLeadings(inside)).toBeGreaterThanOrEqual(3);
  });
});
