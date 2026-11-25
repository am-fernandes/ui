import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { beforeAll, describe, expect, it } from "vitest"

import { type ApiEntry, createProgram, generateApi, subpathsBySource } from "./skill-api"

const root = join(__dirname, "..", "..")
const apiDir = join(root, "skills/designing-with-amfernandesinc-ui/reference/api")

let files: Map<string, string>
let entries: ApiEntry[]

beforeAll(() => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
  ;({ files, entries } = generateApi(createProgram(root), root, subpathsBySource(pkg.exports)))
}, 120_000)

describe("skill API reference", () => {
  it("is up to date with the code (run `bun run skill:api` after changing props, JSDoc or exports)", () => {
    const onDisk = readdirSync(apiDir).filter((f) => f.endsWith(".md"))
    expect(onDisk.sort()).toEqual([...files.keys()].sort())
    for (const [name, content] of files) {
      expect(readFileSync(join(apiDir, name), "utf8"), name).toBe(content)
    }
  })

  it("covers every export of the barrel, each in one file", () => {
    const index = readFileSync(join(root, "src/index.ts"), "utf8")
    const names = new Set(entries.map((e) => e.name))
    for (const name of ["Button", "Select", "BarChart", "formatBRL", "useIsMobile", "ColumnDef"]) {
      expect(names.has(name), name).toBe(true)
      expect(index).toContain(name)
    }
    expect(entries.length).toBe(names.size)
  })

  it("documents a component's own props with type, default and requirement", () => {
    const primitives = files.get("primitives.md") ?? ""
    const button = primitives.slice(primitives.indexOf("### Button\n"))
    expect(button).toMatch(/\| `size` \| `"sm" \\\| "md" \\\| "lg"` \| `"md"` \|/)
    expect(button).toMatch(/\| `variant` \| .* \| `"default"` \|/)
    expect(button).toContain("Repassa também: atributos HTML do React")
    expect(primitives).toContain("#### `SliderRangeProps`")
    expect(primitives).toMatch(/\| `range` \| `true` \| \*\*obrigatória\*\* \|/)
  })

  it("prints the default labels and never a path of this machine", () => {
    const all = [...files.values()].join("\n")
    expect(all).toContain(
      'const defaultSelectLabels: SelectLabels = {\n  placeholder: "Selecione…",',
    )
    expect(all).not.toContain(root)
    expect(all).not.toMatch(/import\("/)
  })
})
