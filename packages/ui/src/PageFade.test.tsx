// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageFade, startPageTransition } from "./PageFade.js";

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(document, "startViewTransition");
});

function stubMotion(reduce: boolean): void {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: reduce && query === "(prefers-reduced-motion: reduce)",
  }));
}

describe("PageFade", () => {
  it("renders a div named for the transition, holding the children", () => {
    const out = renderToStaticMarkup(<PageFade className="py-8">page</PageFade>);
    expect(out.startsWith('<div data-page-fade="" class="py-8">')).toBe(true);
    expect(out).toContain("page</div>");
  });

  it("styles the transition with a fade in and out, carrying no colour", () => {
    const out = renderToStaticMarkup(<PageFade>x</PageFade>);
    expect(out).toContain("view-transition-name:hc-page");
    expect(out).toContain("::view-transition-old(hc-page)");
    expect(out).toContain("::view-transition-new(hc-page)");
    expect(out).not.toMatch(/#[0-9a-f]{3}|rgb|hsl/i);
  });

  it("turns the animations off under prefers-reduced-motion", () => {
    const out = renderToStaticMarkup(<PageFade>x</PageFade>);
    expect(out).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^}]*animation:none/);
  });

  it("forwards props to the div", () => {
    const out = renderToStaticMarkup(<PageFade id="content">x</PageFade>);
    expect(out).toContain('id="content"');
  });
});

describe("startPageTransition", () => {
  it("runs the update inside a view transition when the browser has one", () => {
    stubMotion(false);
    const start = vi.fn<(run: () => void) => void>((run) => run());
    Reflect.set(document, "startViewTransition", start);
    const update = vi.fn<() => void>();
    startPageTransition(update);
    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("just runs the update where the browser has no View Transitions", () => {
    stubMotion(false);
    const update = vi.fn<() => void>();
    startPageTransition(update);
    expect(update).toHaveBeenCalledOnce();
  });

  it("skips the transition under prefers-reduced-motion", () => {
    stubMotion(true);
    const start = vi.fn<(run: () => void) => void>();
    Reflect.set(document, "startViewTransition", start);
    const update = vi.fn<() => void>();
    startPageTransition(update);
    expect(start).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledOnce();
  });

  it("runs the update where matchMedia is missing", () => {
    vi.stubGlobal("matchMedia", undefined);
    const update = vi.fn<() => void>();
    startPageTransition(update);
    expect(update).toHaveBeenCalledOnce();
  });
});
