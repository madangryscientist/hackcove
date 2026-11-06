// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatThread, isAtBottom } from "./ChatThread.js";
import { mount, unmount } from "./dom.harness.js";

/** jsdom has no ResizeObserver: this one reports only when a test says so. */
let report: () => void = () => undefined;
const disconnect = vi.fn<() => void>();

beforeEach(() => {
  disconnect.mockClear();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        report = () => {
          act(callback);
        };
      }
      observe(): void {}
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  unmount();
  vi.unstubAllGlobals();
});

const boxOf = (root: HTMLElement) => root.querySelector<HTMLElement>('[role="region"]')!;

/** jsdom has no layout: say how tall the box's content is and how much of it shows. */
function size(box: HTMLElement, scrollHeight: number, clientHeight = 100): void {
  Object.defineProperty(box, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(box, "clientHeight", { configurable: true, value: clientHeight });
}

function scrollTo(box: HTMLElement, top: number): void {
  box.scrollTop = top;
  act(() => {
    box.dispatchEvent(new Event("scroll"));
  });
}

describe("isAtBottom", () => {
  it("allows 32px and no more", () => {
    expect(isAtBottom(900, 100, 1000)).toBe(true);
    expect(isAtBottom(868, 100, 1000)).toBe(true);
    expect(isAtBottom(867, 100, 1000)).toBe(false);
    expect(isAtBottom(0, 100, 1000)).toBe(false);
    expect(isAtBottom(0, 100, 50)).toBe(true);
  });
});

describe("ChatThread", () => {
  it("is a named, focusable region with the role and the tab stop axe asks for", () => {
    const box = boxOf(mount(<ChatThread label="Cooking chat">x</ChatThread>));
    expect(box.getAttribute("aria-label")).toBe("Cooking chat");
    expect(box.tabIndex).toBe(0);
    expect(box.className).toContain("overflow-y-auto");
  });

  it.each([
    [undefined, "max-h-[28rem]"],
    ["sm", "max-h-80"],
    ["md", "max-h-[28rem]"],
    ["lg", "max-h-[40rem]"],
    ["fill", "h-full min-h-0"],
  ] as const)("height %s is %s", (height, classes) => {
    const box = boxOf(
      mount(
        <ChatThread label="Chat" height={height}>
          x
        </ChatThread>,
      ),
    );
    expect(box.className).toContain(classes);
  });

  it("draws empty only with no children", () => {
    const none = mount(<ChatThread label="Chat" empty="Nothing yet" />);
    expect(boxOf(none).textContent).toBe("Nothing yet");
    unmount();
    const hollow = mount(
      <ChatThread label="Chat" empty="Nothing yet">
        {null}
        {false}
      </ChatThread>,
    );
    expect(boxOf(hollow).textContent).toBe("Nothing yet");
    unmount();
    const some = mount(
      <ChatThread label="Chat" empty="Nothing yet">
        A message
      </ChatThread>,
    );
    expect(boxOf(some).textContent).toBe("A message");
  });

  it("puts announce in a polite live element, and the scroll box itself is not live", () => {
    const root = mount(
      <ChatThread label="Chat" announce="Reply finished">
        x
      </ChatThread>,
    );
    const live = root.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe("Reply finished");
    expect(live?.className).toBe("sr-only");
    const box = boxOf(root);
    expect(box.contains(live)).toBe(false);
    expect(box.hasAttribute("aria-live")).toBe(false);
    expect(box.querySelector("[aria-live]")).toBeNull();
    expect(root.querySelector('[role="log"]')).toBeNull();
  });

  it("keeps the live element in the page before there is anything to announce", () => {
    const live = mount(<ChatThread label="Chat">x</ChatThread>).querySelector("[aria-live]");
    expect(live?.textContent).toBe("");
  });

  it("follows growing content, stops when the reader scrolls up, and re-arms at the bottom", () => {
    const box = boxOf(mount(<ChatThread label="Chat">x</ChatThread>));
    size(box, 1000);
    report();
    expect(box.scrollTop).toBe(1000);

    scrollTo(box, 200);
    size(box, 1200);
    report();
    expect(box.scrollTop).toBe(200);

    scrollTo(box, 1100);
    size(box, 1400);
    report();
    expect(box.scrollTop).toBe(1400);
  });

  it("starts at the bottom", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    const box = boxOf(mount(<ChatThread label="Chat">x</ChatThread>));
    Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
    expect(box.scrollTop).toBe(500);
  });

  it("stops observing when it unmounts", () => {
    mount(<ChatThread label="Chat">x</ChatThread>);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("does not throw where there is no ResizeObserver", () => {
    vi.unstubAllGlobals();
    expect(() => mount(<ChatThread label="Chat">x</ChatThread>)).not.toThrow();
  });
});
