import { render } from "@testing-library/react"
import * as React from "react"
import { describe, expect, it, vi } from "vitest"

import { useComposedRefs } from "./compose-refs"

function Probe({ refs }: { refs: React.Ref<HTMLDivElement>[] }) {
  const ref = useComposedRefs(...refs)
  return <div ref={ref} data-testid="probe" />
}

describe("useComposedRefs", () => {
  it("hands the node to object and callback refs, and resets them on unmount", () => {
    const object = React.createRef<HTMLDivElement>()
    const callback = vi.fn()
    const { getByTestId, unmount } = render(<Probe refs={[object, callback]} />)
    const node = getByTestId("probe")
    expect(object.current).toBe(node)
    expect(callback).toHaveBeenLastCalledWith(node)
    unmount()
    expect(object.current).toBeNull()
    expect(callback).toHaveBeenLastCalledWith(null)
  })

  it("calls the cleanup a callback ref returns instead of calling it with null", () => {
    const cleanup = vi.fn()
    const withCleanup = vi.fn(() => cleanup)
    const object = React.createRef<HTMLDivElement>()
    const { unmount } = render(<Probe refs={[withCleanup, object]} />)
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
    expect(withCleanup).toHaveBeenCalledTimes(1)
    expect(object.current).toBeNull()
  })
})
