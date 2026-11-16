// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { stubDialog } from "./dom.harness.js";
import { FieldDialog } from "./FieldDialog.js";
import { act, fireEvent, render, screen, user } from "./render.harness.js";

// stubDialog supplies the modal <dialog> methods jsdom lacks; it does not act through the DOM.
beforeEach(stubDialog);

const PROPS = {
  title: "New project",
  label: "Project name",
  placeholder: "my-project",
  hint: "Letters and dashes.",
  emptyReason: "Type a name first.",
  submit: "Create",
  busyLabel: "Creating…",
};

function open(
  onSubmit: (value: string) => Promise<unknown>,
  onClose: () => void = vi.fn<() => void>(),
): void {
  render(<FieldDialog {...PROPS} onSubmit={onSubmit} onClose={onClose} />);
}

const field = (): HTMLInputElement =>
  screen.getByRole<HTMLInputElement>("textbox", { name: "Project name" });
const button = (name: string): HTMLButtonElement =>
  screen.getByRole<HTMLButtonElement>("button", { name });

/**
 * Submit the field's form with no button press, as a script's `requestSubmit` does: a browser's own
 * implicit submission does nothing while the submit button is disabled, so only a script reaches the
 * guard in the handler, which is what is under test.
 */
const submitDirectly = () =>
  act(async () => {
    const form = field().form;
    if (form === null) throw new Error("the field is in no form");
    fireEvent.submit(form);
  });

describe("FieldDialog", () => {
  it("names the field and blocks submit with the empty reason while it is empty", async () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve());
    open(onSubmit);
    expect(screen.getByRole("dialog", { name: "New project" })).not.toBeNull();
    expect(field().placeholder).toBe("my-project");
    expect(screen.getByText("Type a name first.")).not.toBeNull();
    const create = button("Create");
    expect(create.getAttribute("aria-disabled")).toBe("true");
    expect(create.title).toBe("Type a name first.");
    await user().type(field(), "   {Enter}");
    expect(button("Create").getAttribute("aria-disabled")).toBe("true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit an empty field even when the form is submitted directly", async () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve());
    open(onSubmit);
    await submitDirectly();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("enables submit once there is text and shows the hint", async () => {
    open(() => Promise.resolve());
    await user().type(field(), "alpha");
    expect(button("Create").getAttribute("aria-disabled")).toBeNull();
    expect(screen.getByText("Letters and dashes.")).not.toBeNull();
    expect(screen.queryByText("Type a name first.")).toBeNull();
  });

  it("submits the trimmed value and closes when onSubmit resolves", async () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve("ok"));
    const onClose = vi.fn<() => void>();
    open(onSubmit, onClose);
    await user().type(field(), "  alpha  ");
    await user().click(button("Create"));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("alpha");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits on Enter in the field", async () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve());
    open(onSubmit);
    await user().type(field(), "alpha{Enter}");
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("alpha");
  });

  it("is busy while onSubmit is in flight, and ignores a second submit", async () => {
    const pending = Promise.withResolvers<void>();
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => pending.promise);
    open(onSubmit);
    await user().type(field(), "alpha");
    await user().click(button("Create"));
    const busy = button("Creating…");
    expect(busy.disabled).toBe(true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
    await submitDirectly();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve());
  });

  it("shows a rejection's message as the Field error, stays open and lets the user retry", async () => {
    const onSubmit = vi
      .fn<(value: string) => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("Name taken"))
      .mockResolvedValue(null);
    const onClose = vi.fn<() => void>();
    open(onSubmit, onClose);
    await user().type(field(), "alpha");
    await user().click(button("Create"));
    expect(screen.getByRole("alert").textContent).toBe("Name taken");
    expect(onClose).not.toHaveBeenCalled();
    expect(button("Create").getAttribute("aria-disabled")).toBeNull();
    await user().click(button("Create"));
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a non-Error rejection as text", async () => {
    open(() => Promise.reject("nope"));
    await user().type(field(), "alpha");
    await user().click(button("Create"));
    expect(screen.getByRole("alert").textContent).toBe("nope");
  });

  it("closes through the dialog on Cancel", async () => {
    const onClose = vi.fn<() => void>();
    open(() => Promise.resolve(), onClose);
    await user().click(button("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
