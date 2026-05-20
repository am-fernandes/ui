import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for E2E tests against the running Storybook.
 *
 * Test layers:
 *   - `tests/e2e/`        — dedicated specs (focus traps, drag-and-drop, browser-only flows)
 *   - `@storybook/test-runner` (separate config) — smoke-tests every story
 *
 * Projects:
 *   - `chromium`         — Desktop Chrome; runs every spec EXCEPT the viewport-
 *                          specific ones (mobile/tablet).
 *   - `mobile-chromium`  — Pixel 5 (touch UA). Runs ONLY `mobile.spec.ts` —
 *                          desktop primitive/overlay tests are not scoped here
 *                          because touch UA changes hover/pointer semantics
 *                          (Tooltip no-hover, Popover trigger resolution, etc.).
 *   - `tablet-chromium`  — iPad (gen 7) viewport, Chromium engine. Runs only
 *                          `tablet.spec.ts`.
 *
 * Run with:
 *   bun run test:e2e             # CI mode (auto-starts Storybook); all projects
 *   bun run test:e2e:headed      # see browser
 *   bun run test:e2e:mobile      # mobile project only
 *   bun run test:e2e:tablet      # tablet project only
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  expect: {
    toHaveScreenshot: {
      // Generous tolerances + the system-font override in visual.spec.ts
      // are the price of running this suite without a paid service like
      // Percy / Chromatic. Chromium's sub-pixel positioning and font
      // hinting on Linux jitter slightly between runs even with KILL_ANIMATIONS
      // applied. The threshold is high enough to absorb that jitter but
      // still surfaces real structural drift (radius, density, focus rings,
      // contrast, layout shifts). When a baseline genuinely needs to be
      // updated, run `bun run test:visual:update` locally.
      // 0.02 = 2% pixel ratio. Scales with screenshot dimensions so the
      // tolerance stays sensible for both tiny inputs and large cards.
      // Locally-generated baselines and CI's Linux runner share the same
      // distro family but differ slightly in font hinting / sub-pixel
      // positioning, producing consistent ~1% diffs on text-heavy stories.
      maxDiffPixelRatio: 0.02,
      threshold: 0.5,
    },
  },
  use: {
    baseURL: "http://localhost:6006",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Desktop runs every spec EXCEPT the viewport-specific ones — those
      // assert mobile/tablet-only behaviors that would fail on desktop.
      testIgnore: /(mobile|tablet)\.spec\.ts$/,
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"] },
      // ONLY mobile.spec.ts — running desktop primitive/overlay specs here
      // surfaces touch-UA behaviors (Tooltip won't show on hover, Popover
      // trigger resolves differently, Checkbox label tap fires both pointerdown
      // and click, etc.) that are documented as accepted behaviors, not bugs.
      testMatch: /mobile\.spec\.ts$/,
    },
    {
      // iPad's default browser is webkit, but only chromium is installed in CI.
      // We keep the iPad viewport/UA/touch but force the Chromium engine.
      name: "tablet-chromium",
      use: { ...devices["iPad (gen 7)"], defaultBrowserType: "chromium" },
      testMatch: /tablet\.spec\.ts$/,
    },
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
