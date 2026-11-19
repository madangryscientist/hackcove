// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { CopyLine } from "./CopyLine.js";
import { render, screen } from "./render.harness.js";

describe("CopyLine", () => {
  it("shows the text as code with a copy button beside it", () => {
    render(<CopyLine text="bun add @slashsuite/ui-react" />);
    expect(screen.getByText("bun add @slashsuite/ui-react").tagName).toBe("CODE");
    expect(screen.getByRole("button", { name: "Copy" })).not.toBeNull();
  });

  it("disables its copy button with disabled, and not the line around it", () => {
    // The line itself has no role or name to find it by; its test id is the pass-through one.
    render(<CopyLine text="x" disabled data-testid="line" />);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Copy" }).disabled).toBe(true);
    expect(screen.getByTestId("line").hasAttribute("disabled")).toBe(false);
  });

  it("keeps its copy button enabled by default", () => {
    render(<CopyLine text="x" />);
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Copy" }).disabled).toBe(false);
  });
});
