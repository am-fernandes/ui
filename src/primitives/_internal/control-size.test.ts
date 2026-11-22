import { describe, expect, it } from "vitest"

import {
  type ControlSize,
  controlHeight,
  controlMinHeight,
  controlPaddingX,
  controlSquare,
} from "./control-size"
import { fieldTriggerClass, fieldTriggerSizeClass } from "./field-shell"

const sizes: ControlSize[] = ["sm", "md", "lg"]

describe("control-size", () => {
  it("has one class per size in every map", () => {
    for (const size of sizes) {
      expect(controlHeight[size]).toBe(`h-control-${size}`)
      expect(controlMinHeight[size]).toBe(`min-h-control-${size}`)
      expect(controlSquare[size]).toBe(`size-control-${size}`)
      expect(controlPaddingX[size]).toMatch(/^px-/)
    }
  })

  it("gives the field trigger the height of its size and no vertical padding", () => {
    for (const size of sizes) {
      const classes = fieldTriggerSizeClass(size).split(" ")
      expect(classes).toContain(controlHeight[size])
      expect(classes).toContain(controlPaddingX[size])
      expect(classes.some((c) => /^py-/.test(c))).toBe(false)
    }
  })

  it("keeps fieldTriggerClass as the md trigger", () => {
    expect(fieldTriggerClass).toBe(fieldTriggerSizeClass("md"))
    expect(fieldTriggerSizeClass()).toBe(fieldTriggerSizeClass("md"))
  })
})
