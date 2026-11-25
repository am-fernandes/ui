import { type Page, expect, test } from "@playwright/test"

/**
 * O tema escuro num ancestral (`<section class="dark">`) tem de pintar igual
 * ao tema escuro no `<html>`. Um token lido como `var(--color-*)` é calculado
 * no :root e herdado já resolvido: dentro da seção ficava a cor do claro
 * (divisores, regras de tabela e a grade de horas do Schedule perto de 1:1).
 *
 * Para cada story, as cores calculadas de cada elemento com `dark` no
 * `<html>` e com `dark` no `#storybook-root` (um ancestral comum) têm de ser
 * as mesmas.
 */

type Paint = Record<string, string>

const PROPERTIES = [
  "color",
  "background-color",
  "background-image",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "fill",
  "stroke",
  "box-shadow",
  "text-decoration-color",
  "caret-color",
] as const

async function open(page: Page, id: string, theme?: "Escuro") {
  await page.goto(`/iframe.html?id=${id}&viewMode=story${theme ? `&globals=theme:${theme}` : ""}`)
  await page.waitForFunction(
    () =>
      document.body.classList.contains("sb-show-main") &&
      !document.body.classList.contains("sb-show-preparing-story") &&
      !!document.getElementById("storybook-root")?.firstChild,
    null,
    { timeout: 30_000 },
  )
  // O seletor de tema do Storybook põe a classe depois de montar a story.
  if (theme) {
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"))
  }
  // Sem animação nem transição: a cor lida é a final.
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
  })
}

/** As cores de cada elemento dentro da story, na ordem do documento. */
async function paints(page: Page): Promise<Paint[]> {
  // Nem foco nem ponteiro sobre a story: o estado não é o que se compara.
  await page.mouse.move(0, 0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  return page.evaluate(
    (properties) => {
      const root = document.getElementById("storybook-root")
      if (!root) return []
      return [root, ...root.querySelectorAll("*")].slice(0, 3000).map((element) => {
        const style = getComputedStyle(element)
        const paint: Record<string, string> = { at: element.tagName.toLowerCase() }
        for (const property of properties) paint[property] = style.getPropertyValue(property)
        return paint
      })
    },
    PROPERTIES as unknown as string[],
  )
}

async function storyIds(page: Page): Promise<string[]> {
  const response = await page.request.get("/index.json")
  const { entries } = (await response.json()) as {
    entries: Record<string, { type: string; id: string }>
  }
  const all = Object.values(entries)
    .filter((entry) => entry.type === "story")
    .map((entry) => entry.id)
  const extra = [
    "data-datatable--default",
    "data-schedule--week",
    "data-schedule--month",
    "data-card--with-footer",
    "navigation-appshell--default",
    "navigation-tabs--default",
    "forms-calendar--single",
  ]
  // Imagem e vídeo trocam de elementos conforme a mídia carrega (ou falha):
  // a contagem muda entre as duas leituras por tempo, não por tema.
  const timing = ["data-image--default", "data-video--default"]
  return [...new Set([...all.filter((id) => id.endsWith("--default")), ...extra])].filter(
    (id) => all.includes(id) && !timing.includes(id),
  )
}

test("cada story pinta igual com dark no <html> e num ancestral", async ({ page }) => {
  test.setTimeout(600_000)
  const ids = await storyIds(page)
  expect(ids.length).toBeGreaterThan(40)
  const differences: string[] = []
  for (const id of ids) {
    await open(page, id, "Escuro")
    const onHtml = await paints(page)

    await open(page, id)
    await page.evaluate(() => {
      document.documentElement.classList.remove("dark")
      document.getElementById("storybook-root")?.classList.add("dark")
    })
    const onAncestor = await paints(page)

    if (onHtml.length !== onAncestor.length) {
      differences.push(
        `${id}: ${onHtml.length} elementos no <html>, ${onAncestor.length} no ancestral`,
      )
      continue
    }
    // O próprio #storybook-root: só a cor do texto (o fundo é do <body>, que
    // só é escuro no primeiro caso). O texto solto numa parte escura é claro.
    for (let i = 0; i < onHtml.length; i++) {
      const a = onHtml[i] as Paint
      const b = onAncestor[i] as Paint
      for (const property of i === 0 ? (["color"] as const) : PROPERTIES) {
        if (a[property] !== b[property]) {
          differences.push(`${id} #${i} <${a.at}> ${property}: ${a[property]} ≠ ${b[property]}`)
        }
      }
    }
  }
  // Até três diferenças por story, para ver todas as que falham.
  const perStory = new Map<string, string[]>()
  for (const line of differences) {
    const id = line.split(/[ :]/)[0] ?? ""
    const list = perStory.get(id) ?? []
    if (list.length < 3) list.push(line)
    perStory.set(id, list)
  }
  expect([...perStory.values()].flat()).toEqual([])
})
