import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

test("a pressed toggle says so", async () => {
  const onChange = vi.fn();
  render(
    <button type="button" aria-pressed="true" onClick={onChange}>
      Bold
    </button>,
  );
  const toggle = screen.getByRole("button", { name: "Bold" });
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  await userEvent.click(toggle);
  expect(onChange).toHaveBeenCalledOnce();
  expect(toggle).toHaveProperty("type", "button");
});
