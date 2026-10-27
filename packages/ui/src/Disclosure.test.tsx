// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Disclosure } from "./Disclosure.js";
import { mount, unmount } from "./dom.harness.js";

afterEach(unmount);

const open = (defaultOpen?: true) =>
  mount(
    <Disclosure summary="Override trail" {...(defaultOpen ? { defaultOpen } : {})}>
      <p>Three overrides.</p>
    </Disclosure>,
  );

const trigger = (container: HTMLElement) => {
  const button = container.querySelector("button");
  if (!button) throw new Error("no trigger button");
  return button;
};

const body = (container: HTMLElement) => container.querySelector('[role="group"]');

describe("Disclosure", () => {
  it("starts closed: the summary is a button with aria-expanded=false and the body is hidden", () => {
    const container = open();
    expect(trigger(container).textContent).toBe("Override trail");
    expect(trigger(container).getAttribute("aria-expanded")).toBe("false");
    expect(body(container)?.hasAttribute("hidden")).toBe(true);
  });

  it("starts open with defaultOpen", () => {
    const container = open(true);
    expect(trigger(container).getAttribute("aria-expanded")).toBe("true");
    expect(body(container)?.hasAttribute("hidden")).toBe(false);
    expect(body(container)?.textContent).toBe("Three overrides.");
  });

  it("opens and closes on a click, flipping aria-expanded and the body", () => {
    const container = open();
    act(() => trigger(container).click());
    expect(trigger(container).getAttribute("aria-expanded")).toBe("true");
    expect(body(container)?.hasAttribute("hidden")).toBe(false);
    act(() => trigger(container).click());
    expect(trigger(container).getAttribute("aria-expanded")).toBe("false");
    expect(body(container)?.hasAttribute("hidden")).toBe(true);
  });

  it("names the body by the summary and points the button at it", () => {
    const container = open(true);
    const panel = body(container);
    expect(trigger(container).getAttribute("aria-controls")).toBe(panel?.id);
    expect(panel?.getAttribute("aria-labelledby")).toBe(trigger(container).id);
  });

  it("toggles from the keyboard: the summary is a focusable button that Enter and Space press", () => {
    const container = open();
    const button = trigger(container);
    act(() => button.focus());
    expect(document.activeElement).toBe(button);
    expect(button.tabIndex).toBe(0);
    for (const key of ["Enter", " "]) {
      const before = button.getAttribute("aria-expanded");
      act(() => {
        button.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
        );
        button.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true, cancelable: true }));
      });
      expect(button.getAttribute("aria-expanded")).not.toBe(before);
    }
  });

  it("passes data-* and aria-* through to its root", () => {
    const container = mount(
      <Disclosure summary="S" data-testid="trail" aria-describedby="why">
        x
      </Disclosure>,
    );
    const root = container.querySelector('[data-testid="trail"]');
    expect(root?.getAttribute("aria-describedby")).toBe("why");
    expect(root?.contains(container.querySelector("button"))).toBe(true);
  });
});
