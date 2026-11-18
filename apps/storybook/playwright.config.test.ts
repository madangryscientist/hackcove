import { devices, type PlaywrightTestConfig } from "@playwright/test";
import { expect, test } from "vitest";
import config from "./playwright.config.js";

/**
 * Browser tests run in Chromium and nothing else. A project's engine is its `browserName`, else its
 * device's `defaultBrowserType`, else Playwright's default, Chromium. So a phone project keeps its
 * device and sets `browserName: "chromium"` beside it.
 */
const engine = (use: PlaywrightTestConfig["use"]) =>
  use?.browserName ?? use?.defaultBrowserType ?? "chromium";

/** Every project's `use`, each over the config's own, as Playwright merges them. */
const projectUses = (config.projects ?? []).map((p) => ({ ...config.use, ...p.use }));

test("every Storybook e2e project runs in Chromium", () => {
  const engines = [config.use, ...projectUses].map(engine);
  expect(engines).toEqual(engines.map(() => "chromium"));
});

test("the check fails a Firefox device and passes a phone device on Chromium", () => {
  expect(engine(devices["Desktop Firefox"])).toBe("firefox");
  expect(engine({ ...devices["iPhone 15"], browserName: "chromium" })).toBe("chromium");
});
