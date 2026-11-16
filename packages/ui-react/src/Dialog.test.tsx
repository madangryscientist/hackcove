// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog.js";
import { showModal, stubDialog } from "./dom.harness.js";
import { act, render, screen, user } from "./render.harness.js";

// stubDialog supplies the modal <dialog> methods jsdom lacks; it does not act through the DOM.
beforeEach(stubDialog);

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

describe("Dialog", () => {
  it("opens as a modal on mount", () => {
    render(<Dialog title="Rename" onClose={() => {}} />);
    expect(showModal).toHaveBeenCalledExactlyOnceWith(
      screen.getByRole<HTMLDialogElement>("dialog", { name: "Rename" }),
    );
  });

  it("closes the dialog when the parent unmounts it, so no open modal is left behind", () => {
    const { unmount } = render(<Dialog title="Rename" onClose={() => {}} />);
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "Rename" });
    expect(dialog.hasAttribute("open")).toBe(true);
    unmount();
    expect(dialog.hasAttribute("open")).toBe(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("is named by its title heading and shows the description, body and footer", () => {
    render(
      <Dialog
        title="Rename"
        description="Pick a new name."
        footer={<button type="button">Done</button>}
        onClose={() => {}}
      >
        <p>Body text</p>
      </Dialog>,
    );
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "Rename" });
    expect(screen.getByRole("heading", { name: "Rename" })).not.toBeNull();
    expect(dialog.textContent).toContain("Pick a new name.");
    expect(dialog.textContent).toContain("Body text");
    expect(screen.getByRole("button", { name: "Done" })).not.toBeNull();
  });

  it("holds only its title when there is no description, body or footer", () => {
    render(<Dialog title="Only" onClose={() => {}} />);
    expect(screen.getByRole<HTMLDialogElement>("dialog", { name: "Only" }).textContent).toBe(
      "Only",
    );
  });

  it("calls onClose when the dialog closes (Esc and form method=dialog fire the same event)", async () => {
    const onClose = vi.fn<() => void>();
    render(<Dialog title="t" onClose={onClose} />);
    // Esc closes a modal <dialog> in the browser; jsdom has none, so the test calls the close it makes.
    await act(async () => screen.getByRole<HTMLDialogElement>("dialog", { name: "t" }).close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on a click on the backdrop, which is a click on the <dialog> itself", async () => {
    const onClose = vi.fn<() => void>();
    render(<Dialog title="t" onClose={onClose} />);
    await user().click(screen.getByRole<HTMLDialogElement>("dialog", { name: "t" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stays open when a press began inside and its click lands on the <dialog>", async () => {
    // A Menu opens on the press and makes the dialog's content inert, so the browser hands the
    // click to the <dialog> element: that is not a backdrop click.
    const onClose = vi.fn<() => void>();
    render(
      <Dialog title="t" onClose={onClose}>
        <button type="button">Inside</button>
      </Dialog>,
    );
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "t" });
    await user().pointer([
      { keys: "[MouseLeft>]", target: screen.getByRole("button", { name: "Inside" }) },
      { keys: "[/MouseLeft]", target: dialog },
    ]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose only after the exit transition has ended, so an unmount does not cut it short", async () => {
    const onClose = vi.fn<() => void>();
    render(<Dialog title="t" onClose={onClose} />);
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "t" });
    const exit = Promise.withResolvers<null>();
    // A looping animation inside the dialog (a spinner) is not an exit transition and is not waited for.
    const spinner = { finished: new Promise<null>(() => {}) };
    const opacity = { transitionProperty: "opacity", finished: exit.promise };
    // jsdom has no Web Animations: the test says which ones are running.
    Reflect.set(dialog, "getAnimations", () => [spinner, opacity]);
    await user().click(dialog);
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => exit.resolve(null));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for the close an unmount causes", async () => {
    const onClose = vi.fn<() => void>();
    const { unmount } = render(<Dialog title="t" onClose={onClose} />);
    await act(async () => unmount());
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not close on a click inside the panel", async () => {
    const onClose = vi.fn<() => void>();
    render(
      <Dialog title="t" onClose={onClose}>
        <button type="button">inner</button>
      </Dialog>,
    );
    await user().click(screen.getByRole("button", { name: "inner" }));
    await user().click(screen.getByRole("heading", { name: "t" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("still opens as a modal and calls onClose at width full", async () => {
    const onClose = vi.fn<() => void>();
    render(<Dialog title="t" width="full" onClose={onClose} />);
    const dialog = screen.getByRole<HTMLDialogElement>("dialog", { name: "t" });
    expect(showModal).toHaveBeenCalledExactlyOnceWith(dialog);
    // Esc closes a modal <dialog> in the browser; jsdom has none, so the test calls the close it makes.
    await act(async () => dialog.close());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // The body takes the tab stop as a group named by the title; with no stop it is no group.
  describe("the body's tab stop", () => {
    it("takes one when it overflows and holds nothing the keyboard can reach", () => {
      overflowing(900, 400);
      render(
        <Dialog title="Terms" onClose={() => {}}>
          <p>Long text</p>
        </Dialog>,
      );
      const body = screen.getByRole("group", { name: "Terms" });
      expect(body.tabIndex).toBe(0);
      expect(body.textContent).toBe("Long text");
    });

    it("takes none when it fits", () => {
      overflowing(300, 400);
      render(
        <Dialog title="t" onClose={() => {}}>
          <p>Short text</p>
        </Dialog>,
      );
      expect(screen.queryByRole("group")).toBeNull();
    });

    it.each([
      ["a field", <input key="i" aria-label="Name" />],
      [
        "a link",
        <a key="a" href="/x">
          Link
        </a>,
      ],
      [
        "a tab stop",
        <div key="d" tabIndex={0}>
          Stop
        </div>,
      ],
    ])(
      "takes none when %s in it is already reachable, so the first focus stays on it",
      (_, field) => {
        overflowing(900, 400);
        render(
          <Dialog title="t" onClose={() => {}}>
            {field}
          </Dialog>,
        );
        expect(screen.queryByRole("group")).toBeNull();
      },
    );

    it("still takes one when the only focusable things are disabled or out of the tab order", () => {
      overflowing(900, 400);
      render(
        <Dialog title="t" onClose={() => {}}>
          <button type="button" disabled>
            Off
          </button>
          <div tabIndex={-1}>Skipped</div>
          <input type="hidden" />
        </Dialog>,
      );
      expect(screen.getByRole("group", { name: "t" }).tabIndex).toBe(0);
    });

    it("re-measures when the body is resized", () => {
      overflowing(300, 400);
      render(
        <Dialog title="t" onClose={() => {}}>
          <p>Text</p>
        </Dialog>,
      );
      expect(screen.queryByRole("group")).toBeNull();
      overflowing(900, 400);
      act(() => observers.forEach((notify) => notify()));
      expect(screen.getByRole("group", { name: "t" }).tabIndex).toBe(0);
    });

    it("takes none, and does not throw, where there is no ResizeObserver", () => {
      render(
        <Dialog title="t" onClose={() => {}}>
          <p>Text</p>
        </Dialog>,
      );
      expect(screen.getByText("Text")).not.toBeNull();
      expect(screen.queryByRole("group")).toBeNull();
    });

    it("never gives the full-screen body one", () => {
      overflowing(900, 400);
      render(
        <Dialog title="t" width="full" onClose={() => {}}>
          <p>Text</p>
        </Dialog>,
      );
      expect(screen.queryByRole("group")).toBeNull();
    });
  });
});
