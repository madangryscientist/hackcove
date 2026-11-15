// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server"; // markup read as data, below
import { afterEach, describe, expect, it, vi } from "vitest";
import { Morph } from "./Morph.js";
import { act, render, screen } from "./render.harness.js";

/** The transition name a Morph gives its element, read from the rendered element. */
function nameOf(name: string, item: string | number): string | null {
  const { unmount } = render(
    <Morph name={name} item={item}>
      x
    </Morph>,
  );
  const found = screen.getByText("x").getAttribute("data-morph");
  unmount();
  return found;
}

// The <style> a Morph renders beside its element has no role to find it by, so it is read from
// the server markup as data, as noLeak.test.tsx reads attribute names.
function stylesheet(name: string, item: string | number): string {
  const node = (
    <Morph name={name} item={item}>
      x
    </Morph>
  );
  return renderToStaticMarkup(node); // markup read as data
}

afterEach(() => {
  vi.unstubAllGlobals();
});

/** A stand-in IntersectionObserver that keeps its callback, so a test can say what is in view. */
function stubObserver() {
  const seen: { report?: (isIntersecting: boolean) => void; disconnected: boolean } = {
    disconnected: false,
  };
  class FakeObserver {
    constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
      seen.report = (isIntersecting) => callback([{ isIntersecting }]);
    }
    observe(): void {}
    disconnect(): void {
      seen.disconnected = true;
    }
  }
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  return seen;
}

describe("Morph", () => {
  it("renders its child inside an element named for the transition", () => {
    render(
      <Morph name="shop" item="abc">
        x
      </Morph>,
    );
    expect(screen.getByText("x").getAttribute("data-morph")).toBe("hc-morph-shop-abc");
  });

  it("names the element in a stylesheet that carries no colour", () => {
    const out = stylesheet("shop", "abc");
    expect(out).toContain(
      '[data-morph="hc-morph-shop-abc"][data-morph-near]{view-transition-name:hc-morph-shop-abc}',
    );
    expect(out).not.toMatch(/#[0-9a-f]{3}|rgb|hsl/i);
  });

  it("gives different pairs different names", () => {
    expect(nameOf("x", "a-b")).not.toBe(nameOf("x-a", "b"));
    expect(nameOf("x", "_")).not.toBe(nameOf("x", "_5f_"));
    expect(nameOf("x", 1)).toBe(nameOf("x", "1"));
  });

  it("makes any item a safe CSS identifier", () => {
    const name = nameOf("shop", '1 "a"}b');
    expect(name).toMatch(/^hc-morph-[A-Za-z0-9_-]+$/);
    expect(stylesheet("shop", '1 "a"}b')).toContain(
      `[data-morph="${name}"][data-morph-near]{view-transition-name:${name}}`,
    );
  });

  it("is named only while it is near the viewport", () => {
    const seen = stubObserver();
    const { unmount } = render(
      <Morph name="shop" item="abc">
        x
      </Morph>,
    );
    const el = screen.getByText("x");
    expect(el.hasAttribute("data-morph-near")).toBe(true);
    act(() => seen.report?.(false));
    expect(el.hasAttribute("data-morph-near")).toBe(false);
    expect(el.getAttribute("data-morph")).toBe("hc-morph-shop-abc");
    act(() => seen.report?.(true));
    expect(el.hasAttribute("data-morph-near")).toBe(true);
    unmount();
    expect(seen.disconnected).toBe(true);
  });

  it("stays named where there is no IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(
      <Morph name="shop" item="abc">
        x
      </Morph>,
    );
    expect(screen.getByText("x").hasAttribute("data-morph-near")).toBe(true);
  });

  it("forwards props to the element", () => {
    render(
      <Morph name="m" item="x" id="card">
        x
      </Morph>,
    );
    expect(screen.getByText("x").id).toBe("card");
  });
});
