/**
 * Texto para busca e ordenação em português.
 *
 * Quem busca digita sem acento ("joao", "configuracoes") e espera achar "João"
 * e "Configurações"; quem ordena espera "Álvaro" antes de "Bruno", não depois
 * de "Zuleica". Estes três helpers são o contrato único da lib para isso.
 */

/** Tira acentos e caixa: `"João Álvares"` vira `"joao alvares"`. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
}

/**
 * `true` quando `needle` aparece em `haystack`, sem diferenciar acento nem
 * caixa. Um `needle` vazio (ou só com espaços) casa com tudo.
 */
export function matchesSearch(haystack: string, needle: string): boolean {
  const term = normalizeText(needle).trim()
  if (term === "") return true
  return normalizeText(haystack).includes(term)
}

const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" })

/**
 * Comparador para ordenar texto em português: ignora acento e caixa e trata
 * números dentro do texto ("Bloco 2" antes de "Bloco 10"). Serve direto em
 * `array.sort(compareText)`.
 */
export function compareText(a: string, b: string): number {
  return collator.compare(a, b)
}
