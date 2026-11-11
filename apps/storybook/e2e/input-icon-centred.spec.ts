import { expect, test } from "@playwright/test";

// An `Input`'s leading `<Icon>` is centred vertically on the field at every size, sits at its
// size's leading inset, and is drawn at its size's box (sm 14px, md 16px, lg 20px). The icon is the
// span before the field; the field is the `<input>` itself (the control's box). The vertical centres
// agree within a pixel, so the icon never rides up on the border or sinks below the text line.
const story = "/iframe.html?id=forms-input--sizes&viewMode=story";

const LEADING = { sm: 8, md: 12, lg: 16 } as const;
const BOX = { sm: 14, md: 16, lg: 20 } as const;

for (const size of ["sm", "md", "lg"] as const) {
  test(`the ${size} Input's Icon is vertically centred on the field, at its inset and box`, async ({
    page,
  }) => {
    await page.goto(story);
    const field = page.getByLabel(`Find ${size}`);
    const icon = field.locator("xpath=preceding-sibling::span[@aria-hidden='true']");
    await expect(icon).toBeVisible();
    const f = await field.boundingBox();
    const i = await icon.boundingBox();
    if (!f || !i) throw new Error("the field or its icon has no box");
    expect(
      Math.abs(i.y + i.height / 2 - (f.y + f.height / 2)),
      "vertical centre of the icon vs the field",
    ).toBeLessThanOrEqual(1);
    expect(Math.abs(i.x - f.x - LEADING[size]), "leading inset").toBeLessThanOrEqual(1);
    expect(Math.abs(i.width - BOX[size]), "icon width").toBeLessThanOrEqual(1);
    expect(Math.abs(i.height - BOX[size]), "icon height").toBeLessThanOrEqual(1);
  });
}
