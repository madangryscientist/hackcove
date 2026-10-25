import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListRow } from "./ListRow.js";

describe("ListRow", () => {
  it("is a full-width button with a hover fill and the label and trailing content", () => {
    const out = renderToStaticMarkup(<ListRow trailing="R 4 250">Rent</ListRow>);
    expect(out).toContain('<button type="button"');
    expect(out).toContain("w-full");
    expect(out).toContain("hover:bg-slate-50");
    expect(out).toContain('<span class="min-w-0 flex-1">Rent</span>');
    expect(out).toContain(">R 4 250</span>");
    expect(out).not.toContain("aria-expanded");
    expect(out).not.toContain("<svg");
  });

  it("passes button props through, onClick aside", () => {
    const out = renderToStaticMarkup(
      <ListRow disabled className="mt-1" aria-controls="rows">
        Rent
      </ListRow>,
    );
    expect(out).toContain("disabled");
    expect(out).toContain('aria-controls="rows"');
    expect(out).toContain("mt-1");
  });

  it("expanded makes a collapsible header: aria-expanded and a chevron that turns when open", () => {
    const closed = renderToStaticMarkup(<ListRow expanded={false}>Details</ListRow>);
    const open = renderToStaticMarkup(<ListRow expanded>Details</ListRow>);
    expect(closed).toContain('aria-expanded="false"');
    expect(open).toContain('aria-expanded="true"');
    expect(closed).toContain("<svg");
    expect(closed).not.toContain("rotate-90");
    expect(open).toContain("rotate-90");
  });

  it("is a link with href", () => {
    const out = renderToStaticMarkup(
      <ListRow href="/status" trailing="3">
        Status
      </ListRow>,
    );
    expect(out).toContain('<a href="/status"');
    expect(out).toContain("hover:bg-slate-50");
    expect(out).not.toContain("<button");
  });

  it("render draws the app's own link, handed the row's classes", () => {
    const out = renderToStaticMarkup(
      <ListRow render={(props) => <a data-router="1" href="/x" {...props} />}>Go</ListRow>,
    );
    expect(out).toContain('data-router="1"');
    expect(out).toContain("hover:bg-slate-50");
  });
});
