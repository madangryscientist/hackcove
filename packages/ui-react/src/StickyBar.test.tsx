import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FullBleedLayout } from "./PageLayouts.js";
import { StickyBar } from "./StickyBar.js";

describe("StickyBar", () => {
  it("sticks under AppShell's header, on the surface with a bottom line and the Container's padding", () => {
    const out = renderToStaticMarkup(<StickyBar>BAR</StickyBar>);
    const classes = /^<div class="([^"]*)">BAR<\/div>$/.exec(out)?.[1]?.split(" ") ?? [];
    expect(classes).toEqual(
      expect.arrayContaining([
        "sticky",
        "top-[var(--app-header,0px)]",
        "z-5",
        "border-b",
        "border-slate-200",
        "bg-white",
        "px-4",
        "sm:px-6",
      ]),
    );
  });

  it("is the bar FullBleedLayout draws, not a second copy", () => {
    const out = renderToStaticMarkup(<FullBleedLayout bar="BAR">VIEW</FullBleedLayout>);
    expect(out).toContain(renderToStaticMarkup(<StickyBar>BAR</StickyBar>));
  });
});
