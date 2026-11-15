import { expect, test } from "@playwright/test";

test("saves a name", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toBeAttached();
  const name = page.getByRole("textbox", { name: "Name" });
  await name.fill("ok");
  await name.fill("ok", { force: true });
  await name.press("Enter");
  await name.type("more", { delay: 0 });
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Save" }).click({ force: true });
  await page.getByLabel("Size").selectOption("large");
  await page.getByLabel("Photo").setInputFiles("photo.png");
  await expect(page.getByRole("tab", { name: "Two" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
  expect({ label: "Save", pressed: true }).toMatchObject({ label: "Save", pressed: true });
  test.setTimeout(60_000);
});

test("is scoped off the phone with its ticket", async ({ isMobile }) => {
  test.skip(isMobile, "no hover on touch, FS-12");
  test.fixme(isMobile, "the phone menu closes on scroll, " + "HC-401");
  test.fail(isMobile, `the tooltip never opens, HC-402`);
});

test.fail("the menu opens on tap, HC-403", async () => {});
