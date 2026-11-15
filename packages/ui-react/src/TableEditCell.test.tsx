// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { act, render, screen, user, within } from "./render.harness.js";
import { TableEditCell } from "./TableEditCell.js";

const open = (onSave = vi.fn<(value: string) => void>(), autoFocus = false) =>
  render(
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

// jsdom's name computation drops the space a browser keeps between the value and the sr-only label,
// so the name is matched with the gap optional; textContent shows the space is there.
const trigger = () => screen.getByRole("button", { name: /^Groceries\s?Edit category$/ });
const editor = () => screen.queryByRole("group", { name: "Edit category" });
const start = async () => {
  await user().click(trigger());
};

describe("TableEditCell", () => {
  it("is a cell that shows its value as a button, named by the value then the label", () => {
    open();
    const cell = screen.getByRole("cell");
    expect(within(cell).getByRole("button").textContent).toBe("Groceries Edit category");
    expect(trigger().getAttribute("type")).toBe("button");
  });

  it("opens on click, with the focus on the editor's first control", async () => {
    open();
    expect(editor()).toBeNull();
    await start();
    expect(
      within(screen.getByRole("cell")).getByRole("group", { name: "Edit category" }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Help" }));
  });

  it("leaves the focus on the control the editor focused itself", async () => {
    open(vi.fn(), true);
    await start();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Category" }));
  });

  it("Esc closes it and returns the focus to the value", async () => {
    open();
    await start();
    await user().keyboard("{Escape}");
    expect(editor()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("another key does not close it", async () => {
    open();
    await start();
    await user().keyboard("a");
    expect(editor()).not.toBeNull();
  });

  it("the editor's close returns the focus to the value", async () => {
    const onSave = vi.fn<(value: string) => void>();
    open(onSave);
    await start();
    const input = screen.getByRole("textbox", { name: "Category" });
    await user().type(input, "F", { initialSelectionStart: 0, initialSelectionEnd: 9 });
    expect(onSave).toHaveBeenCalledWith("F");
    expect(editor()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("a press outside closes it and leaves the focus alone", async () => {
    open();
    await start();
    // A press on the page itself moves the focus to nowhere, so only the outside press can close it.
    await user().click(document.body);
    expect(editor()).toBeNull();
    expect(document.activeElement).not.toBe(trigger());
  });

  it("a press inside the editor keeps it open", async () => {
    open();
    await start();
    await user().click(screen.getByRole("textbox", { name: "Category" }));
    expect(editor()).not.toBeNull();
  });

  it("focus moving inside the editor keeps it open", async () => {
    open();
    await start();
    await user().tab();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Category" }));
    expect(editor()).not.toBeNull();
  });

  it("focus moving to nowhere keeps it open", async () => {
    open();
    await start();
    // Safari does not focus a pressed button: the blur has no target, and the press must still land.
    act(() => screen.getByRole("button", { name: "Help" }).blur());
    expect(editor()).not.toBeNull();
  });

  it("focus moving out closes it", async () => {
    open();
    await start();
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
    expect(editor()).toBeNull();
  });
});
