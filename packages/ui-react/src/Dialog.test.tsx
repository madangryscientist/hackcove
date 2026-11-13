// @vitest-environment jsdom
import { act } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog.js";
import { dialogOf, mount, showModal, stubDialog, unmount } from "./dom.harness.js";

beforeEach(stubDialog);
afterEach(unmount);

/** The callbacks of every observer the dialog has started, so a test can say the body was resized. */
const observers: Array<() => void> = [];
/** jsdom has no layout and no ResizeObserver: say how tall the body's content is and how much of it shows. */
const overflowing = (scrollHeight: number, clientHeight: number) => {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    value: clientHeight,
  });
  // As in a browser, an observer reports once as soon as it starts observing.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private readonly notify: () => void) {
        observers.push(notify);
      }
      observe() {
        this.notify();
      }
      disconnect() {}
    },
  );
};
afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  vi.unstubAllGlobals();
  observers.length = 0;
});
const bodyOf = (out: HTMLElement) => dialogOf(out).querySelector<HTMLElement>("h2 ~ div");

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

  it("fills the screen at size full, with a body that takes the height between header and footer", () => {
    const out = renderToStaticMarkup(
      <Dialog
        title="t"
        size="full"
        footer={<button type="button">Close</button>}
        onClose={() => {}}
      >
        <p>Player</p>
      </Dialog>,
    );
    expect(out).toContain("fixed inset-0");
    expect(out).toContain("size-full");
    expect(out).toContain("rounded-none");
    expect(out).toContain("min-h-0 flex-1 overflow-auto");
    expect(out).toContain("shrink-0");
    // Not a floating panel: no width, offset or slide. Compare whole class tokens, so a heading's
    // `scroll-mt-28` is not read as `mt-28`.
    const classes = [...out.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1]?.split(" ") ?? []);
    for (const windowed of ["mt-28", "w-80", "w-110", "w-160", "translate-y"]) {
      expect(classes).not.toContain(windowed);
    }
  });

  it("keeps the fade at size full and still opens as a modal", async () => {
    const onClose = vi.fn<() => void>();
    const out = mount(<Dialog title="t" size="full" onClose={onClose} />);
    const dialog = dialogOf(out);
    expect(showModal).toHaveBeenCalledExactlyOnceWith(dialog);
    expect(dialog.className).toContain("starting:open:opacity-0");
    expect(dialog.className).toContain("motion-reduce:transition-none");
    await act(async () => dialog.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves the windowed sizes without the full-screen classes", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const out = renderToStaticMarkup(<Dialog title="t" size={size} onClose={() => {}} />);
      expect(out).not.toContain("fixed inset-0");
      expect(out).toContain("rounded-2xl");
    }
  });
  it("caps a windowed dialog to the viewport and scrolls its body, leaving the <dialog> unclipped", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const out = renderToStaticMarkup(
        <Dialog title="t" size={size} footer={<button type="button">Ok</button>} onClose={() => {}}>
          <p>Body</p>
        </Dialog>,
      );
      expect(out).toContain("max-h-[calc(100dvh-8rem-2px)]");
      expect(out).toContain("overflow-y-auto");
      expect(out).toContain("overflow-visible");
      expect(out).not.toContain("overflow-auto");
    }
  });

  it("keeps the focus ring of a field at the body's edge whole, with padding and a matching negative margin", () => {
    const out = renderToStaticMarkup(
      <Dialog title="t" onClose={() => {}}>
        <p>Body</p>
      </Dialog>,
    );
    for (const cls of ["-mx-1", "px-1", "pt-1", "-mb-1", "pb-1"]) expect(out).toContain(cls);
  });

  it("does not cap or scroll the full-screen dialog differently", () => {
    const out = renderToStaticMarkup(
      <Dialog title="t" size="full" onClose={() => {}}>
        <p>Body</p>
      </Dialog>,
    );
    expect(out).not.toContain("max-h-[calc");
    expect(out).not.toContain("overflow-y-auto");
  });

  describe("the body's tab stop", () => {
    it("takes one when it overflows and holds nothing the keyboard can reach", () => {
      overflowing(900, 400);
      const out = mount(
        <Dialog title="Terms" onClose={() => {}}>
          <p>Long text</p>
        </Dialog>,
      );
      const body = bodyOf(out);
      expect(body?.getAttribute("tabindex")).toBe("0");
      expect(body?.getAttribute("role")).toBe("group");
      expect(body?.getAttribute("aria-labelledby")).toBe(dialogOf(out).querySelector("h2")?.id);
    });

    it("takes none when it fits", () => {
      overflowing(300, 400);
      const out = mount(
        <Dialog title="t" onClose={() => {}}>
          <p>Short text</p>
        </Dialog>,
      );
      expect(bodyOf(out)?.hasAttribute("tabindex")).toBe(false);
    });

    it("takes no tab stop when a form field in it is already reachable, so the first focus stays on the field", () => {
      overflowing(900, 400);
      for (const field of [
        <input key="i" aria-label="Name" />,
        <a key="a" href="/x">
          Link
        </a>,
        <div key="d" tabIndex={0}>
          Stop
        </div>,
      ]) {
        const out = mount(
          <Dialog title="t" onClose={() => {}}>
            {field}
          </Dialog>,
        );
        expect(bodyOf(out)?.hasAttribute("tabindex")).toBe(false);
        unmount();
      }
    });

    it("still takes one when the only focusable things are disabled or out of the tab order", () => {
      overflowing(900, 400);
      const out = mount(
        <Dialog title="t" onClose={() => {}}>
          <button type="button" disabled>
            Off
          </button>
          <div tabIndex={-1}>Skipped</div>
          <input type="hidden" />
        </Dialog>,
      );
      expect(bodyOf(out)?.getAttribute("tabindex")).toBe("0");
    });

    it("re-measures when the body is resized", () => {
      overflowing(300, 400);
      const out = mount(
        <Dialog title="t" onClose={() => {}}>
          <p>Text</p>
        </Dialog>,
      );
      expect(bodyOf(out)?.hasAttribute("tabindex")).toBe(false);
      overflowing(900, 400);
      act(() => observers.forEach((notify) => notify()));
      expect(bodyOf(out)?.getAttribute("tabindex")).toBe("0");
    });

    it("takes none, and does not throw, where there is no ResizeObserver", () => {
      const out = mount(
        <Dialog title="t" onClose={() => {}}>
          <p>Text</p>
        </Dialog>,
      );
      expect(bodyOf(out)?.hasAttribute("tabindex")).toBe(false);
    });

    it("never gives the full-screen body one", () => {
      overflowing(900, 400);
      const out = mount(
        <Dialog title="t" size="full" onClose={() => {}}>
          <p>Text</p>
        </Dialog>,
      );
      expect(bodyOf(out)?.hasAttribute("tabindex")).toBe(false);
    });
  });
});
