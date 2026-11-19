import { expect, test, type Page } from "@playwright/test";
import { themeFiles } from "@slashsuite/themes-shared/files";

// A button ListRow is a div with its button stretched over it, so a link in `trailing` sits above
// that button: a tap on the row runs the row's action, a tap on the link follows the link only.

const themes = themeFiles(`${import.meta.dirname}/../../../themes`);

async function open(page: Page, theme: string) {
  await page.goto(
    `/iframe.html?id=data-listrow--button-row-with-link&viewMode=story&globals=theme:${theme}`,
  );
  await page.getByRole("button", { name: "Grace" }).waitFor();
}

test("the themes folder lists at least one theme", () => {
  expect(themes.length).toBeGreaterThan(0);
});

for (const { id: theme } of themes) {
  test(`theme ${theme}: a tap on the row selects it, a tap on its trailing link follows the link only, and Tab reaches both`, async ({
    page,
  }) => {
    await open(page, theme);
    const row = page.getByRole("button", { name: "Grace" });
    const view = page.getByRole("link", { name: "View" }).first();
    const status = page.getByText(/^Selected: /);
    await expect(status).toHaveText("Selected: none");

    // The trailing link is not part of the row button's name, and no link sits inside a button.
    await expect(row).toHaveAccessibleName("Grace");
    await expect(page.getByRole("button").getByRole("link")).toHaveCount(0);
    await expect(page.getByRole("link").getByRole("button")).toHaveCount(0);

    // The label's own text is under the stretched button: a real mouse click on it is a click on
    // the row. `force` skips Playwright's own check that the text is the topmost element, since the
    // point of the test is that the row's button is.
    await page.getByText("Grace", { exact: true }).click({ force: true });
    await expect(status).toHaveText("Selected: Grace");
    await expect(row).toHaveAttribute("aria-current", "true");

    // The second row's link: it is lifted above its row's button, so the click lands on it.
    const adaView = page.getByRole("link", { name: "View" }).nth(1);
    await adaView.click();
    await expect(page).toHaveURL(/#\/shop-ada$/);
    await expect(status).toHaveText("Selected: Grace");

    // Keyboard, on a fresh page: Tab reaches the row button, then its trailing link, then the next row.
    await open(page, theme);
    await page.keyboard.press("Tab");
    await expect(row).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(view).toBeFocused();
    await page.keyboard.press("Tab");
    const ada = page.getByRole("button", { name: "Ada" });
    await expect(ada).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("Selected: Ada");
  });
}
