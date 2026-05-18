import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for E2E tests against the running Storybook.
 *
 * Test layers:
 *   - `tests/e2e/`        — dedicated specs (focus traps, drag-and-drop, browser-only flows)
 *   - `@storybook/test-runner` (separate config) — smoke-tests every story
 *
 * Run with:
 *   bun run test:e2e             # CI mode (auto-starts Storybook)
 *   bun run test:e2e:headed      # see browser
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:6006",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "bun run storybook -- --ci --quiet --port 6006",
    url: "http://localhost:6006",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
})
