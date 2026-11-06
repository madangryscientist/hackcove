// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { FoldedColumn } from "./foldedColumn.js";

afterEach(unmount);

/** A `matchMedia` jsdom lacks: `width` is the viewport, and `resize` tells every query it changed. */
function stubViewport(initial: number) {
  let width = initial;
  const listeners = new Set<{ query: string; notify: () => void }>();
  const rem = 16;
  const matches = (query: string): boolean => {
    const min = /width >= (\d+)rem/.exec(query)?.[1];
    return min !== undefined && width >= Number(min) * rem;
  };
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return matches(query);
    },
    addEventListener: (_: string, notify: () => void) => listeners.add({ query, notify }),
    removeEventListener: (_: string, notify: () => void) => {
      for (const entry of listeners) if (entry.notify === notify) listeners.delete(entry);
    },
  }));
  return {
    resize(next: number) {
      width = next;
      act(() => {
        for (const entry of listeners) entry.notify();
      });
    },
  };
}

beforeEach(() => vi.unstubAllGlobals());
afterEach(() => vi.unstubAllGlobals());

const column = (from: "md" | "lg") => (
  <FoldedColumn from={from} label="All sections">
    <a href="#a">A</a>
  </FoldedColumn>
);
const detailsOf = (root: HTMLElement) => {
  const details = root.querySelector("details");
  if (!details) throw new Error("no <details>");
  return details;
};

describe("FoldedColumn", () => {
  it("is closed in its server markup, with no open prop for React to fight", () => {
    for (const from of ["md", "lg"] as const) {
      expect(renderToStaticMarkup(column(from))).not.toMatch(/<details[^>]* open/);
    }
  });

  it("opens the <details> for real from md and closes it again below", () => {
    const viewport = stubViewport(1280);
    const root = mount(column("md"));
    expect(detailsOf(root).open).toBe(true);
    viewport.resize(400);
    expect(detailsOf(root).open).toBe(false);
    viewport.resize(800);
    expect(detailsOf(root).open).toBe(true);
  });

  it("stays closed on a phone", () => {
    stubViewport(400);
    expect(detailsOf(mount(column("md"))).open).toBe(false);
  });

  it("folds to lg when asked: open at 1024, closed at 800", () => {
    const viewport = stubViewport(800);
    const root = mount(column("lg"));
    expect(detailsOf(root).open).toBe(false);
    viewport.resize(1024);
    expect(detailsOf(root).open).toBe(true);
  });

  it("stops listening when it unmounts", () => {
    const viewport = stubViewport(1280);
    const root = mount(column("md"));
    const details = detailsOf(root);
    unmount();
    viewport.resize(400);
    expect(details.open).toBe(true);
  });

  it("renders without matchMedia, as in a consumer's jsdom test", () => {
    expect(detailsOf(mount(column("md"))).open).toBe(false);
  });
});
