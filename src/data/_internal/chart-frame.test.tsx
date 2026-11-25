import { act, render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { useWebFontsLoaded } from "./chart-frame"

// jsdom has no FontFaceSet: a stand-in with the parts the hook reads.
function installFonts(status: "loading" | "loaded") {
  let finish = () => {}
  const ready = new Promise<void>((resolve) => {
    finish = resolve
  })
  const fonts = Object.assign(new EventTarget(), { status, ready })
  Object.defineProperty(document, "fonts", { configurable: true, value: fonts })
  return { fonts, finish }
}

afterEach(() => {
  Reflect.deleteProperty(document, "fonts")
})

function setup() {
  const counter = { renders: 0 }
  function Probe() {
    useWebFontsLoaded()
    counter.renders++
    return null
  }
  return { counter, ...render(<Probe />) }
}

describe("useWebFontsLoaded", () => {
  it("renders again each time a web font finishes loading, and stops on unmount", () => {
    const { fonts } = installFonts("loaded")
    const { counter, unmount } = setup()
    expect(counter.renders).toBe(1)
    act(() => {
      fonts.dispatchEvent(new Event("loadingdone"))
    })
    expect(counter.renders).toBe(2)
    unmount()
    fonts.dispatchEvent(new Event("loadingdone"))
    expect(counter.renders).toBe(2)
  })

  it("renders again when fonts already loading at mount are ready", async () => {
    const { finish } = installFonts("loading")
    const { counter } = setup()
    await act(async () => {
      finish()
      await Promise.resolve()
    })
    expect(counter.renders).toBe(2)
  })

  it("does nothing without a FontFaceSet", () => {
    const { counter } = setup()
    expect(counter.renders).toBe(1)
  })
})
