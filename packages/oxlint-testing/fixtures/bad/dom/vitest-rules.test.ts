import { expect, test } from "vitest";

test.only("focused", () => {}); // expect: vitest/no-focused-tests
test.skip("skipped", () => {}); // expect: vitest/no-disabled-tests

test("branches", () => {
  const value = Math.random();
  if (value > 0.5) {
    // expect: vitest/no-conditional-in-test
    expect(value).toBeGreaterThan(0.5);
  }
});
