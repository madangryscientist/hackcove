import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CodeExample } from "./CodeExample.js";

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
    expect(out).toMatch(/<pre class="[^"]*overflow-x-auto[^"]*whitespace-pre /);
    expect(out).not.toMatch(/whitespace-pre-wrap|break-words/);
  });

  it("scrolls a wide preview inside the frame", () => {
    expect(out).toMatch(/<div class="[^"]*overflow-x-auto/);
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
});
