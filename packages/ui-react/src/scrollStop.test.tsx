// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { DetailLayout } from "./PageLayouts.js";
import { SidebarLayout } from "./SidebarLayout.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(() => {
  unmount();
  Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, "checkVisibility");
});

/** jsdom has no layout and no ResizeObserver: say how tall every box's content is and how much shows. */
function overflowing(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
  // As in a browser, an observer reports once as soon as it starts observing.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private readonly notify: () => void) {}
      observe() {
        this.notify();
      }
      disconnect() {}
    },
  );
}

const scrollerOf = (root: HTMLElement) => {
  const scroller = root.querySelector("aside")?.firstElementChild;
  if (!scroller) throw new Error("no scroller");
  return scroller;
};

describe("a sticky column's scroll stop", () => {
  it("DetailLayout stickyAside of plain text that overflows takes a tab stop, named by asideLabel", () => {
    overflowing(900, 400);
    const root = mount(
      <DetailLayout title="Quote" aside="Just text" asideLabel="Quote facts" stickyAside>
        MAIN
      </DetailLayout>,
    );
    const scroller = scrollerOf(root);
    expect(scroller.getAttribute("tabindex")).toBe("0");
    expect(scroller.getAttribute("role")).toBe("group");
    expect(scroller.getAttribute("aria-label")).toBe("Quote facts");
    expect(scroller.className).toContain("focus-visible:outline-violet-600");
  });

  it("without a label the stop has no group role or name", () => {
    overflowing(900, 400);
    const root = mount(
      <DetailLayout title="Quote" aside="Just text" stickyAside>
        MAIN
      </DetailLayout>,
    );
    const scroller = scrollerOf(root);
    expect(scroller.getAttribute("tabindex")).toBe("0");
    expect(scroller.hasAttribute("role")).toBe(false);
    expect(scroller.hasAttribute("aria-label")).toBe(false);
  });

  it("takes none when the aside fits", () => {
    overflowing(400, 400);
    const root = mount(
      <DetailLayout title="Quote" aside="Just text" stickyAside>
        MAIN
      </DetailLayout>,
    );
    expect(scrollerOf(root).hasAttribute("tabindex")).toBe(false);
  });

  it("takes none when the aside holds a link, though it overflows", () => {
    overflowing(900, 400);
    const root = mount(
      <DetailLayout title="Quote" aside={<a href="#x">A link</a>} stickyAside>
        MAIN
      </DetailLayout>,
    );
    expect(scrollerOf(root).hasAttribute("tabindex")).toBe(false);
  });

  it("DetailLayout without stickyAside gets no scroll stop, however tall", () => {
    overflowing(900, 400);
    const root = mount(
      <DetailLayout title="Quote" aside="Just text" asideLabel="Quote facts">
        MAIN
      </DetailLayout>,
    );
    expect(root.querySelector("[tabindex]")).toBeNull();
  });

  it("SidebarLayout: a rail of links gets no stop; a rail of text does, named by railLabel", () => {
    overflowing(900, 400);
    // Wide, the folded column's <summary> is `display: none`: jsdom has no layout, so say so.
    HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
      return this.tagName !== "SUMMARY";
    };
    const links = mount(
      <SidebarLayout rail={<a href="#a">A</a>} railLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    expect(links.querySelector("[tabindex]")).toBeNull();
    unmount();
    const text = mount(
      <SidebarLayout rail="No links here" railLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    const scroller = scrollerOf(text);
    expect(scroller.getAttribute("tabindex")).toBe("0");
    expect(scroller.getAttribute("role")).toBe("group");
    expect(scroller.getAttribute("aria-label")).toBe("All sections");
  });
});
