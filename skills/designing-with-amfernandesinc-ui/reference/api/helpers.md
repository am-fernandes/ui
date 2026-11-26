<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Helpers (lib)

## `lib/brazil` — `@amfernandesinc/ui/lib/brazil`

### isValidCEP

`import { isValidCEP } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/brazil"`

Valida um CEP — exatamente 8 dígitos numéricos.

```ts
isValidCEP(value: string): boolean
```

### isValidCNPJ

`import { isValidCNPJ } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/brazil"`

Valida um CNPJ (14 caracteres) usando o algoritmo oficial de DV. Aceita o formato numérico e o alfanumérico: doze posições com dígitos ou letras e dois dígitos verificadores numéricos. Letras minúsculas são lidas como maiúsculas. Rejeita strings de dígitos repetidos. Qualquer letra conta como parte do número: `"CNPJ 11.222.333/0001-81"` não é um CNPJ válido, `"11.222.333/0001-81"` é.

```ts
isValidCNPJ(value: string): boolean
```

### isValidCPF

`import { isValidCPF } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/brazil"`

Valida um CPF (11 dígitos) usando o algoritmo oficial de DV. Rejeita strings de dígitos repetidos.

```ts
isValidCPF(value: string): boolean
```

### isValidPhone

`import { isValidPhone } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/brazil"`

Valida um telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular). O DDD (primeiros 2 dígitos) deve estar entre 11 e 99.

```ts
isValidPhone(value: string): boolean
```

## `lib/currency` — `@amfernandesinc/ui/lib/currency`

### centsToDisplay

`import { centsToDisplay } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Formata centavos inteiros para exibição BRL: 123456 → "1.234,56"

```ts
centsToDisplay(cents: number): string
```

### formatBRL

`import { formatBRL } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Formata float para exibição BRL: 1234.56 → "R$ 1.234,56"

```ts
formatBRL(value: number): string
```

### fromCents

`import { fromCents } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Centavos inteiros → float. Ex: 123456 → 1234.56

```ts
fromCents(cents: number): number
```

### parseBRNumber

`import { parseBRNumber } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Lê um número escrito por um brasileiro (colado de uma planilha, de um e-mail, de um PDF) e devolve o valor, ou `null` quando o texto não tem número. `R$`, `%`, espaços e qualquer outro texto são ignorados. - Com vírgula, ela é o separador decimal e os pontos são de milhar: `"1.234,5"` → 1234.5. - Sem vírgula, um único ponto seguido de um ou dois dígitos é decimal: `"2350.9"` → 2350.9, `"1500.00"` → 1500. - Sem vírgula, pontos de milhar bem formados são milhar: `"1.500"` → 1500, `"350.000"` → 350000. - Sem vírgula, um ponto que não pode ser de milhar é decimal (número em formato de máquina): `"1234.567"` → 1234.567, `"0.125"` → 0.125. - Sem separador, é um inteiro: `"1500"` → 1500. Um sinal de menos antes do primeiro dígito torna o número negativo.

```ts
parseBRNumber(text: string): number | null
```

### parseMaskedValue

`import { parseMaskedValue } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Reverte máscara BRL para número: "1.234,56" → 1234.56 Usar ao submeter formulários com campos monetários mascarados.

```ts
parseMaskedValue(value: string): number
```

### percentFromValue

`import { percentFromValue } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Calcula o percentual que um valor representa de um total. Usa centavos para divisão precisa, arredondado a 2 casas. Ex: percentFromValue(129500, 185000) → 70

```ts
percentFromValue(value: number, total: number): number
```

### percentOfTotal

`import { percentOfTotal } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Calcula o valor a partir de um percentual sobre um total. Tudo em centavos para evitar explosão de float. Ex: percentOfTotal(70, 185000) → 129500 percentOfTotal(33.33, 185000) → 61660.5 (arredondado para 61660.50)

```ts
percentOfTotal(percent: number, total: number): number
```

### toBRLMoney

`import { toBRLMoney } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Formata número para exibição BRL sem prefixo, sempre com duas casas: 1234.5 → "1.234,50", 1000 / 3 → "333,33". Útil para tabelas e campos onde o símbolo R$ já está no label. Um texto é lido por `parseBRNumber`: tanto o formato de máquina (`"1234.5"`) quanto o brasileiro (`"1.234,50"`, `"R$ 1.234,50"`). O que não for número devolve `""`.

```ts
toBRLMoney(value?: string | number | null): string
```

### toCents

`import { toCents } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/currency"`

Float → centavos inteiros. Ex: 1234.56 → 123456

```ts
toCents(value: number): number
```

## `lib/date` — `@amfernandesinc/ui/lib/date`

### addDays

`import { addDays } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Adiciona dias a uma data, no calendário do fuso: o resultado cai no mesmo horário de N dias depois, mesmo atravessando uma virada de horário de verão.

```ts
addDays(date: Date | string | null | undefined, days: number, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### addMonths

`import { addMonths } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Adiciona meses a uma data. Quando o mês de destino não tem o dia de origem, para no último dia dele: 31/01 + 1 mês = 29/02 (ou 28/02), nunca 02/03. Para gerar parcelas, some sempre a partir da data base (`addMonths(base, i)`), não da parcela anterior: assim o vencimento volta ao dia 31 nos meses que têm 31.

```ts
addMonths(date: Date | string | null | undefined, months: number, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### compareDates

`import { compareDates } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Compara duas datas. Retorna negativo se a < b, positivo se a > b, 0 se iguais. Útil como comparator para Array.sort().

```ts
compareDates(a: Date | string | null | undefined, b: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): number
```

### diffInDays

`import { diffInDays } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Diferença em dias entre duas datas (a - b).

```ts
diffInDays(a: Date | string | null | undefined, b: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): number
```

### endOfDay

`import { endOfDay } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Fim do dia (23:59:59.999) no fuso.

```ts
endOfDay(date: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### endOfMonth

`import { endOfMonth } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Último dia do mês (23:59:59.999) no fuso.

```ts
endOfMonth(date: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### formatDate

`import { formatDate } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Formata uma data para exibição, no fuso de São Paulo (ou em `timeZone`). Uma data pura sai no mesmo dia em qualquer fuso.

```ts
formatDate(date: Date | string | null | undefined, format: DateFormat = "brl", timeZone: string = DEFAULT_TIME_ZONE): string
```

### isFuture

`import { isFuture } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Verdadeiro se a data está no futuro. Um instante é futuro se ainda não aconteceu; uma data pura, só se for depois de hoje no fuso (hoje não é futuro).

```ts
isFuture(date: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): boolean
```

### isPast

`import { isPast } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Verdadeiro se a data está no passado. Um instante é passado se já aconteceu; uma data pura, só a partir do dia seguinte a ela no fuso (hoje não é passado).

```ts
isPast(date: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): boolean
```

### isSameDay

`import { isSameDay } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Verdadeiro se as duas datas caem no mesmo dia do calendário de São Paulo (ou de `timeZone`). Às 21h30 de 22/11 em São Paulo ainda é dia 22, embora em UTC já seja dia 23.

```ts
isSameDay(a: Date | string | null | undefined, b: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): boolean
```

### isValidDate

`import { isValidDate } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Retorna true se o valor é uma data válida (não null, não NaN).

```ts
isValidDate(date: Date | string | null | undefined): boolean
```

### parseDate

`import { parseDate } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

O instante de uma data (e, se houver, de uma hora) no relógio de São Paulo ou de `timeZone`. Sem hora, é a meia-noite daquele dia.

```ts
parseDate(date: string, time?: string, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### startOfDay

`import { startOfDay } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Início do dia (00:00:00.000) no fuso.

```ts
startOfDay(date: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### startOfMonth

`import { startOfMonth } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Primeiro dia do mês (00:00:00.000) no fuso.

```ts
startOfMonth(date: Date | string | null | undefined, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### subDays

`import { subDays } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Subtrai dias de uma data.

```ts
subDays(date: Date | string | null | undefined, days: number, timeZone: string = DEFAULT_TIME_ZONE): Date
```

### DEFAULT_TIME_ZONE

`import { DEFAULT_TIME_ZONE } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/date"`

Fuso usado quando nenhum é passado.

```ts
const DEFAULT_TIME_ZONE = "America/Sao_Paulo"
```

### DateFormat

`import type { DateFormat } from "@amfernandesinc/ui"`

Datas para exibir e comparar, num modelo só: - **Data pura** (`"2024-01-15"`): um dia do calendário, sem hora e sem fuso. Vencimento, nascimento, competência. Nunca muda de dia, em nenhum fuso. - **Instante** (um `Date`, ou um texto com hora e deslocamento, como `"2024-01-15T23:30:00-03:00"` ou `"...Z"`): um momento exato. O dia e a hora dele dependem de onde se olha, e aqui se olha de `America/Sao_Paulo`, salvo se outro `timeZone` for passado. - **Data e hora sem deslocamento** (`"2024-01-15T14:30"`): o relógio da parede no fuso em uso. É lida igual no servidor e no navegador. Nada aqui depende do fuso da máquina. As funções que devolvem `Date` devolvem instantes: para uma data pura, o da meia-noite daquele dia no fuso, de modo que `formatDate(addDays("2024-01-15", 1))` dá `16/01/2024`. Quem guarda datas puras como instante em UTC (`"2024-01-15T00:00:00.000Z"`) deve passar `timeZone: "UTC"` ou cortar o texto para `YYYY-MM-DD`; lidas em São Paulo, elas caem às 21h do dia anterior.

```ts
export type DateFormat = "brl" | "brl-full" | "us" | "time" | "iso"
```

## `lib/format` — `@amfernandesinc/ui/lib/format`

### formatCEP

`import { formatCEP } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/format"`

"01310100" → "01310-100"

```ts
formatCEP(cep: string): string
```

### formatCNPJ

`import { formatCNPJ } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/format"`

"12345678000190" → "12.345.678/0001-90" "12ABC34501DE35" → "12.ABC.345/01DE-35" (CNPJ alfanumérico, letras em maiúsculas)

```ts
formatCNPJ(cnpj: string): string
```

### formatCPF

`import { formatCPF } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/format"`

"12345678900" → "123.456.789-00"

```ts
formatCPF(cpf: string): string
```

### formatPhone

`import { formatPhone } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/format"`

"11987654321" → "(11) 98765-4321" "1134567890" → "(11) 3456-7890" "+55 11 98765-4321" → "(11) 98765-4321" (sem o código do país, como o PhoneInput)

```ts
formatPhone(phone: string): string
```

## `lib/format-count` — `@amfernandesinc/ui/lib/format-count`

### formatCount

`import { formatCount } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/format-count"`

Formats an integer count for badge / notification UIs, capping at `max`. - `count <= max` → `String(count)` - `count > max` → `${max}+` (e.g. `9999+`) - `count < 0` → `"0"` (clamped — counters are non-negative by convention) - non-finite (`NaN`, `Infinity`) → `"0"`

```ts
formatCount(count: number, max = 9999): string
```

## `lib/render-link` — `@amfernandesinc/ui/lib/render-link`

### RenderLink

`import type { RenderLink } from "@amfernandesinc/ui"`

Troca o `<a>` da lib pelo link do seu roteador, sem recarregar a página: ```tsx // React Router renderLink={({ href, ...props }) => <Link to={href} {...props} />} // Next.js renderLink={(props) => <Link {...props} />} ```

```ts
export type RenderLink = (props: RenderLinkProps) => React.ReactElement
```

### RenderLinkProps

`import type { RenderLinkProps } from "@amfernandesinc/ui"`

O que a lib entrega para o link de um item de navegação: tudo que um `<a>` aceita, com `href` sempre presente. Inclui `className`, `aria-current`, `children` e o `onClick` da própria lib (que fecha o menu no celular, por exemplo), então repasse tudo ao elemento que você renderizar.

```ts
export interface RenderLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  ref?: React.Ref<HTMLAnchorElement>
}
```

## `lib/size` — `@amfernandesinc/ui/lib/size`

### bytes

`import { bytes } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/size"`

Tiny helpers to express byte sizes ergonomically.

```ts
bytes(n: number): number
```

### gb

`import { gb } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/size"`

```ts
gb(n: number): number
```

### kb

`import { kb } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/size"`

```ts
kb(n: number): number
```

### mb

`import { mb } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/size"`

```ts
mb(n: number): number
```

## `lib/text` — `@amfernandesinc/ui/lib/text`

### compareText

`import { compareText } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/text"`

Comparador para ordenar texto em português: ignora acento e caixa e trata números dentro do texto ("Bloco 2" antes de "Bloco 10"). Serve direto em `array.sort(compareText)`.

```ts
compareText(a: string, b: string): number
```

### matchesSearch

`import { matchesSearch } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/text"`

`true` quando `needle` aparece em `haystack`, sem diferenciar acento nem caixa. Um `needle` vazio (ou só com espaços) casa com tudo.

```ts
matchesSearch(haystack: string, needle: string): boolean
```

### normalizeText

`import { normalizeText } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/text"`

Tira acentos e caixa: `"João Álvares"` vira `"joao alvares"`.

```ts
normalizeText(text: string): string
```

## `lib/url` — `@amfernandesinc/ui/lib/url`

### isAllowedUrl

`import { isAllowedUrl } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/url"`

Returns true when `value` resolves to a URL with a protocol on the `allowed` list. Always returns false for `javascript:`, regardless of case or leading whitespace. Relative URLs resolve against `window.location.href` client-side and `http://localhost/` during SSR, so links like `/dashboard` or `#section` pass the link defaults.

```ts
isAllowedUrl(value: string, allowed: readonly string[]): boolean
```

### DEFAULT_ALLOWED_LINK_PROTOCOLS

`import { DEFAULT_ALLOWED_LINK_PROTOCOLS } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/url"`

Default allowlist for navigation `href` props — Breadcrumb, AppShell. `mailto:` and `tel:` are added because contact links are a legitimate use case in enterprise menus. Relative URLs and `#hash` links resolve through the page origin's protocol, so they're already covered by the `http:` / `https:` entries.

```ts
const DEFAULT_ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"] as const
```

### DEFAULT_ALLOWED_RESOURCE_PROTOCOLS

`import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/url"`

Default allowlist for media `src` props — Image, Video, Avatar.

```ts
const DEFAULT_ALLOWED_RESOURCE_PROTOCOLS = ["http:", "https:"] as const
```

## `lib/utils` — `@amfernandesinc/ui/lib/utils`

### cn

`import { cn } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/lib/utils"`

```ts
cn(...inputs: ClassValue[]): string
```
