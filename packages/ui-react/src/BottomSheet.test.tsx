// @vitest-environment jsdom
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BottomSheet, type BottomSheetProps } from "./BottomSheet.js";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

let root: Root | undefined;
let container: HTMLElement | undefined;

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

function render(node: ReactElement): HTMLElement {
  if (!container || !root) {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  }
  const r = root;
  act(() => r.render(node));
  return container;
}

const sheet = (props: Partial<BottomSheetProps> = {}) => (
  <BottomSheet
    label="Shops"
    snaps={[0.25, 0.5, 0.9]}
    snap={0}
    onSnapChange={() => undefined}
    header={<h2>Shops nearby</h2>}
    {...props}
  >
    <p>Body</p>
  </BottomSheet>
);

const regionOf = (out: HTMLElement) => {
  const region = out.querySelector("section");
  if (!region) throw new Error("no region");
  return region;
};

const handleOf = (out: HTMLElement) => {
  const buttons = out.querySelectorAll("button");
  expect(buttons).toHaveLength(1);
  const [button] = buttons;
  if (!button) throw new Error("no handle");
  return button;
};

const press = (el: Element, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

describe("BottomSheet", () => {
  it("is a region named by its label, with one handle button named by it alone", () => {
    const out = render(sheet());
    expect(regionOf(out).getAttribute("aria-label")).toBe("Shops");
    const handle = handleOf(out);
    expect(handle.getAttribute("aria-label")).toBe("Shops");
    expect(handle.textContent).toBe("");
  });

  it("marks the handle expanded past the first snap, and points it at the body", () => {
    const out = render(sheet());
    const handle = handleOf(out);
    expect(handle.getAttribute("aria-expanded")).toBe("false");
    const body = document.getElementById(handle.getAttribute("aria-controls") ?? "");
    expect(body?.textContent).toBe("Body");
    render(sheet({ snap: 1 }));
    expect(handleOf(out).getAttribute("aria-expanded")).toBe("true");
  });

  it("steps to the next snap on a click, and wraps from the last to the first", () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    const out = render(sheet({ onSnapChange }));
    act(() => handleOf(out).click());
    expect(onSnapChange).toHaveBeenLastCalledWith(1);
    render(sheet({ onSnapChange, snap: 2 }));
    act(() => handleOf(out).click());
    expect(onSnapChange).toHaveBeenLastCalledWith(0);
  });

  it("returns to the first snap on Escape, and does nothing on it at the first", () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    const out = render(sheet({ onSnapChange, snap: 2 }));
    press(handleOf(out), "Escape");
    expect(onSnapChange).toHaveBeenCalledExactlyOnceWith(0);
    onSnapChange.mockClear();
    render(sheet({ onSnapChange, snap: 0 }));
    press(handleOf(out), "Escape");
    expect(onSnapChange).not.toHaveBeenCalled();
  });

  it("leaves an Escape inside a nested dialog to the dialog", () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    const out = render(
      <BottomSheet label="Shops" snaps={[0.25, 0.5]} snap={1} onSnapChange={onSnapChange}>
        <dialog open>
          <button type="button">In the dialog</button>
        </dialog>
      </BottomSheet>,
    );
    const inner = out.querySelector("dialog button");
    if (!inner) throw new Error("no dialog button");
    press(inner, "Escape");
    expect(onSnapChange).not.toHaveBeenCalled();
  });

  it("keeps a header heading outside the handle, so it stays a heading", () => {
    const out = render(sheet());
    const heading = out.querySelector("h2");
    expect(heading?.textContent).toBe("Shops nearby");
    expect(handleOf(out).contains(heading)).toBe(false);
  });

  it("reports the height it rests at, on mount and on a change of snap", () => {
    const onHeightChange = vi.fn<(px: number) => void>();
    render(sheet({ snaps: ["120px", "320px"], onHeightChange }));
    expect(onHeightChange).toHaveBeenLastCalledWith(120);
    render(sheet({ snaps: ["120px", "320px"], onHeightChange, snap: 1 }));
    expect(onHeightChange).toHaveBeenLastCalledWith(320);
    expect(onHeightChange).toHaveBeenCalledTimes(2);
  });

  it("is not modal: nothing is inert, nothing is aria-modal, and it is not a dialog", () => {
    const out = render(sheet({ snap: 2 }));
    expect(out.querySelector("[inert], [aria-modal], [role='dialog'], dialog")).toBeNull();
  });
});
