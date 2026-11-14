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

export const pages = [
  { path: "/ui/", heading: "Getting started" },
  ...componentPages.map(({ slug, name }) => ({ path: `/ui/${slug}/`, heading: name })),
];

/** The header's light/dark toggle: one button, named for the scheme it switches to. */
export const toggle = (page: Page) =>
  page.getByRole("banner").getByRole("button", { name: /^Switch to (light|dark) theme$/ });

/** The scope classes on `<html>`, which is where the toggle puts the scheme's. */
export const scopeClasses = (page: Page) =>
  page
    .locator("html")
    .evaluate((el, all) => all.filter((scope) => el.classList.contains(scope)), scopes);

/**
 * The toggle's own island is hydrated once Astro drops `ssr` from it. Another island on the page can
 * be hydrated first, so this waits for the toggle's, not the first one's.
 */
export const hydrated = (page: Page) =>
  page.locator('astro-island[component-export="ColourSchemeToggle"]:not([ssr])').waitFor();

/** Puts `<html>` in one theme's scope and in no other's. */
export const useScope = (page: Page, scope: string) =>
  page.locator("html").evaluate(
    (el, { all, one }) => {
      el.classList.remove(...all);
      el.classList.add(one);
    },
    { all: scopes, one: scope },
  );

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
    await expect.poll(() => classScheme(page), { timeout: 1_000 }).toBe(scheme);
  }).toPass();
  await expect(toggle(page)).toHaveAccessibleName(labelFor(scheme));
}

/** Every page the header is on: the three sections' pages and every component page. */
export const everyPage = ["/", "/contracting/", "/pixelslash/", ...pages.map(({ path }) => path)];
