import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { LinkRenderProps } from "./link.js";
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
});

describe("NavTabs orientation", () => {
  it("is a wrapping row by default", () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" />);
    expect(out).toContain("flex-wrap");
    expect(out).not.toContain("flex-col");
  });

  it('stacks one link per line with orientation="vertical", with the same pills and aria-current', () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" orientation="vertical" />);
    expect(out).toMatch(/<nav aria-label="Main" class="[^"]*flex-col/);
    expect(out).not.toContain("flex-wrap");
    expect(out.match(/<a /g)).toHaveLength(3);
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out).toMatch(/<a href="\/stores"[^>]*aria-current="page"/);
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

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-to={to} {...rest} />
);

describe("NavTabs with a router Link", () => {
  const tabs = [
    { label: "Quotes", active: true, render: (p: LinkRenderProps) => <Link to="/quotes" {...p} /> },
    { label: "Settings", render: (p: LinkRenderProps) => <Link to="/settings" {...p} /> },
  ];

  it("draws each tab with its render, in the tab classes", () => {
    const out = renderToStaticMarkup(<NavTabs items={tabs} label="Main" />);
    expect(out).toContain('data-to="/quotes"');
    expect(out).toContain('data-to="/settings"');
    expect(out).toContain(navTabClass(true));
    expect(out).toContain(navTabClass(false));
    expect(out).not.toContain("href=");
  });

  it("hands the active tab aria-current, and no other", () => {
    const out = renderToStaticMarkup(<NavTabs items={tabs} label="Main" />);
    expect(out.match(/aria-current="page"/g)).toHaveLength(1);
    expect(out).toMatch(
      /data-to="\/quotes"[^>]*aria-current="page"|aria-current="page"[^>]*data-to="\/quotes"/,
    );
  });

  it("keeps the nav layout and mixes with plain <a> tabs", () => {
    const out = renderToStaticMarkup(
      <NavTabs items={[tabs[0]!, { label: "Docs", href: "/docs" }]} label="Main" />,
    );
    expect(out).toContain("flex flex-wrap gap-1 text-sm");
    expect(out).toContain('<a href="/docs"');
  });
});

describe("NavTabs external tabs", () => {
  it("opens an external tab in a new tab", () => {
    const out = renderToStaticMarkup(
      <NavTabs
        items={[{ label: "Traces", href: "https://t.example", external: true }]}
        label="Main"
      />,
    );
    expect(out).toContain('href="https://t.example"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noreferrer"');
  });

  it("leaves a plain tab without target or rel", () => {
    const out = renderToStaticMarkup(<NavTabs items={items} label="Main" />);
    expect(out).not.toContain("target");
    expect(out).not.toContain("rel=");
  });
});

describe("NavTabs data-*", () => {
  it("puts an item's data-* on its link, and no other item's", () => {
    const out = renderToStaticMarkup(
      <NavTabs
        label="Sections"
        items={[
          { label: "Map", href: "/", "data-testid": "tab-map" },
          { label: "Events", href: "/events" },
        ]}
      />,
    );
    expect(out).toMatch(/<a[^>]*data-testid="tab-map"/);
    expect(out.match(/data-testid/g)).toHaveLength(1);
  });

  it("reaches a router's render", () => {
    const out = renderToStaticMarkup(
      <NavTabs
        label="Sections"
        items={[
          {
            label: "Map",
            "data-testid": "tab-map",
            render: (props: LinkRenderProps) => <a href="/" {...props} />,
          },
        ]}
      />,
    );
    expect(out).toMatch(/<a[^>]*data-testid="tab-map"/);
  });
});
