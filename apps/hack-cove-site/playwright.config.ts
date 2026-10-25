import { defineConfig } from "@playwright/test";

const port = 4322;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.spec.ts",
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}` },
  // The `e2e` Nx target builds the site first; this only serves `dist/`. Storybook's static server
  // is used because `astro preview` leaves its server running when Playwright stops it.
  webServer: {
    command: "bun ../storybook/e2e/serve.ts",
    url: `http://127.0.0.1:${port}/ui/`,
    env: { PORT: String(port), STATIC_DIR: `${import.meta.dirname}/dist` },
    reuseExistingServer: false,
  },
});
