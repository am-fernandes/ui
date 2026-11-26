import { describe, expect, it } from "vitest"

import { cn } from "./utils"

describe("cn", () => {
  it("lets a later radius replace a component's radius level", () => {
    expect(cn("rounded-element", "rounded-none")).toBe("rounded-none")
    expect(cn("rounded-inner", "rounded-container")).toBe("rounded-container")
  })

  it("lets a later height replace a component's control height", () => {
    expect(cn("h-control-md", "h-8")).toBe("h-8")
    expect(cn("h-control-sm", "h-control-lg")).toBe("h-control-lg")
    expect(cn("min-h-control-md", "min-h-20")).toBe("min-h-20")
    expect(cn("size-control-md", "size-9")).toBe("size-9")
  })

  it("keeps a control height next to unrelated classes", () => {
    expect(cn("h-control-md px-3", "text-sm")).toBe("h-control-md px-3 text-sm")
  })
})
