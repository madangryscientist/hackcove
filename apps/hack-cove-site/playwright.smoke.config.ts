import { defineConfig, devices } from "@playwright/test";

// The post-deploy smoke suite reads a live host, so it names the host explicitly and never falls back
// to a default: an unset variable would quietly test nothing useful.
const baseURL = process.env["SMOKE_BASE_URL"];
if (!baseURL) {
  throw new Error(
    "SMOKE_BASE_URL is not set. Run it as: SMOKE_BASE_URL=https://hack-cove.com bunx moon run hack-cove-site:smoke",
  );
}

// No webServer: the suite checks a deployed site (or a local `dist` served by the caller). Requests
// only, so no browser is opened; the one project keeps the engine Chromium, as in every other config.
export default defineConfig({
  testDir: "smoke",
  testMatch: "*.spec.ts",
  reporter: "list",
  // Its own folder: a smoke run empties its output directory, and the e2e run keeps its traces in test-results/.
  outputDir: "test-results/smoke",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
