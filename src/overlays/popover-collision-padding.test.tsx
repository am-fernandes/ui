import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const contentProps = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock("@radix-ui/react-popover", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@radix-ui/react-popover")>()
  return {
    ...actual,
    Content: (props: Record<string, unknown>) => {
      contentProps.current = props
      return null
    },
  }
})

import { Popover } from "./popover"

describe("Popover collisionPadding", () => {
  beforeEach(() => {
    contentProps.current = {}
  })

  it("does not change the collision padding by default", () => {
    render(
      <Popover open>
        <p>c</p>
      </Popover>,
    )
    expect(contentProps.current.collisionPadding).toBeUndefined()
  })

  it("forwards `collisionPadding` to the content", () => {
    render(
      <Popover open collisionPadding={16}>
        <p>c</p>
      </Popover>,
    )
    expect(contentProps.current.collisionPadding).toBe(16)
  })
})
