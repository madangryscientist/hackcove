// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "./render.harness.js";
import { Tabs } from "./Tabs.js";

const items = [
  { label: "Map", href: "/" },
  { label: "Directory", href: "/stores", selected: true },
  { label: "Events", href: "/events" },
];

const nav = () => screen.getByRole("navigation", { name: "Main" });

const forms = [
  ["across", () => <Tabs items={items} label="Main" />],
  ["in the vertical rail", () => <Tabs items={items} label="Main" orientation="vertical" />],
] as const;

describe.each(forms)("Tabs link items, %s", (_form, tabs) => {
  it("is a nav named by label, with one link per item to its href", () => {
    render(tabs());
    expect(
      within(nav())
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["Map", "/"],
      ["Directory", "/stores"],
      ["Events", "/events"],
    ]);
  });

  it("marks only the selected item as the current page", () => {
    render(tabs());
    expect(
      within(nav())
        .getAllByRole("link")
        .map((link) => link.getAttribute("aria-current")),
    ).toEqual([null, "page", null]);
  });
});

describe("Tabs link items, external", () => {
  it("opens an external tab in a new tab", () => {
    render(
      <Tabs
        items={[{ label: "Traces", href: "https://t.example", external: true }]}
        label="Main"
      />,
    );
    const link = screen.getByRole("link", { name: "Traces" });
    expect(link.getAttribute("href")).toBe("https://t.example");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noreferrer");
  });

  it("leaves a plain tab in the same tab, without target or rel", () => {
    render(<Tabs items={items} label="Main" />);
    const link = screen.getByRole("link", { name: "Map" });
    expect(link.hasAttribute("target")).toBe(false);
    expect(link.hasAttribute("rel")).toBe(false);
  });
});
