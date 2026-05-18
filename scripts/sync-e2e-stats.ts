#!/usr/bin/env bun
/**
 * Counts E2E specs in tests/e2e/ and play functions across src/ stories.
 * Writes the result to src/docs/_e2e-stats.ts so Quality.mdx can render
 * the numbers without forcing the docs page to actually run Playwright.
 *
 * Run via `bun run sync:e2e-stats`.
 */

import { readFile, readdir, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dir, "..")
const E2E_DIR = path.join(ROOT, "tests", "e2e")
const SRC_DIR = path.join(ROOT, "src")
const OUT_PATH = path.join(ROOT, "src", "docs", "_e2e-stats.ts")

interface SpecFile {
  file: string
  tests: number
  describes: number
}

async function listSpecFiles(): Promise<SpecFile[]> {
  const entries = await readdir(E2E_DIR, { withFileTypes: true })
  const specs: SpecFile[] = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".spec.ts")) continue
    const fullPath = path.join(E2E_DIR, entry.name)
    const content = await readFile(fullPath, "utf8")
    const tests = (content.match(/\n\s*test\(/g) ?? []).length
    const describes = (content.match(/test\.describe\(/g) ?? []).length
    specs.push({ file: entry.name, tests, describes })
  }
  specs.sort((a, b) => a.file.localeCompare(b.file))
  return specs
}

async function walkStories(dir: string): Promise<string[]> {
  const out: string[] = []
  async function walk(d: string) {
    const entries = await readdir(d, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) {
        await walk(full)
      } else if (e.isFile() && e.name.endsWith(".stories.tsx")) {
        out.push(full)
      }
    }
  }
  await walk(dir)
  return out
}

async function countPlayFunctions(): Promise<{ files: number; total: number }> {
  const stories = await walkStories(SRC_DIR)
  let total = 0
  let files = 0
  for (const file of stories) {
    const content = await readFile(file, "utf8")
    const matches = content.match(/\bplay:\s*async\b/g)
    if (matches) {
      total += matches.length
      files += 1
    }
  }
  return { files, total }
}

const specs = await listSpecFiles()
const totalE2E = specs.reduce((sum, s) => sum + s.tests, 0)
const playStats = await countPlayFunctions()
const totalStories = (await walkStories(SRC_DIR)).length
const generatedAt = new Date().toISOString()

const out = `/**
 * AUTO-GENERATED — do not edit by hand.
 * Run \`bun run sync:e2e-stats\` to refresh.
 *
 * Source: tests/e2e/*.spec.ts + src story files
 * Generated: ${generatedAt}
 */

export interface E2ESpec {
  file: string
  tests: number
  describes: number
}

export const E2E_GENERATED_AT = "${generatedAt}"

export const E2E_SPECS: readonly E2ESpec[] = ${JSON.stringify(specs, null, 2)} as const

export const E2E_TOTAL_TESTS = ${totalE2E}

export const STORYBOOK_STATS = {
  totalStoryFiles: ${totalStories},
  playFunctionFiles: ${playStats.files},
  playFunctionsTotal: ${playStats.total},
} as const
`

await writeFile(OUT_PATH, out, "utf8")
console.log(`✓ wrote ${path.relative(ROOT, OUT_PATH)}`)
console.log(`  E2E specs: ${specs.length} files, ${totalE2E} tests`)
console.log(
  `  Stories: ${totalStories} files, ${playStats.total} play fns in ${playStats.files} files`,
)
