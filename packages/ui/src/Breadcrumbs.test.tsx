import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Breadcrumbs, crumbLinkClass } from "./Breadcrumbs.js";

describe("Breadcrumbs", () => {
  it("names the nav landmark Breadcrumb over an ordered list", () => {
    const out = renderToStaticMarkup(<Breadcrumbs crumbs={["Org", "Project"]} />);
    expect(out).toContain('<nav aria-label="Breadcrumb"');
    expect(out).toMatch(/<nav[^>]*><ol[^>]*>/);
  });

  it("marks only the last crumb with aria-current and the current-page emphasis", () => {
    const out = renderToStaticMarkup(<Breadcrumbs crumbs={["Org", "Project", "Build"]} />);
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out.match(/font-medium text-slate-900/g)).toHaveLength(1);
    expect(out).toMatch(/<li[^>]*aria-current="page"[^>]*>(?:(?!<\/li>).)*Build/);
  });

  it("renders one separator between each pair of crumbs, hidden from assistive tech", () => {
    const out = renderToStaticMarkup(<Breadcrumbs crumbs={["Org", "Project", "Build", "Snap"]} />);
    expect(out.match(/aria-hidden="true" class="text-slate-400"/g)).toHaveLength(3);
    expect(out.match(/<li/g)).toHaveLength(4);
  });
});

describe("crumbLinkClass", () => {
  it("styles a link crumb in the muted colour with an underline on hover and the shared focus ring", () => {
    expect(crumbLinkClass).toContain("text-slate-500");
    expect(crumbLinkClass).toContain("hover:underline");
    expect(crumbLinkClass).toContain("focus-visible:outline-violet-600");
  });
});
