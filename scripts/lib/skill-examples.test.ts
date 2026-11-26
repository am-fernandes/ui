import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { describe, expect, it } from "vitest"

import { checkBlocks, extractBlocks } from "./skill-examples"

const root = join(__dirname, "..", "..")
const skillDir = join(root, "skills/designing-with-amfernandesinc-ui")

/** The guides: every .md of the skill except the generated API reference. */
function guides(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return name === "api" ? [] : guides(full)
    return name.endsWith(".md") ? [full] : []
  })
}

describe("extractBlocks", () => {
  it("takes ts and tsx fences, keeps their line, and skips the ones marked wrong or unchecked", () => {
    const md = [
      "# t",
      "```tsx",
      'import { Button } from "@amfernandesinc/ui"',
      "```",
      "```css",
      "@import x;",
      "```",
      "```tsx",
      "// ❌ errado",
      "<Card><CardHeader/></Card>",
      "```",
      "  ```ts",
      "  const a = 1",
      "  ```",
      "```tsx",
      "// fora da verificação: usa next/link",
      'import Link from "next/link"',
      "```",
    ].join("\n")
    const blocks = extractBlocks(md, "x.md")
    expect(blocks.map((b) => [b.line, b.lang, b.code])).toEqual([
      [2, "tsx", 'import { Button } from "@amfernandesinc/ui"'],
      [12, "ts", "const a = 1"],
    ])
  })
})

describe("skill examples", () => {
  it("compile against the library (a wrong example is a wrong instruction)", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
    const blocks = guides(skillDir).flatMap((file) =>
      extractBlocks(readFileSync(file, "utf8"), relative(root, file)),
    )
    expect(blocks.length).toBeGreaterThan(40)
    expect(checkBlocks(root, blocks, pkg.exports)).toEqual([])
  }, 120_000)
})
