// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { showModal, stubDialog } from "./dom.harness.js";
import { Lightbox } from "./Lightbox.js";
import { act, follows, render, screen, user } from "./render.harness.js";

// stubDialog supplies the modal <dialog> methods jsdom lacks; it does not act through the DOM.
beforeEach(stubDialog);

const photo = <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Harbour at dusk" />;

/** Whether each arrow key that reached the page had its default (scrolling) taken by the viewer. */
const prevented: boolean[] = [];
const record = (event: KeyboardEvent) => prevented.push(event.defaultPrevented);
beforeEach(() => document.addEventListener("keydown", record));
afterEach(() => {
  document.removeEventListener("keydown", record);
  prevented.length = 0;
});

/** Put the keyboard inside the viewer, as the open does in a browser (jsdom's stub moves no focus). */
const focusInside = () => act(() => screen.getByRole("button", { name: "Close" }).focus());

describe("Lightbox", () => {
  it("opens as a modal on mount and closes when the parent unmounts it", () => {
    const { unmount } = render(
      <Lightbox label="Photo" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "Photo" });
    expect(showModal).toHaveBeenCalledExactlyOnceWith(dialog);
    unmount();
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("is named by its label", () => {
    render(
      <Lightbox label="Status from Anna" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(
      screen.getByRole<HTMLDialogElement>("dialog", { name: "Status from Anna" }),
    ).not.toBeNull();
  });

  it("reads the title, then the meta, then the media, then the caption", () => {
    render(
      <Lightbox
        label="Photo"
        title="Anna"
        meta="Today, 09:12"
        caption="Harbour at dusk"
        onClose={() => {}}
      >
        {photo}
      </Lightbox>,
    );
    const meta = screen.getByText("Today, 09:12");
    const media = screen.getByRole("img", { name: "Harbour at dusk" });
    expect(follows(screen.getByText("Anna"), meta)).toBeTruthy();
    expect(follows(meta, media)).toBeTruthy();
    expect(follows(media, screen.getByText("Harbour at dusk"))).toBeTruthy();
  });

  it("calls onClose when the dialog closes (Esc fires the same event)", async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    // Esc closes a modal <dialog> in the browser; jsdom has none, so the test calls the close it makes.
    await act(async () => screen.getByRole<HTMLDialogElement>("dialog", { name: "Photo" }).close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from its close button", async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await user().click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["above", "banner"],
    ["below", "contentinfo"],
  ] as const)("closes on a click on the scrim %s the media", async (_, band) => {
    const onClose = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await user().click(screen.getByRole(band));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the dialog itself", async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await user().click(screen.getByRole<HTMLDialogElement>("dialog", { name: "Photo" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on a click on the media, the text or a step button", async () => {
    const onClose = vi.fn<() => void>();
    const onNext = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" title="Anna" caption="Harbour" onClose={onClose} onNext={onNext}>
        {photo}
      </Lightbox>,
    );
    await user().click(screen.getByRole("img", { name: "Harbour at dusk" }));
    await user().click(screen.getByText("Anna"));
    await user().click(screen.getByText("Harbour"));
    await user().click(screen.getByRole("button", { name: "Next" }));
    expect(onClose).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("steps with the previous and next buttons and the arrow keys, taking the keys from the page", async () => {
    const onPrevious = vi.fn<() => void>();
    const onNext = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" onClose={() => {}} onPrevious={onPrevious} onNext={onNext}>
        {photo}
      </Lightbox>,
    );
    await user().click(screen.getByRole("button", { name: "Previous" }));
    await user().click(screen.getByRole("button", { name: "Next" }));
    focusInside();
    await user().keyboard("{ArrowLeft}{ArrowRight}{ArrowRight}");
    expect(onPrevious).toHaveBeenCalledTimes(2);
    expect(onNext).toHaveBeenCalledTimes(3);
    expect(prevented).toEqual([true, true, true]);
  });

  it("has no step buttons, and leaves the arrow keys to the page, without onPrevious and onNext", async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    expect(screen.getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual([
      "Close",
    ]);
    focusInside();
    await user().keyboard("{ArrowLeft}{ArrowRight}");
    expect(prevented).toEqual([false, false]);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("img", { name: "Harbour at dusk" })).not.toBeNull();
  });

  it("shows only the step it can take", () => {
    render(
      <Lightbox label="Photo" onClose={() => {}} onNext={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeNull();
  });
});
