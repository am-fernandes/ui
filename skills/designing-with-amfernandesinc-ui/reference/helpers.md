# Helpers

Tudo sai do barrel (`@amfernandesinc/ui`) e de subpaths (`/lib/currency`, `/lib/date`, `/lib/brazil`, `/lib/format`, `/lib/size`, `/lib/text`, `/lib/url`, `/lib/format-count`, `/hooks/*`). Os de `lib/*` rodam no servidor também. Assinaturas exatas em [`api/helpers.md`](api/helpers.md) e [`api/hooks.md`](api/hooks.md).

## Dinheiro

Regra: **conta em centavos inteiros, exibição nas pontas.** O float em reais (o que o `CurrencyInput` entrega) acumula erro em somas e percentuais.

| Função | Faz | Exemplo |
|---|---|---|
| `toCents(reais)` | reais → centavos inteiros | `toCents(1234.56)` → `123456` |
| `fromCents(centavos)` | centavos → reais | `fromCents(123456)` → `1234.56` |
| `formatBRL(reais)` | exibição com símbolo | `formatBRL(1234.5)` → `"R$ 1.234,50"` |
| `toBRLMoney(valor)` | exibição sem símbolo, 2 casas; aceita texto, número, `null` | `toBRLMoney("1234.5")` → `"1.234,50"` |
| `centsToDisplay(centavos)` | centavos → exibição sem símbolo | `centsToDisplay(123456)` → `"1.234,56"` |
| `percentOfTotal(p, total)` | valor de um percentual (arredondado a centavos) | `percentOfTotal(70, 185000)` → `129500` |
| `percentFromValue(v, total)` | percentual de um valor | `percentFromValue(129500, 185000)` → `70` |
| `parseBRNumber(texto)` | lê número escrito por gente ("1.234,5", "R$ 1.500", "2350.9") | `parseBRNumber("R$ 1.234,50")` → `1234.5` |
| `parseMaskedValue(texto)` | reverte máscara BRL | `parseMaskedValue("1.234,56")` → `1234.56` |

```ts
import { formatBRL, fromCents, percentOfTotal, toCents } from "@amfernandesinc/ui"

type Item = { descricao: string; valor: number }

export function totalDaProposta(itens: Item[], descontoPercentual: number) {
  const subtotalCentavos = itens.reduce((soma, item) => soma + toCents(item.valor), 0)
  const descontoCentavos = Math.round(percentOfTotal(descontoPercentual, subtotalCentavos))
  const totalCentavos = subtotalCentavos - descontoCentavos
  return {
    subtotal: formatBRL(fromCents(subtotalCentavos)),
    desconto: formatBRL(fromCents(descontoCentavos)),
    total: formatBRL(fromCents(totalCentavos)),
  }
}
```

Percentual como texto: `` `${toBRLMoney(8.45)} %` `` → `"8,45 %"`. Número qualquer em pt-BR sem casas fixas: `new Intl.NumberFormat("pt-BR").format(n)` é aceitável; para dinheiro, sempre `formatBRL`/`toBRLMoney`.

## Datas e fuso

O modelo de `lib/date`:

- **Data pura** (`"2024-01-15"`): um dia do calendário (vencimento, nascimento, competência). Nunca muda de dia, em nenhum fuso.
- **Instante** (`Date`, ou texto com hora e deslocamento: `"2024-01-15T23:30:00-03:00"`, `"...Z"`): um momento exato, visto em `America/Sao_Paulo` (`DEFAULT_TIME_ZONE`) salvo outro `timeZone`.
- **Data e hora sem deslocamento** (`"2024-01-15T14:30"`): relógio de parede no fuso em uso, igual no servidor e no navegador.

Nada depende do fuso da máquina. Datas puras guardadas como meia-noite UTC (`"2024-01-15T00:00:00.000Z"`) caem às 21h do dia anterior em São Paulo: passe `timeZone: "UTC"` ou corte para `YYYY-MM-DD`.

| Função | Para |
|---|---|
| `formatDate(d, formato?, tz?)` | `"brl"` (padrão) `15/01/2024`; `"brl-full"` `15/01/2024 14:30`; `"time"` `14:30`; `"us"` `2024-01-15` (o formato do `DateInput`); `"iso"` instante ISO |
| `parseDate("2024-01-15", "14:30"?)` | o instante daquela data (e hora) no fuso |
| `addDays`, `subDays`, `addMonths` | aritmética de calendário (fim de mês correto) |
| `diffInDays(a, b)` | dias entre datas (a − b) |
| `isSameDay`, `compareDates`, `isPast`, `isFuture`, `isValidDate` | comparações no fuso |
| `startOfDay`, `endOfDay`, `startOfMonth`, `endOfMonth` | limites para filtros e consultas |

```ts
import { addMonths, diffInDays, formatDate, isPast } from "@amfernandesinc/ui"

export function resumoDoVencimento(vencimento: string, hoje: Date = new Date()) {
  const dias = diffInDays(vencimento, hoje)
  if (isPast(vencimento)) return `Venceu em ${formatDate(vencimento)}`
  return dias === 0 ? "Vence hoje" : `Vence em ${dias} dias (${formatDate(vencimento)})`
}

export function proximasParcelas(primeira: string, quantidade: number): string[] {
  return Array.from({ length: quantidade }, (_, i) => formatDate(addMonths(primeira, i), "us"))
}
```

Componentes: `DateInput`/`DateRangePicker` usam `"yyyy-MM-dd"` (`formatDate(d, "us")` converte um `Date`); `Calendar`, `Schedule` e `dateColumn` aceitam `Date`. Não use `new Date("2024-01-15")`: o JavaScript lê como meia-noite UTC e, no Brasil, mostra o dia 14.

## Documentos e telefone

| Validar | Formatar (dígitos → máscara) |
|---|---|
| `isValidCPF(v)` (dígitos verificadores) | `formatCPF("52998224725")` → `"529.982.247-25"` |
| `isValidCNPJ(v)` (numérico e alfanumérico) | `formatCNPJ("11222333000181")` → `"11.222.333/0001-81"` |
| `isValidCEP(v)` (8 dígitos) | `formatCEP("01310100")` → `"01310-100"` |
| `isValidPhone(v)` (10 fixo ou 11 celular, DDD 11–99) | `formatPhone("11987654321")` → `"(11) 98765-4321"` |

Os validadores aceitam com ou sem máscara. Guarde e envie só dígitos (o que os inputs entregam).

```ts
import { formatCPF, isValidCNPJ, isValidCPF } from "@amfernandesinc/ui"

export function documentoDoCliente(documento: string): { tipo: "CPF" | "CNPJ"; exibicao: string } | null {
  const limpo = documento.replace(/[^0-9A-Za-z]/g, "").toUpperCase()
  if (limpo.length === 11 && isValidCPF(limpo)) return { tipo: "CPF", exibicao: formatCPF(limpo) }
  if (limpo.length === 14 && isValidCNPJ(limpo)) return { tipo: "CNPJ", exibicao: limpo }
  return null
}
```

## Bytes, contagem, texto e URLs

- Tamanho: `kb(500)`, `mb(10)`, `gb(1)`, `bytes(n)` (para `maxSize` do `FileUpload`, nunca número mágico).
- Contagem em badge: `formatCount(12345)` → `"9999+"` (`max` opcional).
- Busca sem acento: `normalizeText("João Álvares")` → `"joao alvares"`; `matchesSearch(texto, termo)`; `compareText(a, b)` para ordenar nomes em pt-BR.
- URLs: `isAllowedUrl(url, DEFAULT_ALLOWED_LINK_PROTOCOLS)` (links: `http:`, `https:`, `mailto:`, `tel:`; relativos passam) e `DEFAULT_ALLOWED_RESOURCE_PROTOCOLS` (mídia: `http:`, `https:`). Use antes de renderizar um link vindo do usuário.

```ts
import { compareText, matchesSearch } from "@amfernandesinc/ui"

type Corretor = { nome: string; creci: string }

export function filtrarCorretores(lista: Corretor[], termo: string): Corretor[] {
  return lista
    .filter((c) => matchesSearch(`${c.nome} ${c.creci}`, termo))
    .sort((a, b) => compareText(a.nome, b.nome))
}
```

## Classes

`cn(...)` = `clsx` + `tailwind-merge` (a classe que vem depois ganha). Variantes prontas para algo seu com a cara de um componente: `buttonVariants({ variant, size })`, `badgeVariants({ variant })`, `alertVariants({ variant })`, `toggleVariants(...)`, `typographyVariants({ variant })`, `tableStyles()`.

## Hooks

| Hook | Devolve |
|---|---|
| `useIsMobile()` | `true` abaixo do breakpoint `md` (48rem), a mesma consulta do CSS; `false` no servidor e no primeiro render |
| `useDebounce(valor, ms)` | o valor depois de `ms` sem mudar (busca enquanto digita) |
| `useCopyToClipboard({ resetAfter? })` | `{ copy(texto), copied }`; avisa com toast, funciona sem HTTPS |
| `useAppShell()` | `{ collapsed, isMobile, closeMenu, toggle }` (dentro do `AppShell`) |
| `useComboboxOptions(linhas, "nome")` | linhas `{ id, nome }` → opções do `Combobox` |

```tsx
import { Check, Copy } from "lucide-react"
import { IconButton, useCopyToClipboard } from "@amfernandesinc/ui"

export function CopiarLink({ url }: { url: string }) {
  const { copy, copied } = useCopyToClipboard()
  return (
    <IconButton
      icon={copied ? <Check /> : <Copy />}
      label={copied ? "Link copiado" : "Copiar link"}
      onClick={() => copy(url)}
    />
  )
}
```
