import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

/**
 * Contract of the release notes: every change that asks work of an app is on
 * the migration page and in the agents' skill, not only as one loose line
 * among ~300 in the CHANGELOG.
 *
 * The 0.6 table of breaking changes missed the removed status tokens, the
 * new `--accent`, the two backgrounds, the dates in São Paulo and the typed
 * DateInput; the border changesets said what changed and not what to do.
 *
 * A changeset that breaks says what to do with one of the markers below
 * (`**Como migrar:**`, `**Quebra:**`, `**Telas do app mudam:**`…). Each such
 * changeset is cited by name on src/docs/Migration.mdx. Changesets are
 * consumed by a release, so only those still in `.changeset/` are checked.
 */

const root = path.join(__dirname, "..", "..")
const changesetDir = path.join(root, ".changeset")
const migration = readFileSync(path.join(root, "src/docs/Migration.mdx"), "utf8")
const skill = readFileSync(
  path.join(root, "skills/designing-with-amfernandesinc-ui/reference/anti-patterns.md"),
  "utf8",
)

const MARKER =
  /\*\*(Quebra|Migração|Como migrar|Telas do app mudam)\b|\(quebra\)|mudança que quebra|Para migrar:/i

const changesets = existsSync(changesetDir)
  ? readdirSync(changesetDir)
      .filter((name) => name.endsWith(".md") && name !== "README.md")
      .map((name) => ({
        slug: name.replace(/\.md$/, ""),
        text: readFileSync(path.join(changesetDir, name), "utf8"),
      }))
  : []

/** What each breaking change is called in the skill's migration table. */
const SKILL_TERMS: Record<string, string> = {
  "status-solid": "status-",
  "app-shell-replaces-sidebar": "AppShell",
  "button-type-button": 'type="button"',
  "badge-span": "<span>",
  "radius-levels": "Raio em três níveis",
  "translucent-border": "Borda translúcida",
  "border-strong": "border-border-strong",
  "two-backgrounds": "bg-background",
  "group-palette": "--accent",
  "date-time-zone": "America/Sao_Paulo",
  "date-input-typeable": "DateInput",
  "video-states": "objectFit",
  "image-fallback": "Sem imagem",
  "add-months-month-end": "addMonths",
  "data-table-write-excel-file": "xlsx",
  "tailwind-peer": "Tailwind 4.1",
}

const SUMMARY = "0-migracao-0-6"

describe("migration notes", () => {
  const breaking = changesets.filter(({ slug, text }) => slug !== SUMMARY && MARKER.test(text))

  it("every changeset that breaks is cited on the migration page", () => {
    const missing = breaking
      .map(({ slug }) => slug)
      .filter((slug) => !migration.includes(`\`${slug}\``))
    expect(missing).toEqual([])
  })

  it("every changeset the migration page cites exists, until 0.6 is released", () => {
    // The release consumes the changesets: after it, the page is history.
    if (!changesets.some((c) => c.slug === SUMMARY)) return
    const cited = [...migration.matchAll(/<br\/>`([a-z0-9-]+)`(?:, `([a-z0-9-]+)`)?/g)].flatMap(
      (match) => [match[1], match[2]].filter((slug): slug is string => slug != null),
    )
    expect(cited.length).toBeGreaterThan(10)
    const slugs = new Set(changesets.map((c) => c.slug))
    expect(cited.filter((slug) => !slugs.has(slug))).toEqual([])
  })

  it("every breaking change is in the agents' skill migration table", () => {
    const section = skill.slice(skill.indexOf("### Migrar de 0.5.x para 0.6"))
    const missing = Object.entries(SKILL_TERMS)
      .filter(([, term]) => !section.includes(term))
      .map(([slug, term]) => `${slug}: ${term}`)
    expect(missing).toEqual([])
    // A breaking changeset with no row in the skill is a new one to add here.
    const unmapped = breaking.map(({ slug }) => slug).filter((slug) => !(slug in SKILL_TERMS))
    expect(unmapped).toEqual([])
  })

  it("the release opens with the summary (a minor changeset that sorts first)", () => {
    const first = changesets.map((c) => c.slug).sort()[0]
    if (first === undefined) return
    const summary = changesets.find((c) => c.slug === SUMMARY)
    if (!summary) return
    expect(first).toBe(SUMMARY)
    expect(summary.text).toContain('"@amfernandesinc/ui": minor')
    expect(summary.text).toContain("Migração 0.6")
  })
})
