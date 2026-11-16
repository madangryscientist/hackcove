// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { render, screen, user } from "./render.harness.js";

function checked(box: HTMLElement): boolean {
  expect(box).toBeInstanceOf(HTMLInputElement);
  return box instanceof HTMLInputElement && box.checked;
}

describe("Checkbox", () => {
  it("is a checkbox named by its label, and a click on the label toggles it", async () => {
    render(<Checkbox label="Open now" />);
    const box = screen.getByRole("checkbox", { name: "Open now" });
    expect(checked(box)).toBe(false);
    await user().click(screen.getByText("Open now"));
    expect(checked(box)).toBe(true);
    await user().click(box);
    expect(checked(box)).toBe(false);
  });

  it("starts checked with defaultChecked", () => {
    render(<Checkbox label="Open now" defaultChecked />);
    expect(checked(screen.getByRole("checkbox", { name: "Open now" }))).toBe(true);
  });

  it("puts disabled on the input, not the label, and does not toggle", async () => {
    render(<Checkbox label="Open now" disabled />);
    const box = screen.getByRole("checkbox", { name: "Open now" });
    expect(box.hasAttribute("disabled")).toBe(true);
    expect(screen.getByText("Open now").hasAttribute("disabled")).toBe(false);
    await user().click(box);
    expect(checked(box)).toBe(false);
  });

  it("a bare box is named by aria-label", () => {
    render(<Checkbox aria-label="Select row" />);
    expect(screen.getByRole("checkbox", { name: "Select row" })).not.toBeNull();
  });

  it("hint describes the box and reads after the label", () => {
    render(<Checkbox label="Weekly summary" hint="One email on Mondays" />);
    const box = screen.getByRole("checkbox", {
      name: /^Weekly summary/,
      description: "One email on Mondays",
    });
    expect(box).not.toBeNull();
    const label = screen.getByText("Weekly summary");
    const description = screen.getByText("One email on Mondays");
    expect(label.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("hint keeps a caller's aria-describedby, and without one the box has none", () => {
    const { unmount } = render(
      <>
        <span id="other">Also this</span>
        <Checkbox label="L" hint="D" aria-describedby="other" />
      </>,
    );
    expect(screen.getByRole("checkbox", { description: "Also this D" })).not.toBeNull();
    unmount();
    render(<Checkbox label="L" />);
    expect(screen.getByRole("checkbox", { name: "L" }).hasAttribute("aria-describedby")).toBe(
      false,
    );
  });
});
