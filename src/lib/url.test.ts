import { describe, expect, it } from "vitest"

import {
  DEFAULT_ALLOWED_LINK_PROTOCOLS,
  DEFAULT_ALLOWED_RESOURCE_PROTOCOLS,
  isAllowedUrl,
} from "./url"

describe("isAllowedUrl — resource defaults (http/https)", () => {
  const allowed = DEFAULT_ALLOWED_RESOURCE_PROTOCOLS

  it("accepts https URLs", () => {
    expect(isAllowedUrl("https://example.com/image.png", allowed)).toBe(true)
  })

  it("accepts http URLs", () => {
    expect(isAllowedUrl("http://example.com/image.png", allowed)).toBe(true)
  })

  it("accepts relative URLs (resolved against the page origin)", () => {
    expect(isAllowedUrl("/avatar.png", allowed)).toBe(true)
    expect(isAllowedUrl("./avatar.png", allowed)).toBe(true)
    expect(isAllowedUrl("../avatar.png", allowed)).toBe(true)
  })

  it("rejects javascript: pseudo URLs", () => {
    expect(isAllowedUrl("javascript:alert(1)", allowed)).toBe(false)
    expect(isAllowedUrl("JAVASCRIPT:alert(1)", allowed)).toBe(false)
    expect(isAllowedUrl("Java\nScript:alert(1)", allowed)).toBe(false)
  })

  it("rejects javascript: even with leading whitespace", () => {
    expect(isAllowedUrl("  javascript:alert(1)", allowed)).toBe(false)
    expect(isAllowedUrl("\tjavascript:alert(1)", allowed)).toBe(false)
    expect(isAllowedUrl(" javascript:alert(1)", allowed)).toBe(false)
  })

  it("rejects data: URIs by default", () => {
    expect(isAllowedUrl("data:image/png;base64,AAAA", allowed)).toBe(false)
  })

  it("rejects vbscript:", () => {
    expect(isAllowedUrl("vbscript:msgbox", allowed)).toBe(false)
  })

  it("rejects file:", () => {
    expect(isAllowedUrl("file:///etc/passwd", allowed)).toBe(false)
  })
})

describe("isAllowedUrl — link defaults (http/https/mailto/tel)", () => {
  const allowed = DEFAULT_ALLOWED_LINK_PROTOCOLS

  it("accepts http and https", () => {
    expect(isAllowedUrl("https://am-fernandes.com.br", allowed)).toBe(true)
    expect(isAllowedUrl("http://localhost:3000/foo", allowed)).toBe(true)
  })

  it("accepts mailto:", () => {
    expect(isAllowedUrl("mailto:contato@am-fernandes.com.br", allowed)).toBe(true)
  })

  it("accepts tel:", () => {
    expect(isAllowedUrl("tel:+5511999999999", allowed)).toBe(true)
  })

  it("accepts hash links", () => {
    expect(isAllowedUrl("#section", allowed)).toBe(true)
  })

  it("accepts relative paths", () => {
    expect(isAllowedUrl("/dashboard", allowed)).toBe(true)
  })

  it("rejects javascript:", () => {
    expect(isAllowedUrl("javascript:alert(document.cookie)", allowed)).toBe(false)
  })
})

describe("isAllowedUrl — custom allowlists", () => {
  it("accepts data: when explicitly opted in", () => {
    expect(isAllowedUrl("data:image/png;base64,AAAA", ["data:"])).toBe(true)
    expect(isAllowedUrl("data:image/png;base64,AAAA", ["http:", "https:", "data:"])).toBe(true)
  })

  it("accepts blob: when explicitly opted in", () => {
    expect(isAllowedUrl("blob:https://example.com/abc", ["blob:"])).toBe(true)
  })

  it("never accepts javascript:, even when the caller asks for it", () => {
    expect(isAllowedUrl("javascript:alert(1)", ["javascript:"])).toBe(false)
  })

  it("rejects when allowlist is empty", () => {
    expect(isAllowedUrl("https://example.com", [])).toBe(false)
  })
})

describe("isAllowedUrl — fallback when URL() throws", () => {
  // The fallback only fires when `new URL(value, base)` throws — modern
  // engines accept almost everything, so we go through it with an input
  // that parses normally and verify the result, then through an input
  // that the regex catches even without URL() participation.

  it("accepts an empty string (resolves to the base origin)", () => {
    expect(isAllowedUrl("", DEFAULT_ALLOWED_LINK_PROTOCOLS)).toBe(true)
  })

  it("still blocks javascript: through the regex short-circuit", () => {
    // The early regex check runs before URL() is ever called.
    expect(isAllowedUrl("javascript:void(0)", DEFAULT_ALLOWED_LINK_PROTOCOLS)).toBe(false)
  })
})
