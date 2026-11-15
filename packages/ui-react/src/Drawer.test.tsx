// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { showModal, stubDialog } from "./dom.harness.js";
import { Drawer } from "./Drawer.js";
import { act, render, screen, user, within } from "./render.harness.js";

// stubDialog supplies the modal <dialog> methods jsdom lacks; it does not act through the DOM.
beforeEach(stubDialog);

describe("Drawer", () => {
  it("opens as a modal on mount", () => {
    render(<Drawer title="Item" onClose={() => {}} />);
    expect(showModal).toHaveBeenCalledExactlyOnceWith(
      screen.getByRole<HTMLDialogElement>("dialog", { name: "Item" }),
    );
  });

  it("closes the dialog when the parent unmounts it, so focus returns to the opener", () => {
    const { unmount } = render(<Drawer title="Item" onClose={() => {}} />);
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "Item" });
    expect(dialog.hasAttribute("open")).toBe(true);
    unmount();
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("is named by its title heading and shows the body, and the footer in its own region", () => {
    render(
      <Drawer title="Item 12" footer={<button type="button">Save</button>} onClose={() => {}}>
        <p>Body text</p>
      </Drawer>,
    );
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "Item 12" });
    expect(within(dialog).getByRole("heading", { name: "Item 12" })).not.toBeNull();
    expect(within(dialog).getByText("Body text")).not.toBeNull();
    expect(within(dialog).getByRole("contentinfo").textContent).toBe("Save");
  });

  it("renders no footer when none is given", () => {
    render(<Drawer title="t" onClose={() => {}} />);
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("calls onClose when the dialog closes (Esc fires the same event)", async () => {
    const onClose = vi.fn<() => void>();
    render(<Drawer title="t" onClose={onClose} />);
    // Esc closes a modal <dialog> in the browser; jsdom has none, so the test calls the close it makes.
    await act(async () => screen.getByRole<HTMLDialogElement>("dialog", { name: "t" }).close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the scrim, which is a click on the <dialog> itself", async () => {
    const onClose = vi.fn<() => void>();
    render(<Drawer title="t" onClose={onClose} />);
    await user().click(screen.getByRole<HTMLDialogElement>("dialog", { name: "t" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from the close button, named by closeLabel", async () => {
    const onClose = vi.fn<() => void>();
    render(<Drawer title="t" closeLabel="Dismiss" onClose={onClose} />);
    await user().click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on a click inside the panel", async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Drawer title="t" onClose={onClose}>
        <button type="button">inner</button>
      </Drawer>,
    );
    await user().click(screen.getByRole("button", { name: "inner" }));
    await user().click(screen.getByRole("heading", { name: "t" }));
    expect(onClose).not.toHaveBeenCalled();
  });
});
