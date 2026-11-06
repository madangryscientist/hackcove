import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SidebarLayout } from "./SidebarLayout.js";

/** Whether every text is in `out`, each after the one before it. */
const inOrder = (out: string, texts: string[]): boolean => {
  const found = texts.map((text) => out.indexOf(text));
  return found.every((index, i) => index >= 0 && (i === 0 || index > (found[i - 1] ?? 0)));
};

describe("SidebarLayout", () => {
  const out = renderToStaticMarkup(<SidebarLayout rail="RAIL">CANVAS</SidebarLayout>);

  it("lives in the shell's Container: no height, no full-bleed edge, no own padding", () => {
    expect(out).not.toMatch(/100vh|57px|(^|[ "])h-\[|min-h-0|flex-1 flex-col/);
    expect(out).not.toMatch(/\bpx-|\bpy-/);
  });

  it("stacks the rail above the canvas below md and makes it w-56 from md", () => {
    expect(out).toMatch(/^<div class="[^"]*flex-col[^"]* md:flex-row/);
    expect(out).toMatch(/<aside class="[^"]*w-full[^"]*md:w-56[^"]*">/);
    expect(inOrder(out, ["RAIL", "CANVAS"])).toBe(true);
  });

  it("leaves the rail on the page background: no fill and no border", () => {
    const aside = /<aside class="([^"]*)"/.exec(out)?.[1] ?? "";
    expect(aside).not.toMatch(/\bbg-|\bborder/);
  });

  it("lets the canvas shrink so a wide table scrolls inside it", () => {
    expect(out).toMatch(/<div class="min-w-0 flex-1">CANVAS<\/div>/);
  });

  it("sticks the rail under the shell's header from md, with and without railLabel", () => {
    const folded = renderToStaticMarkup(
      <SidebarLayout rail="RAIL" railLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    for (const markup of [out, folded]) {
      const aside = /<aside class="([^"]*)"/.exec(markup)?.[1]?.split(" ") ?? [];
      expect(aside).toContain("md:sticky");
      expect(aside).toContain("md:top-[var(--app-header,0px)]");
      // As tall as its rail, not the row: a stretched aside has no room to stick in.
      expect(aside).toContain("md:self-start");
      // The rail scrolls itself within the room under the header, padded so a focus ring is not cut.
      const scroller = /<\/?aside[^>]*><div class="([^"]*)"/.exec(markup)?.[1]?.split(" ") ?? [];
      expect(scroller).toEqual(
        expect.arrayContaining([
          "md:max-h-[calc(100dvh-var(--app-header,0px)-2rem)]",
          "md:overflow-y-auto",
          "md:p-1",
          "md:-m-1",
        ]),
      );
      // Below md nothing sticks or scrolls: every sticky class is behind md.
      expect(markup).not.toMatch(/(^|[ "])(sticky|overflow-y-auto|max-h-)/);
    }
  });

  it("folds a long rail behind a closed disclosure, summary first, only with railLabel", () => {
    const folded = renderToStaticMarkup(
      <SidebarLayout rail="RAIL" railLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    expect(folded).toContain("<details");
    expect(folded).not.toContain("<details open");
    expect(inOrder(folded, ["All sections", "RAIL", "CANVAS"])).toBe(true);
    expect(out).not.toContain("<details");
  });

  it("names the <aside> with railLabel, and leaves it unnamed without", () => {
    const named = renderToStaticMarkup(
      <SidebarLayout rail="RAIL" railLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    expect(named).toMatch(/<aside [^>]*aria-label="All sections"/);
    expect(out).not.toContain("aria-label");
  });
});
