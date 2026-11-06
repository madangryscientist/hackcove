import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DetailLayout, FullBleedLayout } from "./PageLayouts.js";

describe("DetailLayout asideLabel", () => {
  it("names the <aside> without folding it, and leaves it unnamed without", () => {
    const named = renderToStaticMarkup(
      <DetailLayout title="Quote 7" aside="SIDE" asideLabel="Quote facts">
        MAIN
      </DetailLayout>,
    );
    expect(named).toMatch(/<aside [^>]*aria-label="Quote facts"/);
    expect(named).not.toContain("<details");
    const bare = renderToStaticMarkup(
      <DetailLayout title="Quote 7" aside="SIDE">
        MAIN
      </DetailLayout>,
    );
    expect(bare).not.toContain("aria-label");
  });

  it("names the sticky aside too, and its scroller carries no label until it takes a tab stop", () => {
    const sticky = renderToStaticMarkup(
      <DetailLayout title="Quote 7" aside="SIDE" asideLabel="Quote facts" stickyAside>
        MAIN
      </DetailLayout>,
    );
    expect(sticky.match(/aria-label=/g)).toHaveLength(1);
    expect(sticky).not.toContain("tabindex");
  });
});

describe("FullBleedLayout panelLabel", () => {
  it("names the panel's <aside>, and leaves it unnamed without", () => {
    const named = renderToStaticMarkup(
      <FullBleedLayout panel="PANEL" panelLabel="Snapshot facts">
        VIEW
      </FullBleedLayout>,
    );
    expect(named).toMatch(/<aside [^>]*aria-label="Snapshot facts"/);
    const bare = renderToStaticMarkup(<FullBleedLayout panel="PANEL">VIEW</FullBleedLayout>);
    expect(bare).not.toContain("aria-label");
  });
});
