// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "./AppShell.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

const menuOf = (out: string) => /<details[^>]*>.*<\/details>/.exec(out)?.[0] ?? "";

const open = (container: HTMLElement) => {
  const details = container.querySelector("details");
  if (!details) throw new Error("no menu");
  act(() => {
    details.open = true;
  });
  return details;
};

describe("AppShell phone menu", () => {
  it("draws no menu without a nav or a subnav", () => {
    const out = renderToStaticMarkup(
      <AppShell brand="B" controls="C" header="H">
        x
      </AppShell>,
    );
    expect(out).not.toContain("<details");
  });

  it("draws a native disclosure, shown below md only, named Menu by default", () => {
    const out = renderToStaticMarkup(
      <AppShell nav={<nav aria-label="Main">tabs</nav>}>x</AppShell>,
    );
    expect(out).toMatch(/<details class="group shrink-0 md:hidden">/);
    expect(out).toMatch(/<summary [^>]*>.*Menu<\/summary>/);
  });

  it("takes the menu button's name from menuLabel", () => {
    const out = renderToStaticMarkup(
      <AppShell nav="n" menuLabel="Navigatie">
        x
      </AppShell>,
    );
    expect(out).toMatch(/<\/svg>Navigatie<\/summary>/);
    expect(out).not.toContain(">Menu<");
  });

  it("holds the nav and the subnav in the panel, in that order", () => {
    const out = renderToStaticMarkup(
      <AppShell
        nav={<nav aria-label="Main">main-links</nav>}
        subnav={<nav aria-label="Section">section-links</nav>}
      >
        x
      </AppShell>,
    );
    const menu = menuOf(out);
    expect(menu).toContain("main-links");
    expect(menu).toContain("section-links");
    expect(menu.indexOf("main-links")).toBeLessThan(menu.indexOf("section-links"));
  });

  it("draws the menu for a subnav alone", () => {
    expect(renderToStaticMarkup(<AppShell subnav="S">x</AppShell>)).toContain("<details");
  });

  it("hangs the panel under the header, out of flow, so the header keeps its height", () => {
    const out = renderToStaticMarkup(<AppShell nav="n">x</AppShell>);
    expect(out).toMatch(
      /<div class="absolute inset-x-0 top-full [^"]*max-h-\[calc\(100dvh-var\(--app-header\)\)\][^"]*">/,
    );
  });

  it("closes on Escape and returns focus to the button", () => {
    const container = mount(<AppShell nav={<a href="/a">A</a>}>x</AppShell>);
    const details = open(container);
    const link = details.querySelector("a");
    act(() => {
      link?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(details.querySelector("summary"));
  });

  it("closes when a link in the panel is followed, for a router that does not reload", () => {
    const container = mount(
      <AppShell
        nav={
          <a href="#a" onClick={(e) => e.preventDefault()}>
            A
          </a>
        }
      >
        x
      </AppShell>,
    );
    const details = open(container);
    act(() => {
      details.querySelector("a")?.click();
    });
    expect(details.open).toBe(false);
  });

  it("stays open when something other than a link is clicked", () => {
    const container = mount(<AppShell nav={<span>plain</span>}>x</AppShell>);
    const details = open(container);
    act(() => {
      details.querySelector("span")?.click();
    });
    expect(details.open).toBe(true);
  });
});

const buttonsNamed = (container: HTMLElement, name: string) =>
  [...container.querySelectorAll("button")].filter((b) => b.textContent === name);

describe("AppShell menuControls", () => {
  const signOut = <button type="button">Sign out</button>;
  const nav = <a href="/builds">Builds</a>;

  it("renders them exactly once, inside the menu, above the nav", () => {
    const container = mount(
      <AppShell nav={nav} menuControls={signOut}>
        x
      </AppShell>,
    );
    const found = buttonsNamed(container, "Sign out");
    expect(found).toHaveLength(1);
    const details = open(container);
    expect(details.contains(found[0] ?? null)).toBe(true);
    const link = details.querySelector('a[href="/builds"]');
    if (!link) throw new Error("no nav link in the menu");
    expect(
      (found[0]?.compareDocumentPosition(link) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("gives the Menu with menuControls and no nav or subnav", () => {
    const out = renderToStaticMarkup(<AppShell menuControls={signOut}>x</AppShell>);
    expect(menuOf(out)).toContain("<summary");
    expect(menuOf(out)).toContain("Sign out");
  });

  it("shows them inline from md: the details drops its box and its content stays visible closed", () => {
    const out = renderToStaticMarkup(<AppShell menuControls={signOut}>x</AppShell>);
    const details = /<details class="([^"]*)"/.exec(out)?.[1]?.split(" ") ?? [];
    expect(details).toEqual(
      expect.arrayContaining([
        "md:contents",
        "md:[&amp;::details-content]:[content-visibility:visible]",
      ]),
    );
    expect(details).not.toContain("md:hidden");
  });

  it("keeps the menu hidden from md when there are no menuControls", () => {
    const out = renderToStaticMarkup(<AppShell nav={nav}>x</AppShell>);
    expect(/<details class="([^"]*)"/.exec(out)?.[1]?.split(" ")).toContain("md:hidden");
  });

  it("puts controls in a box of their own that clips, beside the menu, so the Menu is never the part cut off", () => {
    const out = renderToStaticMarkup(
      <AppShell nav={nav} controls={<span>toggle</span>}>
        x
      </AppShell>,
    );
    const box = /<div class="([^"]*)"><span>toggle<\/span><\/div><details/.exec(out)?.[1];
    expect(box?.split(" ")).toEqual(expect.arrayContaining(["min-w-0", "overflow-x-clip"]));
  });
});
