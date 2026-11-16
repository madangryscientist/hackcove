// @vitest-environment jsdom
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { DocsLayout, type DocsHeading } from "./DocsLayout.js";
import { render, screen, within } from "./render.harness.js";

const nav = [
  { items: [{ label: "Overview", href: "/docs/" }] },
  {
    title: "Guides",
    items: [
      { label: "Install", href: "/docs/install/", selected: true },
      { label: "Deploy", href: "/docs/deploy/" },
    ],
  },
];

const contents: DocsHeading[] = [
  { id: "setup", label: "Setup", level: 2 },
  { id: "keys", label: "Keys", level: 3 },
  { id: "run", label: "Run", level: 2 },
];

function page(props: Partial<ComponentProps<typeof DocsLayout>> = {}) {
  return render(
    <DocsLayout nav={nav} navLabel="Docs" title="Install" {...props}>
      <p>Body</p>
    </DocsLayout>,
  );
}

const marked = () =>
  document.querySelectorAll('[aria-label="On this page"] [aria-current="location"]');

const onThisPage = () => screen.queryAllByRole("navigation", { name: "On this page" });

describe("DocsLayout", () => {
  it("names the nav's landmark navLabel, each group's links by its title, and marks the current page", () => {
    page();
    const rail = screen.getByRole("complementary", { name: "Docs" });
    const guides = within(rail).getByRole("navigation", { name: "Guides" });
    expect(
      within(guides)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Install", "Deploy"]);
    expect(within(rail).getByRole("navigation", { name: "Docs" })).toBeTruthy();
    expect(within(guides).getByRole("link", { name: "Install" }).getAttribute("aria-current")).toBe(
      "page",
    );
  });

  it("the title is the one h1, with description and breadcrumbs when given", () => {
    page({ description: "Get it running.", breadcrumbs: <a href="/docs/">Docs home</a> });
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual([
      "Install",
    ]);
    expect(screen.getByText("Get it running.")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Docs home" })).toBeTruthy();
  });

  it("with two or more contents, one On this page navigation with one link to each #id", () => {
    page({ contents });
    const [list, ...more] = onThisPage();
    expect(more).toHaveLength(0);
    if (!list) throw new Error("no On this page list");
    const links = within(list).getAllByRole("link", { hidden: true });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["#setup", "#keys", "#run"]);
    expect(screen.getAllByText("Keys")).toHaveLength(1);
  });

  it("with one entry or none there is no On this page list", () => {
    const { unmount } = page({ contents: contents.slice(0, 1) });
    expect(onThisPage()).toHaveLength(0);
    unmount();
    page();
    expect(onThisPage()).toHaveLength(0);
  });

  it("current marks exactly that entry with aria-current=location; an unknown id marks none", () => {
    const { unmount } = page({ contents, current: "keys" });
    expect([...marked()].map((link) => link.textContent)).toEqual(["Keys"]);
    unmount();
    page({ contents, current: "nowhere" });
    expect(marked()).toHaveLength(0);
  });

  it("a level-3 entry follows its level-2 entry in the list", () => {
    page({ contents });
    const [list] = onThisPage();
    if (!list) throw new Error("no On this page list");
    const labels = within(list)
      .getAllByRole("link", { hidden: true })
      .map((link) => link.textContent);
    expect(labels.indexOf("Keys")).toBe(labels.indexOf("Setup") + 1);
  });

  it("previous and next are links in a Previous and Next navigation, previous first", () => {
    page({
      previous: { label: "Overview", href: "/docs/" },
      next: { label: "Deploy", href: "/docs/deploy/" },
    });
    const pager = screen.getByRole("navigation", { name: "Previous and Next" });
    expect(
      within(pager)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/docs/", "/docs/deploy/"]);
  });

  it("with only next there is one link, and with neither no such navigation", () => {
    const { unmount } = page({ next: { label: "Deploy", href: "/docs/deploy/" } });
    const pager = screen.getByRole("navigation", { name: "Previous and Next" });
    expect(within(pager).getAllByRole("link")).toHaveLength(1);
    unmount();
    page();
    expect(screen.queryByRole("navigation", { name: "Previous and Next" })).toBeNull();
  });

  it("contentsLabel, previousLabel and nextLabel rename the words and the landmarks", () => {
    page({
      contents,
      contentsLabel: "Auf dieser Seite",
      previous: { label: "Start", href: "/docs/" },
      next: { label: "Deploy", href: "/docs/deploy/" },
      previousLabel: "Zurück",
      nextLabel: "Weiter",
    });
    expect(screen.getByRole("navigation", { name: "Auf dieser Seite" })).toBeTruthy();
    const pager = screen.getByRole("navigation", { name: "Zurück and Weiter" });
    expect(within(pager).getByRole("link", { name: "Zurück: Start" })).toBeTruthy();
    expect(within(pager).getByRole("link", { name: "Weiter: Deploy" })).toBeTruthy();
  });
});
