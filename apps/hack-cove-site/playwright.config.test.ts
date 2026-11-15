import { expect, test } from "vitest";
import config from "./playwright.config.js";

// Browser tests run in Chromium and nothing else (as apps/storybook/playwright.config.test.ts
// checks there). A project's engine is its `browserName`, else its device's
// `defaultBrowserType`, else Playwright's default, Chromium; the site sets no projects.
test("every site e2e project runs in Chromium", () => {
  const engines = [
    config.use,
    ...(config.projects ?? []).map((p) => ({ ...config.use, ...p.use })),
  ].map((use) => use?.browserName ?? use?.defaultBrowserType ?? "chromium");
  expect(engines).toEqual(engines.map(() => "chromium"));
});
