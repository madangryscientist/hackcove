// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dialogOf, mount, showModal, stubDialog, unmount } from "./dom.harness.js";
import { Lightbox } from "./Lightbox.js";

beforeEach(stubDialog);
afterEach(unmount);

const photo = <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Harbour at dusk" />;

const button = (out: HTMLElement, label: string) =>
  out.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);

const press = (out: HTMLElement, key: string) =>
  act(() => {
    dialogOf(out).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  });

describe("Lightbox", () => {
  it("opens as a modal on mount and closes when the parent unmounts it", () => {
    const out = mount(
      <Lightbox label="Photo" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    const dialog = dialogOf(out);
    expect(showModal).toHaveBeenCalledExactlyOnceWith(dialog);
    unmount();
    expect(dialog.hasAttribute("open")).toBe(false);
  });

  it("is named by its label", () => {
    const out = mount(
      <Lightbox label="Status from Anna" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(dialogOf(out).getAttribute("aria-label")).toBe("Status from Anna");
  });

  it("shows the title and meta above the media and the caption below it", () => {
    const out = mount(
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
    const text = dialogOf(out).textContent ?? "";
    expect(text.indexOf("Anna")).toBeLessThan(text.indexOf("Today, 09:12"));
    const html = dialogOf(out).innerHTML;
    expect(html.indexOf("Today, 09:12")).toBeLessThan(html.indexOf("<img"));
    expect(html.indexOf("<img")).toBeLessThan(html.indexOf("Harbour at dusk</p>"));
  });

  it("fits the media inside the screen", () => {
    const out = renderToStaticMarkup(
      <Lightbox label="Photo" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(out).toContain("*:max-h-full");
    expect(out).toContain("*:max-w-full");
    expect(out).toContain("*:object-contain");
  });

  it("paints its own scrim, the same near-black in every theme, and fades in and out", () => {
    const out = renderToStaticMarkup(
      <Lightbox label="Photo" title="Anna" caption="c" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(out.match(/<dialog[^>]*>/)?.[0]).toContain("bg-black/90");
    expect(out).toContain("text-white");
    expect(out).toContain("text-white/70");
    expect(out).toContain("transition-discrete");
    expect(out).toContain("starting:open:opacity-0");
    expect(out).toContain("motion-reduce:transition-none");
  });

  it("keeps the focus outline on the scrim's controls light, not the accent", () => {
    const out = renderToStaticMarkup(
      <Lightbox label="Photo" onClose={() => {}} onNext={() => {}}>
        {photo}
      </Lightbox>,
    );
    const buttons = out.match(/<button[^>]*>/g) ?? [];
    expect(buttons.length).toBe(2);
    for (const tag of buttons) {
      expect(tag).toContain("focus-visible:outline-white");
      expect(tag).not.toContain("outline-violet-600");
    }
  });

  it("calls onClose when the dialog closes (Esc fires the same event)", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await act(async () => dialogOf(out).close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from its close button", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await act(async () => button(out, "Close")?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the scrim around the media", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await act(async () => out.querySelector("img")?.parentElement?.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the dialog itself", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(
      <Lightbox label="Photo" onClose={onClose}>
        {photo}
      </Lightbox>,
    );
    await act(async () => dialogOf(out).click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on a click on the media, the text or a step button", async () => {
    const onClose = vi.fn<() => void>();
    const onNext = vi.fn<() => void>();
    const out = mount(
      <Lightbox label="Photo" title="Anna" caption="Harbour" onClose={onClose} onNext={onNext}>
        {photo}
      </Lightbox>,
    );
    await act(async () => out.querySelector("img")?.click());
    await act(async () => out.querySelector("p")?.click());
    await act(async () => button(out, "Next")?.click());
    expect(onClose).not.toHaveBeenCalled();
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("steps with the previous and next buttons and the arrow keys", async () => {
    const onPrevious = vi.fn<() => void>();
    const onNext = vi.fn<() => void>();
    const out = mount(
      <Lightbox label="Photo" onClose={() => {}} onPrevious={onPrevious} onNext={onNext}>
        {photo}
      </Lightbox>,
    );
    await act(async () => button(out, "Previous")?.click());
    await act(async () => button(out, "Next")?.click());
    press(out, "ArrowLeft");
    press(out, "ArrowRight");
    press(out, "ArrowRight");
    expect(onPrevious).toHaveBeenCalledTimes(2);
    expect(onNext).toHaveBeenCalledTimes(3);
  });

  it("has no step buttons, and ignores the arrow keys, without onPrevious and onNext", () => {
    const out = mount(
      <Lightbox label="Photo" onClose={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(button(out, "Previous")).toBeNull();
    expect(button(out, "Next")).toBeNull();
    expect(out.querySelectorAll("button")).toHaveLength(1);
    press(out, "ArrowLeft");
    press(out, "ArrowRight");
  });

  it("shows only the step it can take", () => {
    const out = mount(
      <Lightbox label="Photo" onClose={() => {}} onNext={() => {}}>
        {photo}
      </Lightbox>,
    );
    expect(button(out, "Previous")).toBeNull();
    expect(button(out, "Next")).not.toBeNull();
  });
});
