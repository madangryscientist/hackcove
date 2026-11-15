import { defineConfig, devices } from "@playwright/test";

const port = 6007;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.spec.ts",
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  // Every spec runs in Chromium and nothing else (playwright.config.test.ts fails on another engine).
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // The `e2e` moon task builds Storybook first; this only serves the result. STATIC_DIR is set here,
  // not taken from the shell, so the run always tests the build the task hashed.
  webServer: {
    command: "bun e2e/serve.ts",
    url: `http://127.0.0.1:${port}/iframe.html`,
    env: { PORT: String(port), STATIC_DIR: `${import.meta.dirname}/storybook-static` },
    reuseExistingServer: false,
  },
});
