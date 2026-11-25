// @vitest-environment node
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { useIsMobile } from "./use-is-mobile"

function Probe() {
  return <span>{useIsMobile() ? "mobile" : "desktop"}</span>
}

describe("useIsMobile (server render)", () => {
  it("is false on the server, without touching window", () => {
    expect(typeof window).toBe("undefined")
    expect(renderToString(<Probe />)).toContain("desktop")
  })
})
