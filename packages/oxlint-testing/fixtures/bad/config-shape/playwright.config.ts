import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  retries: process.env.CI ? 2 : 0, // expect: ui-testing/config-shape
  use: { trace: "on-first-retry" }, // expect: ui-testing/config-shape
  webServer: {
    command: "bun run preview",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI, // expect: ui-testing/config-shape
  },
});
