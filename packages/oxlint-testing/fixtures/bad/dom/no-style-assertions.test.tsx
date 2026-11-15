import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("asserts look", () => {
  render(<button type="button">Save</button>);
  const button = screen.getByRole("button");
  expect(button).toHaveAttribute("class", "primary"); // expect: ui-testing/no-style-assertions
  expect(button.getAttribute("style")).toBe("color: red"); // expect: ui-testing/no-style-assertions
  expect(button).toHaveProperty("className", "primary"); // expect: ui-testing/no-style-assertions
  expect({ label: "Save" }).toEqual({ label: "Save", style: {} }); // expect: ui-testing/no-style-assertions
});
