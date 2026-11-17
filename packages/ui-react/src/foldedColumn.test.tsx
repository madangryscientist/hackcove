// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoldedColumn } from "./foldedColumn.js";
import { act, render, screen } from "./render.harness.js";

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

/** The column's `<details>`, a group: whether it is open, as the reader on a phone meets it. */
const isOpen = () => screen.getByRole<HTMLDetailsElement>("group").open;

describe("FoldedColumn", () => {
  it("opens the <details> for real from md and closes it again below", () => {
    const viewport = stubViewport(1280);
    render(column("md"));
    expect(isOpen()).toBe(true);
    viewport.resize(400);
    expect(isOpen()).toBe(false);
    viewport.resize(800);
    expect(isOpen()).toBe(true);
  });

  it("stays closed on a phone", () => {
    stubViewport(400);
    render(column("md"));
    expect(isOpen()).toBe(false);
  });

  it("folds to lg when asked: open at 1024, closed at 800", () => {
    const viewport = stubViewport(800);
    render(column("lg"));
    expect(isOpen()).toBe(false);
    viewport.resize(1024);
    expect(isOpen()).toBe(true);
  });

  it("stops listening when it unmounts", () => {
    const viewport = stubViewport(1280);
    const { unmount } = render(column("md"));
    const details = screen.getByRole<HTMLDetailsElement>("group");
    unmount();
    viewport.resize(400);
    expect(details.open).toBe(true);
  });

  it("renders closed without matchMedia, as on the server and in a consumer's jsdom test", () => {
    render(column("md"));
    expect(isOpen()).toBe(false);
    expect(screen.getByText("All sections")).toBeTruthy();
  });
});
