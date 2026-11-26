import { readFileSync } from "node:fs"
import { type Locator, type Page, expect, test } from "@playwright/test"
import { expectNoA11yViolations } from "./a11y"

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

/**
 * WCAG contrast between an element's own background (which may be
 * translucent) and the opaque surface behind `surface`, both as painted:
 * the surface first, then the element's colour on top of it.
 */
async function backgroundContrast(element: Locator, surface: Locator) {
  return element.evaluate(
    (el, behind) => {
      const canvas = document.createElement("canvas")
      canvas.width = canvas.height = 1
      const context = canvas.getContext("2d", { willReadFrequently: true })
      if (!context) throw new Error("no 2d context")
      const isClear = (bg: string) => bg === "transparent" || /rgba\(.*,\s*0\)$/.test(bg)
      let node: Element | null = behind as Element
      let ground = "#ffffff"
      while (node) {
        const bg = getComputedStyle(node).backgroundColor
        if (bg && !isClear(bg)) {
          ground = bg
          break
        }
        node = node.parentElement
      }
      const luminance = (...layers: string[]) => {
        context.fillStyle = "#ffffff"
        context.fillRect(0, 0, 1, 1)
        for (const layer of layers) {
          context.fillStyle = layer
          context.fillRect(0, 0, 1, 1)
        }
        const linear = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3), (v) => {
          const c = v / 255
          return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0)
      }
      const own = getComputedStyle(el).backgroundColor
      const [hi, lo] = [luminance(ground, own), luminance(ground)].sort((x, y) => y - x)
      return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05)
    },
    await surface.elementHandle(),
  )
}

async function goto(page: Page, id: string, slot: string) {
  await page.goto(story(id))
  await expect(page.locator(`[data-slot="${slot}"]`).first()).toBeVisible({ timeout: 15_000 })
}

test.describe("Card", () => {
  test("a table with padding none touches the card's edges", async ({ page }) => {
    await goto(page, "data-card--with-table", "card")
    const card = (await page.locator('[data-slot="card"]').boundingBox())!
    const table = (await page.locator('[data-slot="card"] table').boundingBox())!
    // Only the 1px border between them.
    expect(table.x - card.x).toBeLessThanOrEqual(1)
    expect(card.x + card.width - (table.x + table.width)).toBeLessThanOrEqual(1)
  })

  test("a title on two lines keeps its lines apart", async ({ page }) => {
    await goto(page, "data-card--default", "card")
    const title = page.locator('[data-slot="card-title"]').first()
    await title.evaluate((el) => {
      el.textContent = "Propostas aprovadas no trimestre pela diretoria comercial"
      ;(el.closest('[data-slot="card"]') as HTMLElement).style.width = "220px"
    })
    const look = await title.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { size: Number.parseFloat(cs.fontSize), line: Number.parseFloat(cs.lineHeight) }
    })
    expect(look.line).toBeGreaterThanOrEqual(look.size * 1.3)
  })

  test("the metric card passes axe, contrast included", async ({ page }) => {
    await goto(page, "data-card--metric-card", "card")
    await expectNoA11yViolations(page, '[data-slot="card"]')
  })
})

test.describe("ScrollArea", () => {
  test("the viewport takes focus and scrolls from the keyboard", async ({ page }) => {
    await goto(page, "data-scrollarea--default", "scroll-area")
    const viewport = page.locator('[data-slot="scroll-area-viewport"]').first()
    await page.keyboard.press("Tab")
    await expect(viewport).toBeFocused()
    await page.keyboard.press("PageDown")
    await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  })

  for (const theme of ["light", "dark"] as const) {
    test(`the thumb stands out 3:1 against the surface (${theme})`, async ({ page }) => {
      await page.goto(
        `${story("data-scrollarea--default")}${theme === "dark" ? "&globals=theme:Escuro" : ""}`,
      )
      const root = page.locator('[data-slot="scroll-area"]').first()
      await expect(root).toBeVisible({ timeout: 15_000 })
      await root.hover()
      const thumb = page.locator('[data-slot="scroll-area-thumb"]').first()
      await expect(thumb).toBeVisible()
      expect(await backgroundContrast(thumb, root)).toBeGreaterThanOrEqual(3)
    })
  }

  test("passes axe with scrollable-region-focusable on", async ({ page }) => {
    await goto(page, "data-scrollarea--default", "scroll-area")
    await expectNoA11yViolations(page, '[data-slot="scroll-area"]')
  })
})

test.describe("Image", () => {
  // The stories point at remote photos; serve them locally so the tests do
  // not depend on the network, and hold the photo back when a test needs
  // to see the loading state.
  const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkqPtfDwAEwgHgnXW8HgAAAABJRU5ErkJggg==",
    "base64",
  )
  async function servePhotos(page: Page, hold?: Promise<void>) {
    await page.route(/images\.unsplash\.com|github\.com\/shadcn\.png/, async (route) => {
      if (hold) await hold
      await route.fulfill({ contentType: "image/png", body: PNG })
    })
    await page.route(/example\.com\/does-not-exist/, (route) => route.fulfill({ status: 404 }))
  }

  test("no image: the fallback takes the alt, and the text hides in a narrow box", async ({
    page,
  }) => {
    await servePhotos(page)
    await goto(page, "data-image--no-image", "image")
    const boxes = page.getByRole("img", { name: "Fachada do imóvel" })
    await expect(boxes).toHaveCount(2)
    await expect(boxes.nth(0).getByText("Sem imagem")).toBeVisible()
    // 64px avatar: icon only.
    await expect(boxes.nth(1).getByText("Sem imagem")).toBeHidden()
    await expectNoA11yViolations(page, '[data-slot="image"]')
  })

  test("a failed load shows the error fallback named by the alt", async ({ page }) => {
    await servePhotos(page)
    await goto(page, "data-image--error-state", "image")
    const box = page.getByRole("img", { name: "Imagem inválida" })
    await expect(box).toHaveAttribute("data-slot", "image-fallback")
    await expect(box.getByText("Falha ao carregar imagem")).toBeVisible()
    await expectNoA11yViolations(page, '[data-slot="image"]')
  })

  test("blurDataURL shows blurred while the photo loads, then the photo fades in", async ({
    page,
  }) => {
    let release = () => {}
    await servePhotos(
      page,
      new Promise<void>((resolve) => {
        release = resolve
      }),
    )
    await page.goto(story("data-image--blur-preview"))
    const preview = page.locator('[data-slot="image-blur"] img')
    await expect(preview).toBeVisible({ timeout: 15_000 })
    expect(await preview.evaluate((el) => getComputedStyle(el).filter)).toMatch(/blur\(\d+px\)/)
    release()
    const photo = page.getByRole("img", { name: "Workspace com laptop e caderno" })
    await expect(photo).toHaveCSS("opacity", "1")
    await expect(preview).toHaveCount(0)
    // The fade uses the medium duration token.
    expect(await photo.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.41s")
  })

  test("the custom fallback shows the lead's initials", async ({ page }) => {
    await goto(page, "data-image--custom-fallback", "image")
    await expect(page.getByRole("img", { name: "Ana Souza" })).toHaveText("AS")
    await expectNoA11yViolations(page, '[data-slot="image"]')
  })
})

test.describe("Video", () => {
  // 90×160 px, one second of VP9: a vertical phone video, served locally.
  const VERTICAL = readFileSync(new URL("./fixtures/vertical.webm", import.meta.url))
  const SAMPLE = /samplelib\.com/
  const serve = (page: Page) =>
    page.route(SAMPLE, (route) => route.fulfill({ contentType: "video/webm", body: VERTICAL }))

  test("contains the frame by default and loads to ready", async ({ page }) => {
    await serve(page)
    await goto(page, "data-video--vertical-video", "video")
    const [contained, cropped] = [
      page.getByLabel("Tour do imóvel", { exact: true }),
      page.getByLabel("Tour do imóvel, cortado"),
    ]
    await expect(contained).toHaveCSS("object-fit", "contain")
    await expect(cropped).toHaveCSS("object-fit", "cover")
    await expect(page.locator('[data-slot="video"]').first()).toHaveAttribute("data-state", "ready")
    expect(
      await contained.evaluate((v: HTMLVideoElement) => [v.videoWidth, v.videoHeight]),
    ).toEqual([90, 160])
  })

  test("loading, then an error with a retry that plays the video", async ({ page }) => {
    let attempt = 0
    let release = () => {}
    const held = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.route(/example\.com\/does-not-exist\.mp4/, async (route) => {
      attempt += 1
      if (attempt === 1) {
        await held
        await route.fulfill({ status: 404 })
      } else {
        await route.fulfill({ contentType: "video/webm", body: VERTICAL })
      }
    })
    await page.goto(story("data-video--error-state"))
    const box = page.locator('[data-slot="video"]')
    await expect(box).toHaveAttribute("data-state", "loading", { timeout: 15_000 })
    await expect(box).toHaveAttribute("aria-busy", "true")
    await expect(page.locator('[data-slot="video-loading"]')).toBeVisible()

    release()
    const fallback = page.getByRole("group", { name: "Tour do imóvel" })
    await expect(fallback).toContainText("Não foi possível carregar o vídeo")
    await expect(page.locator("video")).toBeHidden()
    await expectNoA11yViolations(page, '[data-slot="video"]')

    await fallback.getByRole("button", { name: "Tentar de novo" }).click()
    await expect(box).toHaveAttribute("data-state", "ready")
    await expect(fallback).toHaveCount(0)
    await expect(page.locator("video")).toBeVisible()
  })
})
