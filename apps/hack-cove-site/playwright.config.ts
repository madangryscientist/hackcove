import { defineConfig, devices } from "@playwright/test";

const port = 4322;

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.spec.ts",
  forbidOnly: !!process.env["CI"],
  retries: 0, // a flaky test is a bug to fix, never retried
  reporter: process.env["CI"] ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "retain-on-failure" },
  // Chromium only. A spec named `*.phone.spec.ts` is about the phone layout and runs on the phone
  // project alone; the rest run on desktop, and a spec that matters on both is listed in both.
  // The phone keeps the iPhone 15's touch and device scale at 390x844, the width the visual check's
  // phone shots use.
  projects: [
    { name: "desktop", testIgnore: "*.phone.spec.ts", use: { ...devices["Desktop Chrome"] } },
    {
      name: "phone",
      testMatch: ["*.phone.spec.ts", "site-search.spec.ts"],
      use: {
        ...devices["iPhone 15"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  // The `e2e` moon task builds the site first; this only serves `dist/`. Storybook's static server
  // is used because `astro preview` leaves its server running when Playwright stops it.
  webServer: {
    command: "bun ../storybook/e2e/serve.ts",
    url: `http://127.0.0.1:${port}/ui/`,
    env: { PORT: String(port), STATIC_DIR: `${import.meta.dirname}/dist` },
    reuseExistingServer: false,
  },
});
