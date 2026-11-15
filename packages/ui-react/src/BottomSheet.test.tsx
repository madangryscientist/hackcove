// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";
import { BottomSheet, type BottomSheetProps } from "./BottomSheet.js";
import { render, screen, user } from "./render.harness.js";

// jsdom has no pointer capture; the handle takes it on every press.
beforeAll(() => {
  HTMLElement.prototype.setPointerCapture = vi.fn<(pointerId: number) => void>();
  HTMLElement.prototype.releasePointerCapture = vi.fn<(pointerId: number) => void>();
  HTMLElement.prototype.hasPointerCapture = vi.fn<(pointerId: number) => boolean>(() => false);
});

const sheet = (props: Partial<BottomSheetProps> = {}) => (
  <BottomSheet
    label="Shops"
    snaps={[0.25, 0.5, 0.9]}
    snap={0}
    onSnapChange={() => undefined}
    header={<h2>Shops nearby</h2>}
    {...props}
  >
    <p>Body</p>
  </BottomSheet>
);

const handle = () => screen.getByRole("button", { name: "Shops" });

describe("BottomSheet", () => {
  it("is a region named by its label, with one handle button named by it alone", () => {
    render(sheet());
    expect(screen.getByRole("region", { name: "Shops" })).not.toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
    expect(handle().textContent).toBe("");
  });

  it("marks the handle expanded past the first snap, and points it at the body", () => {
    const { rerender } = render(sheet());
    expect(handle().getAttribute("aria-expanded")).toBe("false");
    const controls = String(handle().getAttribute("aria-controls"));
    // The body has no role of its own: find it by the id the handle points at, through screen.
    const body = screen.getByText((_, element) => element?.id === controls);
    expect(body.textContent).toBe("Body");
    rerender(sheet({ snap: 1 }));
    expect(handle().getAttribute("aria-expanded")).toBe("true");
  });

  it("steps to the next snap on a click, and wraps from the last to the first", async () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    const { rerender } = render(sheet({ onSnapChange }));
    await user().click(handle());
    expect(onSnapChange).toHaveBeenLastCalledWith(1);
    rerender(sheet({ onSnapChange, snap: 2 }));
    await user().click(handle());
    expect(onSnapChange).toHaveBeenLastCalledWith(0);
  });

  it("steps to the next snap on Enter from the keyboard", async () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    render(sheet({ onSnapChange }));
    const u = user();
    await u.tab();
    expect(document.activeElement).toBe(handle());
    await u.keyboard("{Enter}");
    expect(onSnapChange).toHaveBeenCalledExactlyOnceWith(1);
  });

  it("returns to the first snap on Escape, and does nothing on it at the first", async () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    const { rerender } = render(sheet({ onSnapChange, snap: 2 }));
    const u = user();
    await u.tab();
    await u.keyboard("{Escape}");
    expect(onSnapChange).toHaveBeenCalledExactlyOnceWith(0);
    onSnapChange.mockClear();
    rerender(sheet({ onSnapChange, snap: 0 }));
    await u.keyboard("{Escape}");
    expect(onSnapChange).not.toHaveBeenCalled();
  });

  it("leaves an Escape inside a nested dialog to the dialog", async () => {
    const onSnapChange = vi.fn<(snap: number) => void>();
    render(
      <BottomSheet label="Shops" snaps={[0.25, 0.5]} snap={1} onSnapChange={onSnapChange}>
        <dialog open>
          <button type="button">In the dialog</button>
        </dialog>
      </BottomSheet>,
    );
    const u = user();
    await u.tab();
    await u.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "In the dialog" }));
    await u.keyboard("{Escape}");
    expect(onSnapChange).not.toHaveBeenCalled();
  });

  it("keeps a header heading outside the handle, so it stays a heading", () => {
    render(sheet());
    const heading = screen.getByRole("heading", { name: "Shops nearby" });
    expect(handle().contains(heading)).toBe(false);
  });

  it("reports the height it rests at, on mount and on a change of snap", () => {
    const onHeightChange = vi.fn<(px: number) => void>();
    const { rerender } = render(sheet({ snaps: ["120px", "320px"], onHeightChange }));
    expect(onHeightChange).toHaveBeenLastCalledWith(120);
    rerender(sheet({ snaps: ["120px", "320px"], onHeightChange, snap: 1 }));
    expect(onHeightChange).toHaveBeenLastCalledWith(320);
    expect(onHeightChange).toHaveBeenCalledTimes(2);
  });

  it("is not modal: it is not a dialog, not aria-modal, and the page behind stays usable", async () => {
    const onMap = vi.fn<() => void>();
    render(
      <>
        <button type="button" onClick={onMap}>
          Map
        </button>
        {sheet({ snap: 2 })}
      </>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    const region = screen.getByRole("region", { name: "Shops" });
    expect(region.hasAttribute("aria-modal")).toBe(false);
    expect(region.hasAttribute("inert")).toBe(false);
    await user().click(screen.getByRole("button", { name: "Map" }));
    expect(onMap).toHaveBeenCalledOnce();
  });
});
