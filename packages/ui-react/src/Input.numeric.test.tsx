// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { Field } from "./Field.js";
import { Input } from "./Input.js";
import { render, screen, user } from "./render.harness.js";

describe("Input numeric", () => {
  it("is a text field with the decimal keypad, not a spinbutton", () => {
    render(<Input numeric aria-label="Amount" />);
    const amount = screen.getByRole("textbox", { name: "Amount" });
    expect(amount.getAttribute("inputmode")).toBe("decimal");
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("keeps the caller's inputMode", () => {
    render(<Input numeric inputMode="numeric" aria-label="Quantity" />);
    expect(screen.getByRole("textbox", { name: "Quantity" }).getAttribute("inputmode")).toBe(
      "numeric",
    );
  });

  it("keeps the value exactly as typed", async () => {
    render(<Input numeric aria-label="Amount" />);
    const amount = screen.getByRole<HTMLInputElement>("textbox", { name: "Amount" });
    await user().type(amount, "1 250,50");
    expect(amount.value).toBe("1 250,50");
  });

  it("takes its label, error and invalid state from a Field, with a prefix", () => {
    render(
      <Field label="Price" error="Enter an amount.">
        <Input prefix="R" numeric />
      </Field>,
    );
    const price = screen.getByRole("textbox", { name: "Price" });
    expect(price.getAttribute("aria-invalid")).toBe("true");
    const described = price.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(described)?.textContent).toBe("Enter an amount.");
    expect(price.getAttribute("inputmode")).toBe("decimal");
  });

  it("is ignored on a search field", () => {
    render(<Input numeric type="search" aria-label="Find" />);
    expect(screen.getByRole("searchbox", { name: "Find" }).hasAttribute("inputmode")).toBe(false);
  });
});
