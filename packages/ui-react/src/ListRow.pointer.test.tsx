// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mount, unmount } from "./dom.harness.js";
import { ListRow } from "./ListRow.js";

afterEach(unmount);

// React's onPointerEnter listens for pointerover/pointerout and works out the enter itself.
function pointerInto(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
  });
}
function pointerOutOf(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent("pointerout", { bubbles: true, relatedTarget: document.body }));
  });
}

describe("ListRow pointer and focus handlers", () => {
  it("reach a button row and a static row", () => {
    for (const form of ["button", "static"] as const) {
      const enter = vi.fn<() => void>();
      const leave = vi.fn<() => void>();
      const focus = vi.fn<() => void>();
      const root = mount(
        form === "static" ? (
          <ListRow
            static
            tabIndex={0}
            onPointerEnter={enter}
            onPointerLeave={leave}
            onFocus={focus}
          >
            Rent
          </ListRow>
        ) : (
          <ListRow onPointerEnter={enter} onPointerLeave={leave} onFocus={focus}>
            Rent
          </ListRow>
        ),
      );
      const row = root.firstElementChild;
      if (!(row instanceof HTMLElement)) throw new Error("no row");
      pointerInto(row);
      pointerOutOf(row);
      act(() => row.focus());
      expect([enter.mock.calls.length, leave.mock.calls.length, focus.mock.calls.length]).toEqual([
        1, 1, 1,
      ]);
      unmount();
    }
  });

  it("on a linked row, the pointer handlers sit on the row and focus on the link", () => {
    const enter = vi.fn<() => void>();
    const leave = vi.fn<() => void>();
    const focus = vi.fn<() => void>();
    const root = mount(
      <ListRow href="/r" onPointerEnter={enter} onPointerLeave={leave} onFocus={focus}>
        Rent
      </ListRow>,
    );
    const row = root.firstElementChild;
    if (!(row instanceof HTMLElement)) throw new Error("no row");
    pointerInto(row);
    pointerOutOf(row);
    act(() => root.querySelector("a")?.focus());
    expect(enter).toHaveBeenCalledTimes(1);
    expect(leave).toHaveBeenCalledTimes(1);
    expect(focus).toHaveBeenCalledTimes(1);
  });
});
