// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatThread, isAtBottom } from "./ChatThread.js";
import { act, fireEvent, render, screen } from "./render.harness.js";

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
  vi.unstubAllGlobals();
});

/** jsdom has no layout: say how tall the box's content is and how much of it shows. */
function size(box: HTMLElement, scrollHeight: number, clientHeight = 100): void {
  Object.defineProperty(box, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(box, "clientHeight", { configurable: true, value: clientHeight });
}

/** jsdom has no layout, so the reader's scroll is set and its event fired by hand. */
function scrollTo(box: HTMLElement, top: number): void {
  fireEvent.scroll(box, { target: { scrollTop: top } });
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
  it("is a named region a keyboard can tab to", () => {
    render(<ChatThread label="Cooking chat">x</ChatThread>);
    expect(screen.getByRole("region", { name: "Cooking chat" }).getAttribute("tabindex")).toBe("0");
  });

  it("draws empty only with no children", () => {
    const { rerender } = render(<ChatThread label="Chat" empty="Nothing yet" />);
    const box = screen.getByRole("region", { name: "Chat" });
    expect(box.textContent).toBe("Nothing yet");
    rerender(
      <ChatThread label="Chat" empty="Nothing yet">
        {null}
        {false}
      </ChatThread>,
    );
    expect(box.textContent).toBe("Nothing yet");
    rerender(
      <ChatThread label="Chat" empty="Nothing yet">
        A message
      </ChatThread>,
    );
    expect(box.textContent).toBe("A message");
  });

  it("puts announce in a polite live element, and the scroll box itself is not live", () => {
    render(
      <ChatThread label="Chat" announce="Reply finished">
        x
      </ChatThread>,
    );
    const live = screen.getByText("Reply finished");
    expect(live.getAttribute("aria-live")).toBe("polite");
    const box = screen.getByRole("region", { name: "Chat" });
    expect(box.contains(live)).toBe(false);
    expect(box.hasAttribute("aria-live")).toBe(false);
    expect(screen.queryByRole("log")).toBeNull();
  });

  it("keeps the same live element in the page while there is nothing to announce", () => {
    const { rerender } = render(
      <ChatThread label="Chat" announce="First">
        x
      </ChatThread>,
    );
    const live = screen.getByText("First");
    rerender(<ChatThread label="Chat">x</ChatThread>);
    expect(live.isConnected).toBe(true);
    expect(live.textContent).toBe("");
    rerender(
      <ChatThread label="Chat" announce="Second">
        x
      </ChatThread>,
    );
    expect(screen.getByText("Second")).toBe(live);
  });

  it("follows growing content, stops when the reader scrolls up, and re-arms at the bottom", () => {
    render(<ChatThread label="Chat">x</ChatThread>);
    const box = screen.getByRole("region", { name: "Chat" });
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
    // jsdom has no layout: every element says its content is 500px tall while the thread mounts.
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 500,
    });
    render(<ChatThread label="Chat">x</ChatThread>);
    Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
    expect(screen.getByRole("region", { name: "Chat" }).scrollTop).toBe(500);
  });

  it("stops observing when it unmounts", () => {
    const { unmount } = render(<ChatThread label="Chat">x</ChatThread>);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it("does not throw where there is no ResizeObserver", () => {
    vi.unstubAllGlobals();
    expect(() => render(<ChatThread label="Chat">x</ChatThread>)).not.toThrow();
  });
});
