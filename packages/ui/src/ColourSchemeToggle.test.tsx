// @vitest-environment jsdom
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ColourScheme } from "./colourScheme.js";
import { ColourSchemeToggle } from "./ColourSchemeToggle.js";
import { mount, unmount } from "./dom.harness.js";

const KEY = "hackcove:colour-scheme";
const root = document.documentElement;

function reset(): void {
  localStorage.clear();
  root.className = "";
  root.style.removeProperty("color-scheme");
}

const buttonOf = (container: HTMLElement): HTMLButtonElement => {
  const button = container.querySelector("button");
  if (!button) throw new Error("no <button> rendered");
  return button;
};

// The toggle follows <html> through a MutationObserver, which reports on a microtask.
const click = (button: HTMLButtonElement) => act(async () => button.click());

beforeEach(reset);
afterEach(() => {
  unmount();
  vi.restoreAllMocks();
  reset();
});

describe("ColourSchemeToggle", () => {
  it("renders the light state on the server, with no document to read", () => {
    const out = renderToStaticMarkup(<ColourSchemeToggle />);
    expect(out).toContain('aria-label="Switch to dark theme"');
    expect(out).toContain("<svg");
  });

  it("draws both icons and picks one from the class on <html>, so the first frame needs no hydration", () => {
    const out = renderToStaticMarkup(<ColourSchemeToggle />);
    expect(out).toContain('data-scheme-icon="sun"');
    expect(out).toContain('data-scheme-icon="moon"');
    // Light page: moon only. Dark page: sun only.
    expect(out).toContain('<style>[data-scheme-icon="sun"]{display:none}');
    expect(out.startsWith("<button")).toBe(true);
    expect(out).toContain(':root[class~="dark"] [data-scheme-icon="sun"]{display:inline}');
    expect(out).toContain(':root[class~="dark"] [data-scheme-icon="moon"]{display:none}');
  });

  it("keys the rule on the app's own dark class, or on the light class's absence when dark has none", () => {
    const own = renderToStaticMarkup(
      <ColourSchemeToggle schemes={{ light: "paper", dark: "ink" }} />,
    );
    expect(own).toContain(':root[class~="ink"] [data-scheme-icon="sun"]');
    expect(own).not.toContain('"dark"');
    const bare = renderToStaticMarkup(
      <ColourSchemeToggle schemes={{ light: "paper", dark: "" }} />,
    );
    expect(bare).toContain(':root:not([class~="paper"]) [data-scheme-icon="sun"]{display:inline}');
    const none = renderToStaticMarkup(<ColourSchemeToggle schemes={{ light: "", dark: "" }} />);
    expect(none).not.toContain(":root");
  });

  it("offers dark on a light page and flips the class, color-scheme and stored key on click", async () => {
    const onChange = vi.fn<(scheme: ColourScheme) => void>();
    const button = buttonOf(mount(<ColourSchemeToggle onChange={onChange} />));
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");

    await click(button);
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(KEY)).toBe("dark");
    expect(onChange).toHaveBeenLastCalledWith("dark");
    expect(button.getAttribute("aria-label")).toBe("Switch to light theme");

    await click(button);
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
    expect(localStorage.getItem(KEY)).toBe("light");
    expect(onChange).toHaveBeenLastCalledWith("light");
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
  });

  it("agrees with the dark class the head script left on <html> when it mounts", () => {
    root.classList.add("dark");
    const button = buttonOf(mount(<ColourSchemeToggle />));
    expect(button.getAttribute("aria-label")).toBe("Switch to light theme");
  });

  it("follows a change to <html> made elsewhere", async () => {
    const button = buttonOf(mount(<ColourSchemeToggle />));
    await act(async () => root.classList.add("dark"));
    expect(button.getAttribute("aria-label")).toBe("Switch to light theme");
  });

  it("still switches when storage throws", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const button = buttonOf(mount(<ColourSchemeToggle />));
    await click(button);
    expect(root.classList.contains("dark")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("Switch to light theme");
  });

  it("takes its scheme classes from `schemes` and swaps them on click", async () => {
    const schemes = { light: "paper", dark: "dark" };
    root.classList.add("paper");
    const onChange = vi.fn<(scheme: ColourScheme) => void>();
    const button = buttonOf(mount(<ColourSchemeToggle schemes={schemes} onChange={onChange} />));
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");

    await click(button);
    expect([...root.classList]).toEqual(["dark"]);
    expect(root.style.colorScheme).toBe("dark");
    expect(onChange).toHaveBeenLastCalledWith("dark");
    expect(button.getAttribute("aria-label")).toBe("Switch to light theme");

    await click(button);
    expect([...root.classList]).toEqual(["paper"]);
    expect(root.style.colorScheme).toBe("light");
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
  });

  it("puts id and data-* on the button, and leaves its own props alone", () => {
    const button = buttonOf(mount(<ColourSchemeToggle id="theme" data-testid="toggle" />));
    expect(button.id).toBe("theme");
    expect(button.dataset["testid"]).toBe("toggle");
    expect(button.getAttribute("aria-label")).toBe("Switch to dark theme");
    expect(button.hasAttribute("aria-pressed")).toBe(false);
  });

  it("with store={false} switches and calls onChange but writes no localStorage", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const onChange = vi.fn<(scheme: ColourScheme) => void>();
    const button = buttonOf(mount(<ColourSchemeToggle store={false} onChange={onChange} />));
    await click(button);
    expect(root.classList.contains("dark")).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith("dark");
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  describe("hydrating the server markup", () => {
    /** Hydrate what the server rendered for `initial`, with `<html>` as the server left it. */
    async function hydrate(initial: ColourScheme | undefined, htmlClass: string) {
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});
      const markup = renderToStaticMarkup(<ColourSchemeToggle schemes={paper} initial={initial} />);
      root.className = htmlClass;
      const container = document.createElement("div");
      container.innerHTML = markup;
      document.body.append(container);
      const hydrated = await act(async () =>
        hydrateRoot(container, <ColourSchemeToggle schemes={paper} initial={initial} />),
      );
      const label = buttonOf(container).getAttribute("aria-label");
      act(() => hydrated.unmount());
      container.remove();
      return { label, errors: errors.mock.calls };
    }
    const paper = { light: "paper", dark: "dark" };

    it("with `initial` set, matches the server on a dark cookie with no mismatch", async () => {
      const { label, errors } = await hydrate("dark", "dark");
      expect(errors).toEqual([]);
      expect(label).toBe("Switch to light theme");
    });

    it("with `initial` set, matches the server on a light cookie with no mismatch", async () => {
      const { label, errors } = await hydrate("light", "paper");
      expect(errors).toEqual([]);
      expect(label).toBe("Switch to dark theme");
    });

    it("without `initial`, a dark page still ends up showing dark once hydrated", async () => {
      const { label } = await hydrate(undefined, "dark");
      expect(label).toBe("Switch to light theme");
    });
  });
});
