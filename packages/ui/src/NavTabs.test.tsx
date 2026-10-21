import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NavTabs, navTabClass } from "./NavTabs.js";

const items = [
  { label: "Map", href: "/" },
  { label: "Directory", href: "/stores", active: true },
  { label: "Events", href: "/events" },
];

describe("NavTabs", () => {
  it("renders one <a> per item with its href", () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" />);
    expect(out.match(/<a /g)).toHaveLength(3);
    expect(out).toContain('href="/"');
    expect(out).toContain('href="/stores"');
    expect(out).toContain('href="/events"');
  });

  it("marks only the active item with aria-current and font-medium", () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" />);
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out.match(/font-medium/g)).toHaveLength(1);
    expect(out).toMatch(/<a href="\/stores"[^>]*aria-current="page"/);
  });

  it("names the nav landmark with aria-label", () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" />);
    expect(out).toContain('<nav aria-label="Main"');
  });

  it("appends a className to the nav", () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" className="mt-4" />);
    expect(out).toContain("mt-4");
  });
});

describe("navTabClass", () => {
  it("gives an inactive tab a hover fill", () => {
    expect(navTabClass(false)).toContain("hover:bg-slate-100");
  });

  it("fills and emphasises an active tab", () => {
    expect(navTabClass(true)).toContain("bg-slate-100");
    expect(navTabClass(true)).toContain("font-medium");
  });
});
