import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: { trace: { mode: "on-first-retry" } }, // expect: ui-testing/config-shape
});
