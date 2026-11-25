import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

/**
 * Contract of the dark theme on any ancestor (`<section class="dark">`), as
 * the docs promise, and not only on <html>.
 *
 * A custom property is computed where it is declared and inherited already
 * resolved. `--color-border: var(--border)` declared on :root holds the light
 * border everywhere below it: a dark section that redeclares `--border` does
 * not change it. The base styles read `var(--color-border)` and
 * `var(--color-background)`, so inside a dark panel dividers, table rules and
 * the Schedule's hour grid kept the light colour, at about 1:1.
 *
 * The rules: nothing reads `var(--color-*)` (the utilities of `@theme
 * inline` use the token itself), the `--color-*` aliases are declared again
 * in `.dark` for the app's own CSS, and every alias on :root of a token that
 * `.dark` changes is declared again in `.dark`.
 */

const root = path.join(__dirname, "..", "..")
const css = readFileSync(path.join(root, "src/styles/tokens.css"), "utf8")

type Block = { selector: string; body: string }

/** The top-level blocks of the stylesheet, comments removed. */
function blocks(source: string): Block[] {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "")
  const found: Block[] = []
  let depth = 0
  let start = 0
  let selector = ""
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === "{") {
      if (depth === 0) {
        selector = text.slice(start, i).trim().split(";").at(-1)?.trim() ?? ""
        start = i + 1
      }
      depth++
    } else if (char === "}") {
      depth--
      if (depth === 0) {
        found.push({ selector, body: text.slice(start, i) })
        start = i + 1
      }
    }
  }
  return found
}

const declarations = (body: string) =>
  new Map<string, string>(
    [...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [
      m[1] ?? "",
      m[2]?.trim() ?? "",
    ]),
  )

const all = blocks(css)
const rootDecls = declarations(
  all
    .filter((b) => b.selector === ":root")
    .map((b) => b.body)
    .join("\n"),
)
const darkDecls = declarations(
  all
    .filter((b) => b.selector === ".dark")
    .map((b) => b.body)
    .join("\n"),
)
const inlineTheme = declarations(
  all
    .filter((b) => b.selector === "@theme inline")
    .map((b) => b.body)
    .join("\n"),
)
const plainTheme = declarations(
  all
    .filter((b) => b.selector === "@theme")
    .map((b) => b.body)
    .join("\n"),
)

const refs = (value: string) => [...value.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1] ?? "")

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const file = path.join(dir, name)
    if (statSync(file).isDirectory()) return name === "docs" ? [] : sourceFiles(file)
    return /\.(tsx?|css)$/.test(name) && !/\.(test|stories)\.tsx?$/.test(name) ? [file] : []
  })
}

describe("dark theme on any ancestor", () => {
  it("the library never reads a --color-* alias (it holds the value of :root)", () => {
    const offenders = sourceFiles(path.join(root, "src")).flatMap((file) => {
      const text = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
      return text
        .split("\n")
        .map((line, index) => ({
          line: line.trim(),
          at: `${path.relative(root, file)}:${index + 1}`,
        }))
        .filter(({ line }) => /var\(--color-|\(--color-[a-z0-9-]+\)/.test(line))
        .filter(({ line }) => !/^--color-[a-z0-9-]+\s*:/.test(line))
        .map(({ at, line }) => `${at}  ${line}`)
    })
    expect(offenders).toEqual([])
  })

  it("every --color-* alias of @theme inline is declared again in .dark", () => {
    const aliases = [...inlineTheme].filter(([name]) => name.startsWith("--color-"))
    expect(aliases.length).toBeGreaterThan(40)
    const missing = aliases
      .filter(([name, value]) => darkDecls.get(name) !== value)
      .map(([name, value]) => `${name}: ${value}`)
    expect(missing).toEqual([])
  })

  it("every alias on :root of a token .dark changes is declared again in .dark", () => {
    const changes = (name: string) => darkDecls.has(name)
    const stuck = [...rootDecls, ...plainTheme]
      .filter(([name, value]) => refs(value).some(changes) && !darkDecls.has(name))
      .map(([name, value]) => `${name}: ${value}`)
    expect(stuck).toEqual([])
  })

  it("the rules of the base layer read the tokens themselves", () => {
    const base = all.find((b) => b.selector === "@layer base")?.body ?? ""
    expect(base).toContain("border-color: var(--border)")
    // The text of a dark part is the dark one, not the light one of <body>.
    expect(base).toMatch(/\.dark\s*\{\s*color:\s*var\(--foreground\)/)
    expect(base).not.toMatch(/var\(--color-/)
  })
})
