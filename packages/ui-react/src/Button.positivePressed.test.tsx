// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Button } from "./Button.js";
import { render, screen } from "./render.harness.js";

describe("Button pressed", () => {
  it("is not a toggle until `pressed` is given: no aria-pressed", () => {
    render(<Button variant="outline">X</Button>);
    expect(screen.getByRole("button", { name: "X" }).hasAttribute("aria-pressed")).toBe(false);
  });

  it("a toggle reports pressed true and false", () => {
    render(
      <>
        <Button variant="outline" pressed>
          On
        </Button>
        <Button variant="outline" pressed={false}>
          Off
        </Button>
      </>,
    );
    expect(screen.getByRole("button", { name: "On", pressed: true })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Off", pressed: false })).not.toBeNull();
  });

  it("a blocked or busy toggle is blocked and keeps its pressed state", () => {
    render(
      <>
        <Button variant="outline" pressed disabledReason="No">
          Blocked
        </Button>
        <Button variant="outline" pressed busy>
          Busy
        </Button>
      </>,
    );
    expect(
      screen.getByRole("button", { name: "Blocked", pressed: true }).getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen.getByRole("button", { name: "Busy", pressed: true }).hasAttribute("disabled"),
    ).toBe(true);
  });
});
