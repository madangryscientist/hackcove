import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SideColumn } from "./SideColumn.js";

/** Whether every text is in `out`, each after the one before it. */
const inOrder = (out: string, texts: string[]): boolean => {
  const found = texts.map((text) => out.indexOf(text));
  return found.every((index, i) => index >= 0 && (i === 0 || index > (found[i - 1] ?? 0)));
};

describe("SideColumn", () => {
  const out = renderToStaticMarkup(<SideColumn aside="ASIDE">MAIN</SideColumn>);

  it("is one column below lg and a fixed 24rem aside beside the main area from lg", () => {
    expect(out).toMatch(/^<div class="[^"]*grid-cols-1[^"]*lg:grid-cols-\[minmax\(0,1fr\)_24rem\]/);
    expect(inOrder(out, ["MAIN", "ASIDE"])).toBe(true);
  });

  it("takes the aside's width from a closed set: sm is 18rem", () => {
    const sm = renderToStaticMarkup(
      <SideColumn aside="ASIDE" asideWidth="sm">
        MAIN
      </SideColumn>,
    );
    expect(sm).toContain("lg:grid-cols-[minmax(0,1fr)_18rem]");
    expect(sm).not.toContain("24rem");
  });

  it("lets the main area shrink so a wide table scrolls inside it", () => {
    expect(out).toMatch(/<div class="min-w-0">MAIN<\/div>/);
  });

  it("puts the side column in an <aside>, open and with no disclosure, without asideLabel", () => {
    expect(out).toMatch(/<aside class="min-w-0">ASIDE<\/aside>/);
    expect(out).not.toContain("<details");
  });

  it("sets no page width, padding, height or stickiness of its own", () => {
    expect(out).not.toMatch(/max-w-|\bpx-|\bpy-|h-\[|min-h-|sticky/);
  });

  it("folds the aside behind a closed disclosure below lg only with asideLabel, summary first", () => {
    const folded = renderToStaticMarkup(
      <SideColumn aside="ASIDE" asideLabel="Ask the reply agent">
        MAIN
      </SideColumn>,
    );
    expect(folded).toContain("<details");
    expect(folded).not.toContain("<details open");
    expect(inOrder(folded, ["MAIN", "Ask the reply agent", "ASIDE"])).toBe(true);
    // Open and always shown from lg: the toggle is gone and the content is visible.
    expect(folded).toMatch(/<summary class="[^"]*lg:hidden/);
    expect(folded).toContain("lg:[&amp;::details-content]:[content-visibility:visible]");
    expect(folded).not.toMatch(/(^|[ "])md:hidden/);
  });

  it("passes data-* and aria-* to the root", () => {
    const named = renderToStaticMarkup(
      <SideColumn aside="ASIDE" data-testid="chat" aria-label="Chat">
        MAIN
      </SideColumn>,
    );
    expect(named).toMatch(/^<div data-testid="chat" aria-label="Chat"/);
  });
});
