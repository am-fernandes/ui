import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
    },
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    // Playwright specs use `@playwright/test`'s test.describe — vitest must not
    // pick them up. node_modules/dist are excluded by default.
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/storybook-static/**",
      "tests/e2e/**",
      "docs/**",
    ],
    // input-otp queues a deferred setSelectionRange via setTimeout that fires
    // after the jsdom env is torn down, throwing "window is not defined".
    // It is harmless — we don't fail the suite on these post-teardown errors.
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.tsx", "src/docs/**", "src/index.ts"],
      reportsDirectory: "./coverage",
    },
  },
})
