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
    const out = renderToStaticMarkup(<PageFade>page</PageFade>);
    expect(out).toContain('<div data-page-fade="hc-page">page</div>');
  });

  it("names the element in a stylesheet that carries no colour", () => {
    const out = renderToStaticMarkup(<PageFade>x</PageFade>);
    expect(out).toContain('[data-page-fade="hc-page"]{view-transition-name:hc-page}');
    expect(out).not.toMatch(/#[0-9a-f]{3}|rgb|hsl/i);
  });

  it("turns the animations off under prefers-reduced-motion", () => {
    const out = renderToStaticMarkup(<PageFade>x</PageFade>);
    expect(out).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[^}]*animation:none/);
  });

  it("takes its own name, so two on a page do not collide", () => {
    const out = renderToStaticMarkup(<PageFade name="side">x</PageFade>);
    expect(out).toContain('[data-page-fade="side"]{view-transition-name:side}');
    expect(out).toContain('<div data-page-fade="side">');
  });

  it("keeps the children the first child of the div, and forwards props", () => {
    const out = renderToStaticMarkup(<PageFade id="content">x</PageFade>);
    expect(out).toContain('id="content"');
    expect(out).toMatch(/<div [^>]*>x<\/div>/);
  });
});

describe("startPageTransition", () => {
  it("runs the update inside a view transition when the browser has one", () => {
    stubMotion(false);
    const start = vi.fn<(run: () => void) => { ready: Promise<void> }>((run) => {
      run();
      return { ready: Promise.resolve() };
    });
    Reflect.set(document, "startViewTransition", start);
    const update = vi.fn<() => void>();
    startPageTransition(update);
    expect(start).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledOnce();
  });

  it("swallows the rejection of a skipped transition", async () => {
    stubMotion(false);
    const ready = Promise.reject(new DOMException("skipped", "AbortError"));
    const catchSpy = vi.spyOn(ready, "catch");
    Reflect.set(document, "startViewTransition", () => ({ ready }));
    startPageTransition(vi.fn<() => void>());
    expect(catchSpy).toHaveBeenCalledOnce();
    await ready.catch(() => {});
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
