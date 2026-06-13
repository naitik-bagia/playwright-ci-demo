import { defineConfig } from "@playwright/test";

/**
 * API Service Playwright Configuration
 *
 * Uses Playwright's APIRequestContext for REST API testing.
 * Targets: https://jsonplaceholder.typicode.com (free public REST API)
 *
 * No browser projects are defined here — all tests run headlessly
 * via APIRequestContext which is significantly faster.
 */
export default defineConfig({
  testDir: "./pw-tests/tests",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  timeout: 15_000,

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
    baseURL: "https://jsonplaceholder.typicode.com",
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },
});
