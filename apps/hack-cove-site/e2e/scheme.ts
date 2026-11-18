import { expect, type Page } from "@playwright/test";
import { themeFiles } from "@hackcove/themes-shared/files";
import { declaresDark, themeScope } from "@hackcove/themes-shared/scope";
import { componentPages } from "../src/content/components/index";

// One theme per CSS file in themes/. The header toggle switches between the last light theme by id
// and the one scoped `.dark` (the class ui's pre-paint script sets), told apart as the site does: a
// dark theme declares `@custom-variant dark`.
export const themeList = themeFiles(`${import.meta.dirname}/../../../themes`);
export const scopes = themeList.map((theme) => themeScope(theme.css) ?? "");
export const schemeScope = {
  light: themeScope(themeList.findLast((theme) => !declaresDark(theme.css))?.css ?? "") ?? "",
  dark: themeScope(themeList.find((theme) => themeScope(theme.css) === "dark")?.css ?? "") ?? "",
};
export type Scheme = keyof typeof schemeScope;

// The docs pages with the heading each opens on: these tests read a heading, which the other pages do not share.
export const pages = [
  { path: "/ui/", heading: "Getting started" },
  ...componentPages.map(({ slug, name }) => ({ path: `/ui/${slug}/`, heading: name })),
];

/** The header's light/dark toggle: one button, named for the scheme it switches to. */
export const toggle = (page: Page) =>
  page.getByRole("banner").getByRole("button", { name: /^Switch to (light|dark) theme$/ });

/** The scope classes on `<html>`, which is where the toggle puts the scheme's. */
export const scopeClasses = (page: Page) =>
  page.evaluate(
    (all) => all.filter((scope) => scope !== "" && document.documentElement.matches(`.${scope}`)),
    scopes,
  );

/**
 * The page's ready marker for one island: Astro drops `ssr` from an `<astro-island>` once it has
 * hydrated it. Another island on the page can be hydrated first, so this waits for the named one's.
 */
export const islandHydrated = async (page: Page, component: string) => {
  await page.waitForFunction(
    (name) =>
      document.querySelector(`astro-island[component-export="${name}"]:not([ssr])`) !== null,
    component,
  );
};

/** The header toggle's island is hydrated: a click before that does nothing. */
export const hydrated = (page: Page) => islandHydrated(page, "ColourSchemeToggle");

/** The scheme `<html>` is in now, read from its classes. */
export const classScheme = async (page: Page): Promise<Scheme> =>
  (await scopeClasses(page)).includes(schemeScope.dark) ? "dark" : "light";

/** The label the toggle shows for `scheme`: the scheme it would switch to. */
export const labelFor = (scheme: Scheme) =>
  `Switch to ${scheme === "dark" ? "light" : "dark"} theme`;

/**
 * Get the page into `scheme`. The server renders the toggle's label from `initial` (dark), so its label
 * is not evidence of the scheme before React has hydrated it, and a click before that does nothing.
 * So this reads `<html>` (set before any script runs), clicks only while it is not `scheme`, and
 * repeats until it is. A click that landed leaves the page at `scheme`, so it is never repeated.
 */
export async function setScheme(page: Page, scheme: Scheme) {
  await hydrated(page);
  await expect(async () => {
    if ((await classScheme(page)) !== scheme) await toggle(page).click();
    await expect.poll(() => classScheme(page)).toBe(scheme);
  }).toPass();
  await expect(toggle(page)).toHaveAccessibleName(labelFor(scheme));
}
