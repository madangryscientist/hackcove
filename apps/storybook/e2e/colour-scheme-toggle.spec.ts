import { expect, test } from "@playwright/test";

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

// HC-218. The toggle's name is its content: both "Switch to …" spans are always in the DOM and CSS
// keyed on the class on <html> hides the wrong one with `display:none`. So it is the engine's
// accessible-name computation that must drop `display:none` content, and this proves it in each
// engine. Storybook renders on the client, so JS cannot be blocked here: the spec puts the class on
// <html> and reads the name, which follows the class through CSS alone.
const stories = [
  { id: "actions-colourschemetoggle--default", name: "Default", light: "", dark: "dark" },
  {
    id: "actions-colourschemetoggle--custom-classes",
    name: "CustomClasses",
    light: "my-light",
    dark: "dark",
  },
];

for (const { id, name, light, dark } of stories) {
  test(`ColourSchemeToggle ${name}: the accessible name follows the class on <html>`, async ({
    page,
  }) => {
    await page.goto(story(id));
    const toggle = page.getByRole("button", { name: /^Switch to (light|dark) theme$/ });
    await expect(toggle).toHaveCount(1);

    const setScheme = (classes: string) =>
      page.evaluate((value) => {
        document.documentElement.className = value;
      }, classes);

    await setScheme(light);
    await expect(toggle).toHaveAccessibleName("Switch to dark theme");

    await setScheme(dark);
    await expect(toggle).toHaveAccessibleName("Switch to light theme");

    await setScheme(light);
    await expect(toggle).toHaveAccessibleName("Switch to dark theme");
  });
}
