import { expect, test } from "vitest";
import config from "./playwright.config.js";

// Browser tests run in Chromium and nothing else (as apps/storybook/playwright.config.test.ts
// checks there). A project's engine is its `browserName`, else its device's
// `defaultBrowserType`, else Playwright's default, Chromium: the phone project sets `browserName` over its WebKit device.
const engines = [
  config.use,
  ...(config.projects ?? []).map((p) => ({ ...config.use, ...p.use })),
].map((use) => use?.browserName ?? use?.defaultBrowserType ?? "chromium");

test("every site e2e project runs in Chromium", () => {
  expect(engines).toEqual(engines.map(() => "chromium"));
});
