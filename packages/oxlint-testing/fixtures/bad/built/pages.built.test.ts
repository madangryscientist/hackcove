import { expect, test } from "vitest";

// A check of built HTML may branch and walk the parsed page, but still may not assert look.
test("the built page", () => {
  const page = new DOMParser().parseFromString("<a class='x'></a>", "text/html");
  expect(page.querySelector("a")).toHaveClass("x"); // expect: vitest/no-restricted-matchers
  expect(page.querySelector("a")).toHaveAttribute("class", "x"); // expect: ui-testing/no-style-assertions
  setTimeout(() => undefined, 10); // expect: no-restricted-globals
});
