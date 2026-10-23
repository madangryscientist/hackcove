// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ColourScheme } from "./colourScheme.js";
import { ColourSchemeToggle } from "./ColourSchemeToggle.js";
import { mount, unmount } from "./dom.harness.js";

const KEY = "hackcove:colour-scheme";
const root = document.documentElement;

function reset(): void {
  localStorage.clear();
  root.classList.remove("dark");
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
    const out = renderToStaticMarkup(<ColourSchemeToggle className="ml-2" />);
    expect(out).toContain('aria-label="Switch to dark theme"');
    expect(out).toMatch(/class="[^"]*ml-2"/);
    expect(out).toContain("<svg");
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
});
