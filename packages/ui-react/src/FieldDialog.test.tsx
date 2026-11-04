// @vitest-environment jsdom
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount as render, stubDialog, unmount } from "./dom.harness.js";
import { FieldDialog } from "./FieldDialog.js";

beforeEach(stubDialog);
afterEach(unmount);

const PROPS = {
  title: "New project",
  label: "Name",
  inputLabel: "Project name",
  placeholder: "my-project",
  hint: "Letters and dashes.",
  emptyReason: "Type a name first.",
  submit: "Create",
  busyLabel: "Creating…",
};

function mount(
  onSubmit: (value: string) => Promise<unknown>,
  onClose: () => void = vi.fn<() => void>(),
): HTMLElement {
  return render(<FieldDialog {...PROPS} onSubmit={onSubmit} onClose={onClose} />);
}

/** A promise the test settles by hand, to hold onSubmit in flight. */
function deferred() {
  const settle: { resolve?: () => void } = {};
  const promise = new Promise<void>((done) => {
    settle.resolve = done;
  });
  return { promise, resolve: () => settle.resolve?.() };
}

const input = (host: HTMLElement): HTMLInputElement => {
  const el = host.querySelector("input");
  if (!el) throw new Error("no input");
  return el;
};
const button = (host: HTMLElement, text: string): HTMLButtonElement => {
  const el = [...host.querySelectorAll("button")].find((b) => b.textContent === text);
  if (!el) throw new Error(`no ${text} button`);
  return el;
};

/** Type into the controlled input the way a user does, so React sees an input event. */
function type(host: HTMLElement, value: string): void {
  const el = input(host);
  act(() => {
    // The prototype's setter, not the element's own: React watches the latter to skip no-op events.
    Reflect.set(HTMLInputElement.prototype, "value", value, el);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

const submitForm = (host: HTMLElement) =>
  act(async () => {
    host.querySelector("form")?.requestSubmit();
  });

describe("FieldDialog", () => {
  it("names the field and blocks submit with the empty reason while it is empty", () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve());
    const out = mount(onSubmit);
    expect(input(out).getAttribute("aria-label")).toBe("Project name");
    expect(out.textContent).toContain("Type a name first.");
    const create = button(out, "Create");
    expect(create.disabled).toBe(true);
    expect(create.title).toBe("Type a name first.");
    type(out, "   ");
    expect(button(out, "Create").disabled).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit an empty field even when the form is submitted directly", async () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve());
    const out = mount(onSubmit);
    await submitForm(out);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("enables submit once there is text and shows the hint", () => {
    const out = mount(() => Promise.resolve());
    type(out, "alpha");
    expect(button(out, "Create").disabled).toBe(false);
    expect(out.textContent).toContain("Letters and dashes.");
    expect(out.textContent).not.toContain("Type a name first.");
  });

  it("submits the trimmed value and closes when onSubmit resolves", async () => {
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => Promise.resolve("ok"));
    const onClose = vi.fn<() => void>();
    const out = mount(onSubmit, onClose);
    type(out, "  alpha  ");
    await submitForm(out);
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("alpha");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("is busy while onSubmit is in flight, and ignores a second submit", async () => {
    const pending = deferred();
    const onSubmit = vi.fn<(value: string) => Promise<unknown>>(() => pending.promise);
    const out = mount(onSubmit);
    type(out, "alpha");
    await submitForm(out);
    const busy = button(out, "Creating…");
    expect(busy.disabled).toBe(true);
    expect(busy.getAttribute("aria-busy")).toBe("true");
    await submitForm(out);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve());
  });

  it("shows a rejection's message as the Field error, stays open and lets the user retry", async () => {
    const onSubmit = vi
      .fn<(value: string) => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("Name taken"))
      .mockResolvedValue(null);
    const onClose = vi.fn<() => void>();
    const out = mount(onSubmit, onClose);
    type(out, "alpha");
    await submitForm(out);
    expect(out.querySelector('[role="alert"]')?.textContent).toBe("Name taken");
    expect(onClose).not.toHaveBeenCalled();
    expect(button(out, "Create").disabled).toBe(false);
    await submitForm(out);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a non-Error rejection as text", async () => {
    const out = mount(() => Promise.reject("nope"));
    type(out, "alpha");
    await submitForm(out);
    expect(out.querySelector('[role="alert"]')?.textContent).toBe("nope");
  });

  it("closes through the dialog on Cancel", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(() => Promise.resolve(), onClose);
    await act(async () => button(out, "Cancel").click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
