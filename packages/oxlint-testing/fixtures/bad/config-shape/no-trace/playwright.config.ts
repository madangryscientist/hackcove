import { defineConfig } from "@playwright/test"; // expect: ui-testing/config-shape

export default defineConfig({ testDir: "e2e", retries: 0 });
