import { defineConfig } from "@playwright/test";

const port = 6007;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.spec.ts",
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  // The `e2e` Nx target builds Storybook first; this only serves the result.
  webServer: {
    command: "bun e2e/serve.ts",
    url: `http://127.0.0.1:${port}/iframe.html`,
    env: { PORT: String(port) },
    reuseExistingServer: false,
  },
});
