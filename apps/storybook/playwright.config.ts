import { defineConfig, devices } from "@playwright/test";

const port = 6007;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.spec.ts",
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  // Every spec runs in all three engines (HC-174: Chromium, Firefox, WebKit). The PixelSlash visual
  // check stays Chromium-only. A spec that cannot run in one engine skips with a scoped,
  // commented `test.skip(browserName === "...", reason)`, never a blanket skip.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  // The `e2e` moon task builds Storybook first; this only serves the result.
  webServer: {
    command: "bun e2e/serve.ts",
    url: `http://127.0.0.1:${port}/iframe.html`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
  },
});
