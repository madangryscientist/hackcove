// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { InlineEdit } from "./InlineEdit.js";
import { act, render, screen, user, within } from "./render.harness.js";
import { TableCell } from "./Table.js";

/** A `TableCell` that holds an InlineEdit beside other content, which is the point of the part. */
const cellWith = (onSave = vi.fn<(value: string) => void>()) =>
  render(
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
              <span>Pending</span>
            </TableCell>
          </tr>
        </tbody>
      </table>
    </>,
  );

// jsdom's name computation drops the space a browser keeps between the value and the sr-only label,
// so the name is matched with the gap optional; textContent shows the space is there.
const trigger = () => screen.getByRole("button", { name: /^Groceries\s?Edit category$/ });
const editor = () => screen.queryByRole("group", { name: "Edit category" });
const open = async () => {
  await user().click(trigger());
};

describe("InlineEdit", () => {
  it("is not a cell: it is a button in the cell it is put in, named by the value and the label", () => {
    cellWith();
    expect(screen.getAllByRole("cell")).toHaveLength(1);
    expect(within(screen.getByRole("cell")).getByRole("button").textContent).toBe(
      "Groceries Edit category",
    );
  });

  it("keeps the cell's other content beside it, closed", () => {
    cellWith();
    const cell = screen.getByRole("cell");
    expect(within(cell).getByText("Pending")).not.toBeNull();
    expect(within(cell).getByText("Card ending 4417")).not.toBeNull();
  });

  it("keeps the cell's other content beside it, open", async () => {
    cellWith();
    await open();
    const cell = screen.getByRole("cell");
    expect(within(cell).getByRole("group", { name: "Edit category" })).not.toBeNull();
    expect(within(cell).getByText("Pending")).not.toBeNull();
    expect(within(cell).getByText("Card ending 4417")).not.toBeNull();
  });

  it("opens on click, names the editor group and focuses its control", async () => {
    cellWith();
    await open();
    expect(editor()).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Category" }));
  });

  it("Esc closes it and returns the focus to the value", async () => {
    cellWith();
    await open();
    await user().keyboard("{Escape}");
    expect(editor()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("Esc does not reach a handler above it, so it does not close a dialog around the table", async () => {
    const above = vi.fn<() => void>();
    render(
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
    await user().click(screen.getByRole("button", { name: /^x\s?Edit$/ }));
    above.mockClear();
    await user().keyboard("{Escape}");
    expect(above).not.toHaveBeenCalled();
  });

  it("the editor's close, on a save, returns the focus to the value", async () => {
    const onSave = vi.fn<(value: string) => void>();
    cellWith(onSave);
    await open();
    const input = screen.getByRole("textbox", { name: "Category" });
    await user().type(input, "F", { initialSelectionStart: 0, initialSelectionEnd: 9 });
    expect(onSave).toHaveBeenCalledWith("F");
    expect(editor()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("a press inside keeps it open", async () => {
    cellWith();
    await open();
    await user().click(screen.getByRole("textbox", { name: "Category" }));
    expect(editor()).not.toBeNull();
  });

  it("a press outside closes it and leaves the focus alone", async () => {
    cellWith();
    await open();
    await user().click(screen.getByRole("button", { name: "Elsewhere" }));
    expect(editor()).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Elsewhere" }));
  });

  it("focus to nowhere keeps it open", async () => {
    cellWith();
    await open();
    act(() => screen.getByRole("textbox", { name: "Category" }).blur());
    expect(editor()).not.toBeNull();
  });

  it("focus moving out of the editor closes it", async () => {
    cellWith();
    await open();
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
    expect(editor()).toBeNull();
  });
});
