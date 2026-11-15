// @vitest-environment jsdom
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ColourScheme } from "./colourScheme.js";
import { ColourSchemeToggle } from "./ColourSchemeToggle.js";
import { act, render, screen, user } from "./render.harness.js";

const KEY = "hackcove:colour-scheme";
const root = document.documentElement;

function reset(): void {
  localStorage.clear();
  root.removeAttribute("class");
  root.style.removeProperty("color-scheme");
}

/** The tooltip, which follows the scheme the client reads once it has hydrated. */
const title = (): string | null => screen.getByRole("button").getAttribute("title");

beforeEach(reset);
afterEach(() => {
  vi.restoreAllMocks();
  reset();
});

describe("ColourSchemeToggle", () => {
  it("offers dark on a light page and flips the class, color-scheme and stored key on click", async () => {
    const onChange = vi.fn<(scheme: ColourScheme) => void>();
    render(<ColourSchemeToggle onChange={onChange} />);
    expect(title()).toBe("Switch to dark theme");

    await user().click(screen.getByRole("button"));
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(KEY)).toBe("dark");
    expect(onChange).toHaveBeenLastCalledWith("dark");
    expect(title()).toBe("Switch to light theme");

    await user().click(screen.getByRole("button"));
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(false);
    expect(root.style.colorScheme).toBe("light");
    expect(localStorage.getItem(KEY)).toBe("light");
    expect(onChange).toHaveBeenLastCalledWith("light");
    expect(title()).toBe("Switch to dark theme");
  });

  it("agrees with the dark class the head script left on <html> when it mounts", () => {
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.add("dark");
    render(<ColourSchemeToggle />);
    expect(title()).toBe("Switch to light theme");
  });

  it("follows a change to <html> made elsewhere", async () => {
    render(<ColourSchemeToggle />);
    // The toggle follows <html> through a MutationObserver, which reports on a microtask.
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    await act(async () => root.classList.add("dark"));
    expect(title()).toBe("Switch to light theme");
  });

  it("still switches when storage throws", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    render(<ColourSchemeToggle />);
    await user().click(screen.getByRole("button"));
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(true);
    expect(title()).toBe("Switch to light theme");
  });

  it("takes its scheme classes from `schemes` and swaps them on click", async () => {
    const schemes = { light: "my-light", dark: "dark" };
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    root.classList.add("my-light");
    const onChange = vi.fn<(scheme: ColourScheme) => void>();
    render(<ColourSchemeToggle schemes={schemes} onChange={onChange} />);
    expect(title()).toBe("Switch to dark theme");

    await user().click(screen.getByRole("button"));
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect([...root.classList]).toEqual(["dark"]);
    expect(root.style.colorScheme).toBe("dark");
    expect(onChange).toHaveBeenLastCalledWith("dark");
    expect(title()).toBe("Switch to light theme");

    await user().click(screen.getByRole("button"));
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect([...root.classList]).toEqual(["my-light"]);
    expect(root.style.colorScheme).toBe("light");
    expect(title()).toBe("Switch to dark theme");
  });

  it("puts id on the button, and is an action, not a toggle", () => {
    render(<ColourSchemeToggle id="theme" />);
    const button = screen.getByRole("button");
    expect(button.id).toBe("theme");
    expect(title()).toBe("Switch to dark theme");
    // It names the action ("Switch to dark theme"), so a pressed state would contradict its name.
    expect(button.hasAttribute("aria-pressed")).toBe(false);
  });

  it("with store={false} switches and calls onChange but writes no localStorage", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const onChange = vi.fn<(scheme: ColourScheme) => void>();
    render(<ColourSchemeToggle store={false} onChange={onChange} />);
    await user().click(screen.getByRole("button"));
    // oxlint-disable-next-line no-restricted-properties -- the head script's contract on <html>, not look
    expect(root.classList.contains("dark")).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith("dark");
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  describe("hydrating the server markup", () => {
    const paper = { light: "my-light", dark: "dark" };
    let teardown: (() => void) | undefined;
    afterEach(() => {
      teardown?.();
      teardown = undefined;
    });

    /**
     * Put what the server rendered for `defaultValue` in the page, with `<html>` as the server left it,
     * then hydrate it. Returns the console errors the hydration raised.
     */
    async function serveAndHydrate(initial: ColourScheme | undefined, htmlClass: string) {
      root.setAttribute("class", htmlClass);
      const host = document.createElement("div");
      // server render feeds the hydration check
      host.innerHTML = renderToString(
        <ColourSchemeToggle schemes={paper} defaultValue={initial} />,
      );
      document.body.append(host);
      // No tooltip in the server markup, so a wrong one is never shown before hydration.
      const titledBeforeHydration = screen.getByRole("button").hasAttribute("title");
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});
      const hydrated = await act(async () =>
        hydrateRoot(host, <ColourSchemeToggle schemes={paper} defaultValue={initial} />),
      );
      teardown = () => {
        act(() => hydrated.unmount());
        host.remove();
      };
      return { titledBeforeHydration, errors: errors.mock.calls };
    }

    it("with `defaultValue` set, matches the server on a dark cookie with no mismatch", async () => {
      const { titledBeforeHydration, errors } = await serveAndHydrate("dark", "dark");
      expect(titledBeforeHydration).toBe(false);
      expect(errors).toEqual([]);
      expect(title()).toBe("Switch to light theme");
    });

    it("with `defaultValue` set, matches the server on a light cookie with no mismatch", async () => {
      const { titledBeforeHydration, errors } = await serveAndHydrate("light", "my-light");
      expect(titledBeforeHydration).toBe(false);
      expect(errors).toEqual([]);
      expect(title()).toBe("Switch to dark theme");
    });

    it("without `defaultValue`, a dark page still ends up showing dark once hydrated", async () => {
      const { titledBeforeHydration } = await serveAndHydrate(undefined, "dark");
      expect(titledBeforeHydration).toBe(false);
      expect(title()).toBe("Switch to light theme");
    });
  });
});
