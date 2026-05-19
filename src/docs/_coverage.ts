/**
 * AUTO-GENERATED — do not edit by hand.
 * Run `bun run sync:coverage` to refresh.
 *
 * Source: coverage/coverage-summary.json (vitest + v8 provider)
 * Generated: 2026-05-19T03:22:35.949Z
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

export const COVERAGE_GENERATED_AT = "2026-05-19T03:22:35.949Z"

export const TOTAL_COVERAGE: CoverageFile = {
  lines: {
    total: 4412,
    covered: 4335,
    pct: 98.25,
  },
  statements: {
    total: 4412,
    covered: 4335,
    pct: 98.25,
  },
  functions: {
    total: 178,
    covered: 172,
    pct: 96.62,
  },
  branches: {
    total: 1160,
    covered: 1086,
    pct: 93.62,
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
    lines: 99.33,
    statements: 99.33,
    functions: 90.9,
    branches: 92.15,
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
    lines: 98.03,
    statements: 98.03,
    functions: 90.9,
    branches: 91.17,
  },
  {
    file: "data/video.tsx",
    group: "Data",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 90.24,
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
    lines: 87.65,
    statements: 87.65,
    functions: 81.81,
    branches: 92.53,
  },
  {
    file: "domain/input-otp.tsx",
    group: "Domain",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "domain/multi-input.tsx",
    group: "Domain",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 96,
  },
  {
    file: "domain/percentage-input.tsx",
    group: "Domain",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "forms/calendar.tsx",
    group: "Forms",
    lines: 99.53,
    statements: 99.53,
    functions: 100,
    branches: 92.15,
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
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 92.3,
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
    lines: 98.27,
    statements: 98.27,
    functions: 100,
    branches: 98.55,
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
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
  {
    file: "navigation/sidebar.tsx",
    group: "Navigation",
    lines: 99.54,
    statements: 99.54,
    functions: 100,
    branches: 91.25,
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
    branches: 100,
  },
  {
    file: "overlays/dialog.tsx",
    group: "Overlays",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
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
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 95.83,
  },
  {
    file: "primitives/typography.tsx",
    group: "Primitives",
    lines: 100,
    statements: 100,
    functions: 100,
    branches: 100,
  },
] as const
