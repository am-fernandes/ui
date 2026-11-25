# Gráficos

A lib tem três gráficos em SVG, sem dependência externa: `BarChart`, `LineChart` e `Sparkline`. As cores (`--chart-1`…`--chart-6`) foram validadas para daltonismo nos dois temas. Não use recharts, Chart.js ou outra lib de gráfico num app AMF quando um destes resolve.

O que cada um já faz por você:

- Título como nome acessível, descrição opcional, legenda que liga/desliga séries (para 2+ séries), rótulo direto no fim das linhas (2 a 4 séries, quando não colidem).
- Tooltip com o mouse e pelo teclado (Tab chega no gráfico; setas percorrem; Home/End; Esc fecha), anunciado para leitor de tela.
- Tabela com todos os valores, sempre presente para leitor de tela (`showTable` a mostra na tela).
- Estados `loading` e vazio (`emptyMessage`), cores forçadas (alto contraste), responsivo (a legenda desce em telas estreitas).

## Qual usar

| A pergunta | Forma |
|---|---|
| Comparar quantidades entre categorias (vendas por empreendimento) | `BarChart` vertical |
| Categorias com nome longo, ranking (leads por canal) | `BarChart orientation="horizontal"` |
| Composição de um total por categoria (vendas por tipo dentro de cada mês) | `BarChart stacked` |
| Evolução no tempo (vendas por mês) | `LineChart` |
| Evolução de uma série só, volume | `LineChart area` |
| Tendência ao lado de um número (KPI, célula de tabela) | `Sparkline` |
| Um número só (total do mês) | **Não é gráfico:** `Card` com `Typography`, talvez com `Sparkline` |
| Duas medidas de escalas diferentes (R$ e quantidade) | **Dois gráficos**, nunca dois eixos no mesmo |

## Séries e cores

- `series: { key, label, color? }[]`, no máximo **6**. Uma sétima série é erro em desenvolvimento: agrupe em "Outros" ou divida em gráficos menores.
- As cores seguem a ordem das séries. Quando a lista de séries muda (filtro, permissão), fixe `color` para cada série manter a sua cor: a cor acompanha a entidade, não a posição.
- Valores e rótulos usam as cores de texto, nunca a cor da série.
- Status (bom/ruim) não é série: não use `chart-*` para dizer "atrasado".

## BarChart

`data` (um registro por categoria), `category` (a chave do nome da categoria), `series`, `orientation`, `stacked`, `formatValue` (tooltip e tabela; os eixos ficam compactos: "12 mil"), `height`, `title` (obrigatório), `description`, `showTable`.

```tsx
import { BarChart, formatBRL } from "@amfernandesinc/ui"

const vendas = [
  { trimestre: "1º tri", bosque: 42, torre: 31, vila: 18 },
  { trimestre: "2º tri", bosque: 38, torre: 36, vila: 24 },
  { trimestre: "3º tri", bosque: 45, torre: 29, vila: 30 },
  { trimestre: "4º tri", bosque: 51, torre: 40, vila: 27 },
]

export function VendasPorTrimestre() {
  return (
    <BarChart
      title="Unidades vendidas por trimestre"
      description="Contratos assinados em 2026."
      data={vendas}
      category="trimestre"
      series={[
        { key: "bosque", label: "Residencial Bosque", color: 1 },
        { key: "torre", label: "Torre Norte", color: 2 },
        { key: "vila", label: "Vila Jardim", color: 3 },
      ]}
    />
  )
}

const receita = [
  { canal: "Portais imobiliários", valor: 1_250_000 },
  { canal: "Site da incorporadora", valor: 980_000 },
  { canal: "Indicação de cliente", valor: 640_000 },
  { canal: "Plantão de vendas", valor: 420_000 },
]

export function ReceitaPorCanal() {
  return (
    <BarChart
      title="Receita por canal de origem"
      orientation="horizontal"
      data={receita}
      category="canal"
      series={[{ key: "valor", label: "Receita" }]}
      formatValue={formatBRL}
      showTable
    />
  )
}
```

## LineChart

`data` (um registro por ponto, em ordem), `x` (a chave do eixo x: categoria ou data ISO `"2026-03"`/`"2026-03-15"`, que vira "mar." e "15 de mar."), `series`, `area` (só com uma série visível), `formatValue`, `formatX`. Um valor `null`/ausente quebra a linha (não vira zero).

```tsx
import { LineChart } from "@amfernandesinc/ui"

const leads = [
  { mes: "2026-01", portais: 120, site: 80 },
  { mes: "2026-02", portais: 135, site: 92 },
  { mes: "2026-03", portais: 128, site: null },
  { mes: "2026-04", portais: 150, site: 110 },
  { mes: "2026-05", portais: 162, site: 118 },
]

export function LeadsPorMes({ carregando }: { carregando: boolean }) {
  return (
    <LineChart
      title="Leads por mês"
      description="Março sem dados do site (migração do formulário)."
      data={leads}
      x="mes"
      series={[
        { key: "portais", label: "Portais" },
        { key: "site", label: "Site" },
      ]}
      loading={carregando}
    />
  )
}
```

## Sparkline e KPI

`Sparkline` é a linha de tendência sem eixos nem tooltip. O `label` é obrigatório e é a única coisa que o leitor de tela recebe: escreva a tendência em palavras.

```tsx
import { Card, Sparkline, Typography, formatBRL } from "@amfernandesinc/ui"

export function KpiVendas({ historico }: { historico: number[] }) {
  const atual = historico[historico.length - 1] ?? 0
  const inicial = historico[0] ?? 0
  return (
    <Card title="Vendas do mês" padding="compact">
      <div className="flex items-end justify-between gap-4">
        <Typography variant="title" as="p" className="tabular-nums">
          {formatBRL(atual)}
        </Typography>
        <Sparkline
          data={historico}
          label={`Vendas dos últimos ${historico.length} meses, de ${formatBRL(inicial)} para ${formatBRL(atual)}`}
        />
      </div>
    </Card>
  )
}
```

## Boas práticas

- O `title` diz o que o gráfico mostra ("Leads por mês"), não "Gráfico 1". A `description` dá contexto (período, fonte, lacunas).
- Um eixo só. Medidas diferentes: dois gráficos lado a lado (`grid gap-4 lg:grid-cols-2`), cada um num `Card padding="compact"` ou `"none"`.
- Dashboard: filtros numa linha acima dos gráficos (`SegmentedControl` para período, `Combobox multiple` para empreendimentos), aplicando a todos.
- Muitos pontos no eixo x: os rótulos se espaçam sozinhos; não gire texto.
- Textos fixos (`keyboardHint`, `empty`, `loading`, `legend`, `category`, `missing`) em `labels` (`defaultChartLabels`).
