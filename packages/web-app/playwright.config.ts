import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Web App Playwright Configuration
 *
 * Targets: https://demo.playwright.dev/todomvc
 * Tests are tagged with @smoke (fast path checks) or left untagged (regression suite).
 *
 * JUnit reporter output is consumed by the CI pipeline and uploaded to TestRail via trcli.
 */
export default defineConfig({
  testDir: "./pw-tests/tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,

  reporter: [
    ["list"],
    [
      "junit",
      {
        outputFile: "./pw-tests/reports/junit-report.xml",
      },
    ],
    ["html", { outputFolder: "./playwright-report", open: "never" }],
  ],

  use: {
    baseURL: "https://demo.playwright.dev/todomvc",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
  ],
});
