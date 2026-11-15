import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

test("sleeps and reads styles", async () => {
  render(<button type="button">Save</button>);
  const button = screen.getByRole("button");
  await new Promise((done) => setTimeout(done, 100)); // expect: no-restricted-globals
  await Bun.sleep(100); // expect: no-restricted-properties
  expect(button.className).toBe("primary"); // expect: no-restricted-properties
  expect(button.classList.contains("primary")).toBe(true); // expect: no-restricted-properties
  expect(getComputedStyle(button).color).toBe("red"); // expect: no-restricted-globals
  expect(window.getComputedStyle(button).color).toBe("red"); // expect: no-restricted-properties
  expect(button).toHaveClass("primary"); // expect: vitest/no-restricted-matchers
  expect(button).toHaveStyle({ color: "red" }); // expect: vitest/no-restricted-matchers
});
