// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { TableEditCell } from "./TableEditCell.js";

afterEach(unmount);

const open = (onSave = vi.fn<(value: string) => void>(), autoFocus = false) => {
  const container = mount(
    <>
      <button type="button">Elsewhere</button>
      <table>
        <tbody>
          <tr>
            <TableEditCell
              label="Edit category"
              tone="strong"
              renderEditor={(close) => (
                <>
                  <button type="button">Help</button>
                  <input
                    aria-label="Category"
                    autoFocus={autoFocus}
                    defaultValue="Groceries"
                    onChange={(event) => {
                      onSave(event.target.value);
                      close();
                    }}
                  />
                </>
              )}
            >
              Groceries
            </TableEditCell>
          </tr>
        </tbody>
      </table>
    </>,
  );
  return container;
};

const trigger = (container: HTMLElement) => {
  const button = container.querySelector<HTMLButtonElement>("td button");
  if (!button) throw new Error("no trigger");
  return button;
};

const editorOf = (container: HTMLElement) => container.querySelector('td [role="group"]');

const press = (el: Element, key: string) =>
  act(() => {
    el.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
  });

describe("TableEditCell", () => {
  it("is a TableCell that shows its value as a button, named by the value then the label", () => {
    const out = renderToStaticMarkup(
      <table>
        <tbody>
          <tr>
            <TableEditCell
              label="Edit category"
              tone="strong"
              align="end"
              renderEditor={() => null}
            >
              Groceries
            </TableEditCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(out).toMatch(/<td class="[^"]*text-right[^"]*font-medium text-slate-900/);
    expect(out).toContain('<button type="button"');
    expect(out).toContain('Groceries<span class="sr-only"> Edit category</span></button>');
    expect(out).toContain("focus-visible:outline-violet-600");
  });

  it("opens on click, with the focus on the editor's first control", () => {
    const container = open();
    expect(editorOf(container)).toBeNull();
    act(() => trigger(container).click());
    expect(editorOf(container)?.getAttribute("aria-label")).toBe("Edit category");
    expect(container.querySelector("td button")?.textContent).toBe("Help");
    expect(document.activeElement?.textContent).toBe("Help");
  });

  it("leaves the focus on the control the editor focused itself", () => {
    const container = open(vi.fn(), true);
    act(() => trigger(container).click());
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Category");
  });

  it("Esc closes it and returns the focus to the value", () => {
    const container = open();
    act(() => trigger(container).click());
    const active = document.activeElement;
    if (!active) throw new Error("nothing focused");
    press(active, "Escape");
    expect(editorOf(container)).toBeNull();
    expect(document.activeElement).toBe(trigger(container));
  });

  it("another key does not close it", () => {
    const container = open();
    act(() => trigger(container).click());
    const active = document.activeElement;
    if (!active) throw new Error("nothing focused");
    press(active, "a");
    expect(editorOf(container)).not.toBeNull();
  });

  it("the editor's close returns the focus to the value", () => {
    const onSave = vi.fn<(value: string) => void>();
    const container = open(onSave);
    act(() => trigger(container).click());
    const input = container.querySelector("input");
    if (!input) throw new Error("no input");
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "Fun");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(onSave).toHaveBeenCalledWith("Fun");
    expect(editorOf(container)).toBeNull();
    expect(document.activeElement).toBe(trigger(container));
  });

  it("a press outside closes it and leaves the focus alone", () => {
    const container = open();
    act(() => trigger(container).click());
    const outside = container.querySelector<HTMLButtonElement>(":scope > button");
    if (!outside) throw new Error("no outside button");
    act(() => {
      outside.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(editorOf(container)).toBeNull();
    expect(document.activeElement).not.toBe(trigger(container));
  });

  it("a press inside the editor keeps it open", () => {
    const container = open();
    act(() => trigger(container).click());
    const input = container.querySelector("input");
    if (!input) throw new Error("no input");
    act(() => {
      input.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(editorOf(container)).not.toBeNull();
  });

  it("focus moving out closes it; focus moving inside, or to nowhere, does not", () => {
    const container = open();
    act(() => trigger(container).click());
    const input = container.querySelector("input");
    if (!input) throw new Error("no input");
    act(() => input.focus());
    expect(editorOf(container)).not.toBeNull();
    // Safari does not focus a pressed button: the blur has no target, and the press must still land.
    act(() => input.blur());
    expect(editorOf(container)).not.toBeNull();
    const outside = container.querySelector<HTMLButtonElement>(":scope > button");
    act(() => {
      input.focus();
      outside?.focus();
    });
    expect(editorOf(container)).toBeNull();
  });
});
