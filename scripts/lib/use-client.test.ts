import { describe, expect, it } from "vitest"

import { type Metafile, hasUseClient, planUseClient } from "./use-client"

describe("hasUseClient", () => {
  it("finds the directive at the top, with either quote", () => {
    expect(hasUseClient('"use client"\n\nimport x from "y"')).toBe(true)
    expect(hasUseClient("'use client';\nimport x from 'y'")).toBe(true)
  })

  it("accepts comments and blank lines before it", () => {
    expect(hasUseClient('// licença\n/* bloco */\n\n"use client"\n')).toBe(true)
  })

  it("ignores the words when they are not the directive", () => {
    expect(hasUseClient('import x from "y"\n"use client"')).toBe(false)
    expect(hasUseClient('const a = "use client"')).toBe(false)
    expect(hasUseClient("")).toBe(false)
  })
})

describe("planUseClient", () => {
  const client = new Set(["src/primitives/button.tsx", "src/data/data-table.tsx"])
  const isClient = (path: string) => client.has(path)

  const metafile: Metafile = {
    outputs: {
      "dist/chunk-BUTTON.js": { inputs: { "src/primitives/button.tsx": {} } },
      "dist/chunk-TABLE.js": {
        inputs: { "src/data/data-table.tsx": {}, "src/data/_xlsx-export.ts": {} },
      },
      "dist/chunk-UTILS.js": { inputs: { "src/lib/utils.ts": {} } },
      "dist/primitives/button.js": { inputs: {}, entryPoint: "src/primitives/button.tsx" },
      "dist/lib/utils.js": { inputs: {}, entryPoint: "src/lib/utils.ts" },
      "dist/index.js": { inputs: { "src/index.ts": {} }, entryPoint: "src/index.ts" },
      "dist/metafile-esm.json": { inputs: {} },
    },
  }

  it("marks every output that holds a client module, and only those", () => {
    const plan = planUseClient(metafile, isClient)
    expect(plan.client).toEqual(["dist/chunk-BUTTON.js", "dist/chunk-TABLE.js"])
    expect(plan.conflicts).toEqual([])
  })

  it("lets a private helper ride along with the client module that uses it", () => {
    const plan = planUseClient(metafile, isClient)
    expect(plan.client).toContain("dist/chunk-TABLE.js")
    expect(plan.conflicts).toHaveLength(0)
  })

  it("reports a public server module bundled with a client module", () => {
    const mixed: Metafile = {
      outputs: {
        "dist/chunk-MIXED.js": {
          inputs: { "src/primitives/button.tsx": {}, "src/lib/utils.ts": {} },
        },
        "dist/lib/utils.js": { inputs: {}, entryPoint: "src/lib/utils.ts" },
      },
    }
    const plan = planUseClient(mixed, isClient)
    expect(plan.conflicts).toEqual([
      {
        output: "dist/chunk-MIXED.js",
        serverEntries: ["src/lib/utils.ts"],
        clientInputs: ["src/primitives/button.tsx"],
      },
    ])
  })

  it("ignores dependencies from node_modules", () => {
    const withDeps: Metafile = {
      outputs: {
        "dist/chunk-A.js": {
          inputs: { "node_modules/clsx/dist/clsx.mjs": {}, "src/lib/utils.ts": {} },
        },
      },
    }
    expect(planUseClient(withDeps, isClient).client).toEqual([])
  })
})
