// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { ListRow } from "./ListRow.js";
import { render, screen, user } from "./render.harness.js";

const handlers = () => ({
  onPointerEnter: vi.fn<() => void>(),
  onPointerLeave: vi.fn<() => void>(),
  onFocus: vi.fn<() => void>(),
});

const counts = (h: ReturnType<typeof handlers>) => [
  h.onPointerEnter.mock.calls.length,
  h.onPointerLeave.mock.calls.length,
  h.onFocus.mock.calls.length,
];

describe("ListRow pointer and focus handlers", () => {
  it("reach a button row: the pointer over and off the row, and Tab onto its button", async () => {
    const h = handlers();
    render(
      <ListRow onClick={() => undefined} {...h}>
        Rent
      </ListRow>,
    );
    const button = screen.getByRole("button", { name: "Rent" });
    const u = user();
    // The row's label, not its button: the handlers are the row's, so they fire off the button too.
    await u.hover(screen.getByText("Rent"));
    await u.unhover(screen.getByText("Rent"));
    await u.tab();
    expect(document.activeElement).toBe(button);
    expect(counts(h)).toEqual([1, 1, 1]);
  });

  it("reach a static row: the pointer over and off its text, and Tab onto the row", async () => {
    const h = handlers();
    render(
      <ListRow tabIndex={0} aria-label="Rent row" {...h}>
        Rent
      </ListRow>,
    );
    const u = user();
    await u.hover(screen.getByText("Rent"));
    await u.unhover(screen.getByText("Rent"));
    await u.tab();
    expect(document.activeElement).toBe(screen.getByLabelText("Rent row"));
    expect(counts(h)).toEqual([1, 1, 1]);
  });

  it("on a linked row, the pointer handlers fire for the row and focus lands on the link", async () => {
    const h = handlers();
    render(
      <ListRow href="/r" {...h}>
        Rent
      </ListRow>,
    );
    const link = screen.getByRole("link", { name: "Rent" });
    const u = user();
    // The row's label, not its link: the handlers are the row's, so they fire off the link too.
    await u.hover(screen.getByText("Rent"));
    await u.unhover(screen.getByText("Rent"));
    await u.tab();
    expect(document.activeElement).toBe(link);
    expect(counts(h)).toEqual([1, 1, 1]);
  });
});
