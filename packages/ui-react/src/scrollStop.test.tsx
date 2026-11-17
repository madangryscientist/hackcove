// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { DetailLayout } from "./PageLayouts.js";
import { render, screen, user, within } from "./render.harness.js";
import { SideColumn } from "./SideColumn.js";
import { SidebarLayout } from "./SidebarLayout.js";

afterEach(() => {
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

/** Wide, the folded column's <summary> is `display: none`: jsdom has no layout, so say so. */
function summaryHidden() {
  HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
    return this.tagName !== "SUMMARY";
  };
}

/** Every element a person reaches by pressing Tab from the top of the page, in order. */
async function tabStops(): Promise<HTMLElement[]> {
  const person = user();
  const stops: HTMLElement[] = [];
  await person.tab();
  for (let n = 0; n < 20 && document.activeElement !== document.body; n += 1) {
    if (document.activeElement instanceof HTMLElement) stops.push(document.activeElement);
    await person.tab();
  }
  return stops;
}

/** The tab stops that hold `text`: the aside's scroller, when it takes a stop. */
const stopsHolding = (stops: HTMLElement[], text: string) =>
  stops.filter((stop) => within(stop).queryByText(text) !== null);

describe("a sticky column's scroll stop", () => {
  it("SideColumn sticky whose aside overflows takes a tab stop, named by asideLabel", () => {
    overflowing(900, 400);
    summaryHidden();
    render(
      <SideColumn aside="Just text" asideLabel="Reply agent" sticky>
        MAIN
      </SideColumn>,
    );
    expect(screen.getByRole("group", { name: "Reply agent" }).tabIndex).toBe(0);
  });

  it("SideColumn without sticky gets no scroll stop, however tall", async () => {
    overflowing(900, 400);
    render(
      <SideColumn aside="Just text" asideLabel="Reply agent">
        MAIN
      </SideColumn>,
    );
    expect(screen.queryByRole("group", { name: "Reply agent" })).toBeNull();
    expect(stopsHolding(await tabStops(), "Just text")).toEqual([]);
  });

  it("DetailLayout stickyAside of plain text that overflows takes a tab stop, named by asideLabel", async () => {
    overflowing(900, 400);
    render(
      <DetailLayout title="Quote" aside="Just text" asideLabel="Quote facts" sticky>
        MAIN
      </DetailLayout>,
    );
    const group = screen.getByRole("group", { name: "Quote facts" });
    expect(group.tabIndex).toBe(0);
    expect(stopsHolding(await tabStops(), "Just text")).toEqual([group]);
  });

  it("without a label the stop has no group role or name", async () => {
    overflowing(900, 400);
    render(
      <DetailLayout title="Quote" aside="Just text" sticky>
        MAIN
      </DetailLayout>,
    );
    const [stop, ...rest] = stopsHolding(await tabStops(), "Just text");
    expect(rest).toEqual([]);
    expect(stop?.hasAttribute("role")).toBe(false);
    expect(stop?.hasAttribute("aria-label")).toBe(false);
  });

  it("takes none when the aside fits", async () => {
    overflowing(400, 400);
    render(
      <DetailLayout title="Quote" aside="Just text" sticky>
        MAIN
      </DetailLayout>,
    );
    expect(stopsHolding(await tabStops(), "Just text")).toEqual([]);
  });

  it("takes none when the aside holds a link, though it overflows", async () => {
    overflowing(900, 400);
    render(
      <DetailLayout title="Quote" aside={<a href="#x">A link</a>} sticky>
        MAIN
      </DetailLayout>,
    );
    expect(await tabStops()).toEqual([screen.getByRole("link", { name: "A link" })]);
  });

  it("DetailLayout without stickyAside gets no scroll stop, however tall", async () => {
    overflowing(900, 400);
    render(
      <DetailLayout title="Quote" aside="Just text" asideLabel="Quote facts">
        MAIN
      </DetailLayout>,
    );
    expect(screen.queryByRole("group", { name: "Quote facts" })).toBeNull();
    expect(await tabStops()).toEqual([]);
  });

  it("SidebarLayout: a rail of links gets no stop", () => {
    overflowing(900, 400);
    summaryHidden();
    render(
      <SidebarLayout aside={<a href="#a">A</a>} asideLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    expect(screen.queryByRole("group", { name: "All sections" })).toBeNull();
  });

  it("SidebarLayout: a rail of text takes a stop, named by railLabel", () => {
    overflowing(900, 400);
    summaryHidden();
    render(
      <SidebarLayout aside="No links here" asideLabel="All sections">
        CANVAS
      </SidebarLayout>,
    );
    expect(screen.getByRole("group", { name: "All sections" }).tabIndex).toBe(0);
  });
});
