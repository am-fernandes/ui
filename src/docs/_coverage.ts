/**
 * AUTO-GENERATED — do not edit by hand.
 * Run `bun run sync:coverage` to refresh.
 *
 * Source: coverage/coverage-summary.json (vitest + v8 provider)
 * Generated: 2026-05-19T02:06:08.559Z
 */

export interface CoverageMetric {
  total: number
  covered: number
  pct: number
}

export interface CoverageFile {
  lines: CoverageMetric
  statements: CoverageMetric
  functions: CoverageMetric
  branches: CoverageMetric
}

export interface CoverageRow {
  file: string
  group: string
  lines: number
  statements: number
  functions: number
  branches: number
}

export const COVERAGE_GENERATED_AT = "2026-05-19T02:06:08.559Z"

export const TOTAL_COVERAGE: CoverageFile = {
  lines: {
    total: 4412,
    covered: 4064,
    pct: 92.11,
  },
  statements: {
    total: 4412,
    covered: 4064,
    pct: 92.11,
  },
  functions: {
    total: 178,
    covered: 150,
    pct: 84.26,
  },
  branches: {
    total: 960,
    covered: 791,
    pct: 82.39,
  },
} as const

export const COVERAGE_ROWS: readonly CoverageRow[] = [
  {
    file: "data/card.tsx",
    group: "Data",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "data/data-table.tsx",
    group: "Data",
    lines: 93.72,
    statements: 93.72,
    functions: 81.81,
    branches: 78.82,
  },
  {
    file: "data/image.tsx",
    group: "Data",
    lines: 95.04,
    statements: 95.04,
    functions: 100,
    branches: 90.9,
  },
  {
    file: "data/scroll-area.tsx",
    group: "Data",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "data/table-styles.ts",
    group: "Data",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "data/tree.tsx",
    group: "Data",
    lines: 89.83,
    statements: 89.83,
    functions: 90.9,
    branches: 78.94,
  },
  {
    file: "data/video.tsx",
    group: "Data",
    lines: 84.16,
    statements: 84.16,
    functions: 66.66,
    branches: 73.52,
  },
  {
    file: "domain/currency-input.tsx",
    group: "Domain",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "domain/file-upload.tsx",
    group: "Domain",
    lines: 79.25,
    statements: 79.25,
    functions: 54.54,
    branches: 74.75,
  },
  {
    file: "domain/input-otp.tsx",
    group: "Domain",
    lines: 96.25,
    statements: 96.25,
    functions: 100,
    branches: 71.42,
  },
  {
    file: "domain/multi-input.tsx",
    group: "Domain",
    lines: 95.34,
    statements: 95.34,
    functions: 92.3,
    branches: 79.1,
  },
  {
    file: "domain/percentage-input.tsx",
    group: "Domain",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 55.55,
  },
  {
    file: "forms/calendar.tsx",
    group: "Forms",
    lines: 81.3,
    statements: 81.3,
    functions: 63.63,
    branches: 57.89,
  },
  {
    file: "forms/combobox.tsx",
    group: "Forms",
    lines: 99.65,
    statements: 99.65,
    functions: 100,
    branches: 88.42,
  },
  {
    file: "forms/date-input.tsx",
    group: "Forms",
    lines: 96.9,
    statements: 96.9,
    functions: 60,
    branches: 61.11,
  },
  {
    file: "forms/date-range-picker.tsx",
    group: "Forms",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 90.9,
  },
  {
    file: "forms/time-picker.tsx",
    group: "Forms",
    lines: 71.55,
    statements: 71.55,
    functions: 76.92,
    branches: 64.28,
  },
  {
    file: "hooks/use-is-mobile.ts",
    group: "Hooks",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "lib/currency.ts",
    group: "Lib",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "lib/size.ts",
    group: "Lib",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "lib/utils.ts",
    group: "Lib",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "navigation/accordion.tsx",
    group: "Navigation",
    lines: 98.52,
    statements: 98.52,
    functions: 100,
    branches: 87.5,
  },
  {
    file: "navigation/breadcrumb.tsx",
    group: "Navigation",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 89.47,
  },
  {
    file: "navigation/command-palette.tsx",
    group: "Navigation",
    lines: 97.75,
    statements: 97.75,
    functions: 100,
    branches: 76.92,
  },
  {
    file: "navigation/sidebar.tsx",
    group: "Navigation",
    lines: 75.67,
    statements: 75.67,
    functions: 60,
    branches: 72.91,
  },
  {
    file: "navigation/tabs.tsx",
    group: "Navigation",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "overlays/alert-dialog.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "overlays/alert.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 80,
  },
  {
    file: "overlays/collapsible.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 66.66,
  },
  {
    file: "overlays/dialog.tsx",
    group: "Overlays",
    lines: 94.93,
    statements: 94.93,
    functions: 50,
    branches: 92.3,
  },
  {
    file: "overlays/popover.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "overlays/progress.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "overlays/sheet.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "overlays/sonner.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "overlays/tooltip.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/avatar.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/badge.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/button.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/checkbox.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/input.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/label.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/radio-group.tsx",
    group: "Primitives",
    lines: 95.45,
    statements: 95.45,
    functions: 100,
    branches: 81.25,
  },
  {
    file: "primitives/separator.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/skeleton.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "primitives/switch.tsx",
    group: "Primitives",
    lines: 98.61,
    statements: 98.61,
    functions: 100,
    branches: 92.85,
  },
  {
    file: "primitives/textarea.tsx",
    group: "Primitives",
    lines: 97.77,
    statements: 97.77,
    functions: 100,
    branches: 71.42,
  },
  {
    file: "primitives/typography.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 66.66,
  },
] as const
