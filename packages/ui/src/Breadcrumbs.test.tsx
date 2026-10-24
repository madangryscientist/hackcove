import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Breadcrumbs, crumbLinkClass } from "./Breadcrumbs.js";
import type { LinkRenderProps } from "./link.js";

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

  it("dims a plain-text parent crumb and leaves the current crumb at full strength", () => {
    const out = renderToStaticMarkup(<Breadcrumbs crumbs={["Org", "Project", "Build"]} />);
    expect(out.match(/<span class="min-w-0 truncate text-slate-500">/g)).toHaveLength(2);
    expect(out).toContain('<span class="min-w-0 truncate font-medium text-slate-900">Build</span>');
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

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.
const Link = ({ to, ...rest }: { to: string } & LinkRenderProps): ReactElement => (
  <a data-to={to} {...rest} />
);

describe("Breadcrumbs link crumbs", () => {
  it("draws a crumb object with href as an <a> in the crumb link classes", () => {
    const out = renderToStaticMarkup(
      <Breadcrumbs crumbs={[{ label: "Org", href: "/org" }, "Project"]} />,
    );
    expect(out).toContain(`<a href="/org" class="${crumbLinkClass}">Org</a>`);
  });

  it("draws a crumb with render as the app's own Link, with no href", () => {
    const out = renderToStaticMarkup(
      <Breadcrumbs
        crumbs={[{ label: "Quotes", render: (p) => <Link to="/quotes" {...p} /> }, "Quote 12"]}
      />,
    );
    expect(out).toContain('data-to="/quotes"');
    expect(out).toContain(crumbLinkClass);
    expect(out).not.toContain("href=");
  });

  it("never links the last crumb, even if it is given a href", () => {
    const out = renderToStaticMarkup(
      <Breadcrumbs
        crumbs={[
          { label: "Org", href: "/org" },
          { label: "Here", href: "/here" },
        ]}
      />,
    );
    expect(out).not.toContain('href="/here"');
    expect(out).toContain("Here");
    expect(out.match(/<a /g)).toHaveLength(1);
  });

  it("external opens in a new tab", () => {
    const out = renderToStaticMarkup(
      <Breadcrumbs
        crumbs={[{ label: "Docs", href: "https://d.example", external: true }, "Page"]}
      />,
    );
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noreferrer"');
  });

  it("still takes an element as a crumb", () => {
    const out = renderToStaticMarkup(
      <Breadcrumbs
        crumbs={[
          <a key="a" href="/a" className={crumbLinkClass}>
            A
          </a>,
          "B",
        ]}
      />,
    );
    expect(out).toContain('<a href="/a"');
  });
});
