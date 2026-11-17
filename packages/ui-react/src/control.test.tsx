// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Checkbox } from "./Checkbox.js";
import { Input } from "./Input.js";
import { render, screen } from "./render.harness.js";

// Size and width are look (the visual check shoots every control at each); that neither reaches
// the DOM as the native attribute is noLeak.test.tsx's. What is left is behaviour.

describe("native size and width are replaced", () => {
  it("passes the rest through", () => {
    render(<Input size="sm" width="xs" placeholder="Qty" maxLength={4} aria-label="Qty" />);
    const field = screen.getByRole<HTMLInputElement>("textbox", { name: "Qty" });
    expect(field.placeholder).toBe("Qty");
    expect(field.maxLength).toBe(4);
  });
});

describe("Checkbox with no label", () => {
  it("renders a bare box named by aria-label", () => {
    render(<Checkbox aria-label="Select row" size="sm" />);
    expect(screen.getByRole("checkbox", { name: "Select row" })).toBeInstanceOf(HTMLInputElement);
  });
});
