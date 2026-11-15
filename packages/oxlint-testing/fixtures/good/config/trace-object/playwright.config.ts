import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  retries: 0,
  use: { trace: { mode: "retain-on-failure", sources: false } },
});
