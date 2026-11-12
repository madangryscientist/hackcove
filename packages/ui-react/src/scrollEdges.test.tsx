// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DetailLayout } from "./PageLayouts.js";
import { SidebarLayout } from "./SidebarLayout.js";
import { STICKY_FADE_LG, STICKY_FADE_MD } from "./stickyColumn.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(() => {
  unmount();
  document.body.replaceChildren();
  Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  vi.unstubAllGlobals();
});

const scrollerOf = (root: HTMLElement): HTMLElement => {
  const scroller = root.querySelector("aside")?.firstElementChild;
  if (!(scroller instanceof HTMLElement)) throw new Error("no scroller");
  return scroller;
};

const FADE_ATTRIBUTES = ["data-more", "data-more-start", "data-more-end"];
const fades = (el: HTMLElement) => FADE_ATTRIBUTES.filter((name) => el.hasAttribute(name));

/** jsdom has no layout: say how tall the content is and how much shows. */
function sized(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
}

/** Scroll `el` to `top` and tell it, as a browser does. */
function scrollTo(el: HTMLElement, top: number) {
  Object.defineProperty(el, "scrollTop", { configurable: true, value: top });
  act(() => void el.dispatchEvent(new Event("scroll")));
}

const detail = (aside: string) => (
  <DetailLayout title="Quote" aside={aside} stickyAside>
    MAIN
  </DetailLayout>
);
const sidebar = (rail: string) => <SidebarLayout rail={rail}>CANVAS</SidebarLayout>;

describe("a sticky column's scroll-edge fade", () => {
  it("is a mask from its breakpoint up only, and off while the scroller is focus-visible", () => {
    for (const [fade, from] of [
      [STICKY_FADE_LG, "lg"],
      [STICKY_FADE_MD, "md"],
    ] as const) {
      for (const cls of fade.split(" ")) expect(cls.startsWith(`${from}:`)).toBe(true);
      expect(fade).toContain(`${from}:data-more:[mask-image:linear-gradient(to_bottom,`);
      expect(fade).toContain(`${from}:data-more:focus-visible:[mask-image:none]`);
    }
    expect(renderToStaticMarkup(detail("A"))).toContain(STICKY_FADE_LG);
    expect(renderToStaticMarkup(sidebar("R"))).toContain(STICKY_FADE_MD);
  });

  for (const [name, node] of [
    ["DetailLayout", detail("Aside")],
    ["SidebarLayout", sidebar("Rail")],
  ] as const) {
    describe(`${name} scroller`, () => {
      it("marks the end while there is more below, then the start once scrolled, then only the start at the end", () => {
        sized(900, 400);
        const scroller = scrollerOf(mount(node));
        expect(fades(scroller)).toEqual(["data-more", "data-more-end"]);
        scrollTo(scroller, 200);
        expect(fades(scroller)).toEqual(["data-more", "data-more-start", "data-more-end"]);
        scrollTo(scroller, 500);
        expect(fades(scroller)).toEqual(["data-more", "data-more-start"]);
      });

      it("marks nothing when the column fits", () => {
        sized(400, 400);
        expect(fades(scrollerOf(mount(node)))).toEqual([]);
      });

      it("renders and hydrates with no ResizeObserver, with no fade", async () => {
        expect(typeof ResizeObserver).toBe("undefined");
        const container = document.createElement("div");
        container.innerHTML = renderToStaticMarkup(node);
        document.body.append(container);
        await act(async () => {
          hydrateRoot(container, node);
        });
        expect(fades(scrollerOf(container))).toEqual([]);
      });
    });
  }

  it("DetailLayout without stickyAside has no scroller to mark", () => {
    sized(900, 400);
    const root = mount(
      <DetailLayout title="Quote" aside="Aside">
        MAIN
      </DetailLayout>,
    );
    expect(fades(scrollerOf(root))).toEqual([]);
  });
});
