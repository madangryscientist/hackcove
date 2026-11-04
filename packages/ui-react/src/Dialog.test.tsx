// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog.js";
import { dialogOf, mount, showModal, stubDialog, unmount } from "./dom.harness.js";

beforeEach(stubDialog);
afterEach(unmount);

describe("Dialog", () => {
  it("opens as a modal on mount", () => {
    const out = mount(<Dialog title="Rename" onClose={() => {}} />);
    expect(showModal).toHaveBeenCalledExactlyOnceWith(dialogOf(out));
  });

  it("closes the dialog when the parent unmounts it, so no open modal or inert page is left behind", () => {
    const dialog = dialogOf(mount(<Dialog title="Rename" onClose={() => {}} />));
    expect(dialog.hasAttribute("open")).toBe(true);
    unmount();
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(document.querySelector("dialog[open]")).toBeNull();
    expect(document.querySelector("[inert]")).toBeNull();
  });

  it("is named by its title and shows the description, body and footer", () => {
    const out = mount(
      <Dialog
        title="Rename"
        description="Pick a new name."
        footer={<button type="button">Done</button>}
        onClose={() => {}}
      >
        <p>Body text</p>
      </Dialog>,
    );
    const dialog = dialogOf(out);
    const heading = dialog.querySelector("h2");
    expect(heading?.textContent).toBe("Rename");
    expect(dialog.getAttribute("aria-labelledby")).toBe(heading?.id);
    expect(dialog.textContent).toContain("Pick a new name.");
    expect(dialog.textContent).toContain("Body text");
    expect(dialog.textContent).toContain("Done");
  });

  it("calls onClose when the dialog closes (Esc and form method=dialog fire the same event)", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Dialog title="t" onClose={onClose} />);
    await act(async () => dialogOf(out).close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the backdrop, which is a click on the <dialog> itself", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Dialog title="t" onClose={onClose} />);
    await act(async () => dialogOf(out).click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose only after the exit transition has ended, so an unmount does not cut it short", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Dialog title="t" onClose={onClose} />);
    const dialog = dialogOf(out);
    const exit = Promise.withResolvers<null>();
    // A looping animation inside the dialog (a spinner) is not an exit transition and is not waited for.
    const spinner = { finished: new Promise<null>(() => {}) };
    const opacity = { transitionProperty: "opacity", finished: exit.promise };
    Reflect.set(dialog, "getAnimations", () => [spinner, opacity]);
    await act(async () => dialog.click());
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => exit.resolve(null));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for the close an unmount causes", async () => {
    const onClose = vi.fn<() => void>();
    mount(<Dialog title="t" onClose={onClose} />);
    await act(async () => unmount());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("slides and fades in and out with transitions that survive the dialog leaving the top layer", () => {
    const out = renderToStaticMarkup(<Dialog title="t" onClose={() => {}} />);
    expect(out).toContain("transition-discrete");
    expect(out).toContain("starting:open:opacity-0");
    expect(out).toContain("backdrop:transition-discrete");
    expect(out).toContain("motion-reduce:transition-none");
  });

  it("does not close on a click inside the panel", () => {
    const onClose = vi.fn<() => void>();
    const out = mount(
      <Dialog title="t" onClose={onClose}>
        <button type="button">inner</button>
      </Dialog>,
    );
    act(() => out.querySelector("button")?.click());
    act(() => out.querySelector("h2")?.click());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders only the title when there is no description, body or footer", () => {
    const out = renderToStaticMarkup(<Dialog title="Only" onClose={() => {}} />);
    expect(out).toContain(">Only</h2>");
    expect(out).not.toContain("mt-4");
    expect(out).not.toContain("mt-5");
  });

  it("sizes the panel", () => {
    const sm = renderToStaticMarkup(<Dialog title="t" size="sm" onClose={() => {}} />);
    expect(sm).toContain("w-80");
    const md = renderToStaticMarkup(<Dialog title="t" onClose={() => {}} />);
    expect(md).toContain("w-110");
  });
});
