import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader.js";
import { PageTitle } from "./ui.js";

describe("PageHeader", () => {
  it("renders only a PageHeading in a block with a fixed bottom margin when given a title", () => {
    const out = renderToStaticMarkup(<PageHeader title="Builds" />);
    expect(out).toMatch(/^<div class="mb-8">/);
    expect(out).toContain(">Builds</h1>");
    expect(out).not.toContain("<nav");
    expect(out).not.toContain("mb-2");
    expect(out).not.toContain("mt-4");
  });

  it("renders breadcrumbs above, subtitle under, actions beside and tabs below the title", () => {
    const out = renderToStaticMarkup(
      <PageHeader
        breadcrumbs={<nav>crumbs</nav>}
        title="Builds"
        subtitle="every build"
        actions={<button type="button">New</button>}
        tabs={<nav>tabs</nav>}
      />,
    );
    const order = ["crumbs", "Builds", "every build", "New", "tabs"].map((text) =>
      out.indexOf(text),
    );
    expect(order.every((at) => at >= 0)).toBe(true);
    expect(order).toEqual(order.toSorted((a, b) => a - b));
    expect(out).toContain("sm:flex-row");
  });
});

describe("PageTitle", () => {
  it("renders through the PageHeader content: semibold, no margin", () => {
    const out = renderToStaticMarkup(<PageTitle title="Status" subtitle="now" />);
    expect(out).toContain("font-semibold");
    expect(out).not.toContain("font-bold");
    expect(out).not.toContain("mb-8");
    expect(out).toContain(">now</p>");
  });
});
