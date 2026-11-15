import { expect, test } from "@playwright/test";

test("asserts look", async ({ page }) => {
  const button = page.getByRole("button", { name: "Save" });
  await expect(button).toHaveAttribute("class", /primary/); // expect: ui-testing/no-style-assertions
  await expect(button).toHaveAttribute("style", "color: red"); // expect: ui-testing/no-style-assertions
  expect(await button.getAttribute("class")).toContain("primary"); // expect: ui-testing/no-style-assertions
  expect({ label: "Save" }).toMatchObject({
    label: "Save",
    className: "primary", // expect: ui-testing/no-style-assertions
  });
});
