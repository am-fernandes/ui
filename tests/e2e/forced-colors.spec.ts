import { type Locator, type Page, expect, test } from "@playwright/test"

/**
 * Em cores forçadas (Alto Contraste do Windows), o navegador tira as imagens
 * de fundo, e o realce em camada (`state-hover`) é uma. Em cada lista e menu
 * que se percorre com as setas, o item ativo precisa continuar diferente dos
 * outros: senão o Enter escolhe às cegas. O item ativo da CommandPalette e as
 * linhas do menu do trilho do AppShell sumiam.
 */

const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`

async function ready(page: Page, id: string) {
  await page.emulateMedia({ forcedColors: "active" })
  await page.goto(story(id))
  await page.waitForFunction(
    () =>
      document.body.classList.contains("sb-show-main") &&
      !!document.getElementById("storybook-root")?.firstChild,
    null,
    { timeout: 30_000 },
  )
}

/** O que o modo de cores forçadas ainda desenha num item. */
function look(item: Locator) {
  return item.evaluate((el) => {
    const s = getComputedStyle(el)
    return {
      outline:
        s.outlineStyle === "none"
          ? "none"
          : `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`,
      background: s.backgroundColor,
      color: s.color,
      border: `${s.borderTopStyle} ${s.borderTopColor}`,
      underline: s.textDecorationLine,
    }
  })
}

type Case = {
  name: string
  id: string
  /** Abre a lista e deixa um item ativo pelo teclado. */
  open: (page: Page) => Promise<void>
  active: (page: Page) => Locator
  other: (page: Page) => Locator
}

const cases: Case[] = [
  {
    name: "Combobox",
    id: "forms-combobox--default",
    open: async (page) => {
      await page.getByRole("combobox").first().click()
      await page.keyboard.press("ArrowDown")
    },
    active: (page) => page.locator('[role="option"][aria-selected="true"]').first(),
    other: (page) => page.locator('[role="option"][aria-selected="false"]').first(),
  },
  {
    name: "CommandPalette",
    id: "navigation-commandpalette--default",
    open: async (page) => {
      await page.getByRole("button", { name: "Abrir paleta" }).click()
      await page.keyboard.press("ArrowDown")
    },
    active: (page) => page.locator('[cmdk-item][aria-selected="true"]').first(),
    other: (page) => page.locator('[cmdk-item][aria-selected="false"]').first(),
  },
  {
    name: "DropdownMenu",
    id: "overlays-dropdownmenu--default",
    open: async (page) => {
      await page.locator('[data-slot="dropdown-menu-trigger"]').first().focus()
      await page.keyboard.press("Enter")
      await page.keyboard.press("ArrowDown")
    },
    active: (page) => page.locator('[role="menuitem"][data-highlighted]').first(),
    other: (page) => page.locator('[role="menuitem"]:not([data-highlighted])').first(),
  },
  {
    name: "Select",
    id: "forms-select--default",
    open: async (page) => {
      await page.getByRole("combobox").first().focus()
      await page.keyboard.press("Enter")
      await page.keyboard.press("ArrowDown")
    },
    active: (page) => page.locator('[role="option"][data-highlighted]').first(),
    other: (page) => page.locator('[role="option"]:not([data-highlighted])').first(),
  },
  {
    name: "AppShell: menu do trilho",
    id: "navigation-appshell--collapsed",
    open: async (page) => {
      await page
        .locator('aside[data-slot="app-shell-sidebar"]')
        .getByRole("button", { name: "Propostas" })
        .focus()
      await page.keyboard.press("Enter")
      await page.keyboard.press("ArrowDown")
    },
    active: (page) =>
      page.locator('[data-slot="app-shell-flyout"] [role="menuitem"]:focus').first(),
    other: (page) =>
      page.locator('[data-slot="app-shell-flyout"] [role="menuitem"]:not(:focus)').first(),
  },
]

for (const c of cases) {
  test(`${c.name}: o item ativo continua visível em cores forçadas`, async ({ page }) => {
    await ready(page, c.id)
    await c.open(page)
    const active = c.active(page)
    const other = c.other(page)
    await expect(active).toBeVisible()
    await expect(other).toBeVisible()
    expect(await look(active)).not.toEqual(await look(other))
  })
}
