import "@testing-library/jest-dom/vitest"

// jsdom does not implement matchMedia. Stub it for components that rely on
// media-query hooks (e.g. useIsMobile -> Sidebar).
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// jsdom does not implement ResizeObserver. Stub it for cmdk/recharts/etc.
if (typeof globalThis !== "undefined" && !("ResizeObserver" in globalThis)) {
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom does not implement Element.scrollIntoView (used by cmdk).
if (
  typeof Element !== "undefined" &&
  !(Element.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView
) {
  ;(Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => {}
}

// jsdom lacks IntersectionObserver (used by Image/Video lazy loading).
if (typeof globalThis !== "undefined" && !("IntersectionObserver" in globalThis)) {
  ;(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
}
