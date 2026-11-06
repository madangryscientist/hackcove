// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { InlineEdit } from "./InlineEdit.js";
import { TableCell } from "./Table.js";

afterEach(unmount);

/** A `TableCell` that holds an InlineEdit beside other content, which is the point of the part. */
const cellWith = (onSave = vi.fn<(value: string) => void>()) =>
  mount(
    <>
      <button type="button">Elsewhere</button>
      <table>
        <tbody>
          <tr>
            <TableCell align="end" tone="strong" secondary="Card ending 4417">
              <InlineEdit
                label="Edit category"
                renderEditor={(close) => (
                  <input
                    aria-label="Category"
                    defaultValue="Groceries"
                    onChange={(event) => {
                      onSave(event.target.value);
                      close();
                    }}
                  />
                )}
              >
                Groceries
              </InlineEdit>
              <span data-testid="sibling">Pending</span>
            </TableCell>
          </tr>
        </tbody>
      </table>
    </>,
  );

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

describe("InlineEdit", () => {
  it("is not a cell: it draws a button, in the cell it is put in, and takes that cell's alignment", () => {
    const out = renderToStaticMarkup(
      <table>
        <tbody>
          <tr>
            <TableCell align="end">
              <InlineEdit label="Edit category" renderEditor={() => null}>
                Groceries
              </InlineEdit>
            </TableCell>
          </tr>
        </tbody>
      </table>,
    );
    expect(out.match(/<td/g)).toHaveLength(1);
    expect(out).toContain("[text-align:inherit]");
    expect(out).toContain('Groceries<span class="sr-only"> Edit category</span></button>');
  });

  it("keeps the cell's other content beside it, open or closed", () => {
    const container = cellWith();
    expect(container.querySelector('[data-testid="sibling"]')?.textContent).toBe("Pending");
    expect(container.querySelector("td")?.textContent).toContain("Card ending 4417");
    act(() => trigger(container).click());
    expect(editorOf(container)).not.toBeNull();
    expect(container.querySelector('[data-testid="sibling"]')?.textContent).toBe("Pending");
    expect(container.querySelector("td")?.textContent).toContain("Card ending 4417");
  });

  it("opens on click, names the editor group and focuses its control", () => {
    const container = cellWith();
    act(() => trigger(container).click());
    expect(editorOf(container)?.getAttribute("aria-label")).toBe("Edit category");
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Category");
  });

  it("Esc closes it and returns the focus to the value", () => {
    const container = cellWith();
    act(() => trigger(container).click());
    const active = document.activeElement;
    if (!active) throw new Error("nothing focused");
    press(active, "Escape");
    expect(editorOf(container)).toBeNull();
    expect(document.activeElement).toBe(trigger(container));
  });

  it("Esc does not reach a handler above it, so it does not close a dialog around the table", () => {
    const above = vi.fn<() => void>();
    const container = mount(
      // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- a test double for a Dialog above the cell
      <div onKeyDown={above}>
        <table>
          <tbody>
            <tr>
              <td>
                <InlineEdit label="Edit" renderEditor={() => <input aria-label="Field" />}>
                  x
                </InlineEdit>
              </td>
            </tr>
          </tbody>
        </table>
      </div>,
    );
    act(() => container.querySelector("button")?.click());
    const active = document.activeElement;
    if (!active) throw new Error("nothing focused");
    press(active, "Escape");
    expect(above).not.toHaveBeenCalled();
  });

  it("the editor's close, on a save, returns the focus to the value", () => {
    const onSave = vi.fn<(value: string) => void>();
    const container = cellWith(onSave);
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

  it("a press outside closes it and leaves the focus alone; a press inside keeps it", () => {
    const container = cellWith();
    act(() => trigger(container).click());
    const input = container.querySelector("input");
    const outside = container.querySelector<HTMLButtonElement>(":scope > button");
    if (!input || !outside) throw new Error("missing node");
    act(() => {
      input.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(editorOf(container)).not.toBeNull();
    act(() => {
      outside.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    });
    expect(editorOf(container)).toBeNull();
    expect(document.activeElement).not.toBe(trigger(container));
  });

  it("focus moving out of the editor closes it (Tab out); focus to nowhere does not", () => {
    const container = cellWith();
    act(() => trigger(container).click());
    const input = container.querySelector("input");
    const outside = container.querySelector<HTMLButtonElement>(":scope > button");
    if (!input || !outside) throw new Error("missing node");
    act(() => input.blur());
    expect(editorOf(container)).not.toBeNull();
    act(() => {
      input.focus();
      outside.focus();
    });
    expect(editorOf(container)).toBeNull();
  });
});
