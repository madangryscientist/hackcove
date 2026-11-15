// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "./Breadcrumbs.js";
import { render, screen, within } from "./render.harness.js";

const trail = () => screen.getByRole("navigation", { name: "Breadcrumb" });

describe("Breadcrumbs", () => {
  it("names the nav landmark Breadcrumb over an ordered list of the crumbs, in order", () => {
    render(<Breadcrumbs crumbs={["Org", "Project"]} />);
    const list = within(trail()).getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(["Org", "/Project"]);
  });

  it("marks only the last crumb as the current page", () => {
    render(<Breadcrumbs crumbs={["Org", "Project", "Build"]} />);
    const items = within(trail()).getAllByRole("listitem");
    expect(items.map((item) => item.getAttribute("aria-current"))).toEqual([null, null, "page"]);
    expect(items[2]?.textContent).toBe("/Build");
  });

  it("puts one separator between each pair of crumbs, hidden from assistive tech", () => {
    render(<Breadcrumbs crumbs={["Org", "Project", "Build", "Snap"]} />);
    const separators = screen.getAllByText("/");
    expect(separators).toHaveLength(3);
    for (const separator of separators) {
      expect(separator.getAttribute("aria-hidden")).toBe("true");
    }
    expect(within(trail()).getAllByRole("listitem")).toHaveLength(4);
  });
});

// A stand-in for a router's <Link>: it takes `to` and spreads the props it is handed.

describe("Breadcrumbs link crumbs", () => {
  it("draws a crumb object with href as a link to it", () => {
    render(<Breadcrumbs crumbs={[{ label: "Org", href: "/org" }, "Project"]} />);
    expect(screen.getByRole("link", { name: "Org" }).getAttribute("href")).toBe("/org");
  });

  it("never links the last crumb, even if it is given a href", () => {
    render(
      <Breadcrumbs
        crumbs={[
          { label: "Org", href: "/org" },
          { label: "Here", href: "/here" },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: "Here" })).toBeNull();
    expect(screen.getByText("Here")).not.toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("external opens in a new tab", () => {
    render(
      <Breadcrumbs
        crumbs={[{ label: "Docs", href: "https://d.example", external: true }, "Page"]}
      />,
    );
    const link = screen.getByRole("link", { name: "Docs" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("still takes an element as a crumb", () => {
    render(
      <Breadcrumbs
        crumbs={[
          <a key="a" href="/a">
            A
          </a>,
          "B",
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "A" }).getAttribute("href")).toBe("/a");
  });
});
