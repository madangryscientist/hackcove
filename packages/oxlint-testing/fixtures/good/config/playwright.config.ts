import { defineConfig, devices } from "@playwright/test";

const PORT = 4322;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: "bun run preview",
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
  },
});
