import type { Meta, StoryObj } from "@storybook/react-vite"

import { LineChart } from "./line-chart"

const meses2026 = Array.from({ length: 12 }, (_, i) => `2026-${String(i + 1).padStart(2, "0")}`)

const vendas = meses2026.map((mes, i) => ({
  mes,
  unidades: [14, 11, 18, 16, 21, 19, 23, 20, 25, 22, 27, 31][i] ?? 0,
}))

const porEmpreendimento = meses2026.map((mes, i) => ({
  mes,
  bosque: [8, 7, 10, 9, 12, 11, 13, 12, 14, 13, 15, 17][i] ?? 0,
  torre: [4, 3, 5, 5, 6, 5, 7, 5, 7, 6, 8, 9][i] ?? 0,
  vila: [2, 1, 3, 2, 3, 3, 3, 3, 4, 3, 4, 5][i] ?? 0,
}))

const leads = meses2026.slice(0, 9).map((mes, i) => ({
  mes,
  site: [120, 134, 150, 141, 162, 175, 168, 181, 190][i] ?? 0,
  portais: [210, 198, 226, 240, 231, 255, 262, 249, 270][i] ?? 0,
  indicacao: [45, 52, 48, 61, 58, 66, 70, 64, 72][i] ?? 0,
  redes: [80, 92, 101, 97, 115, 124, 118, 131, 140][i] ?? 0,
  plantao: [30, 28, 35, 33, 31, 38, 36, 40, 42][i] ?? 0,
  outros: [12, 15, 11, 14, 16, 13, 18, 17, 15][i] ?? 0,
}))

// The portal integration was down in April and May: no data, not zero.
const comFalhas = meses2026.slice(0, 9).map((mes, i) => ({
  mes,
  portais: [210, 198, 226, null, null, 255, 262, null, 270][i] ?? null,
}))

const precoMedio = meses2026.slice(0, 8).map((mes, i) => ({
  mes,
  preco: [8_950, 9_020, 9_110, 9_080, 9_240, 9_310, 9_390, 9_460][i] ?? 0,
}))

const brlM2 = (value: number) =>
  `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value)}/m²`

const meta = {
  title: "Data/LineChart",
  component: LineChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Gráfico de linhas em SVG, sem dependência: a evolução de uma ou mais medidas no tempo.",
          "",
          '- `data` (um registro por ponto, em ordem), `x` (a chave do eixo: categoria ou data ISO, `"2026-03"`) e `series: { key, label, color? }[]`, até seis, nas cores `--chart-1`…`--chart-6` nesta ordem.',
          "- Um ponto `null` interrompe a linha: dado que falta não é zero.",
          "- `area` preenche sob a linha com um véu de 10%, só com uma série visível.",
          "- Com duas a quatro séries, o nome vai no fim de cada linha (quando os fins não se encostam); a legenda está sempre lá e mostra ou oculta séries.",
          "- Uma linha vertical acompanha o ponteiro até o x mais próximo, com um tooltip de todas as séries naquele ponto; as setas fazem o mesmo pelo teclado.",
          '- `formatValue` e `formatX` formatam valores e o eixo x (meses ISO viram `"mar."`). A tabela com os números está sempre lá para o leitor de tela; `showTable` a mostra.',
        ].join("\n"),
      },
    },
  },
  args: {
    title: "Unidades vendidas",
    description: "Todos os empreendimentos, por mês de 2026.",
    data: vendas,
    x: "mes",
    series: [{ key: "unidades", label: "Unidades" }],
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineChart>
export default meta
type Story = StoryObj<typeof meta>

export const SingleSeries: Story = {}

export const Area: Story = {
  args: { area: true },
}

export const SeveralSeries: Story = {
  args: {
    title: "Vendas por empreendimento",
    description: "Unidades vendidas por mês.",
    data: porEmpreendimento,
    series: [
      { key: "bosque", label: "Residencial Bosque" },
      { key: "torre", label: "Torre Norte" },
      { key: "vila", label: "Vila Jardim" },
    ],
  },
}

export const MissingPoints: Story = {
  args: {
    title: "Leads dos portais",
    description: "Sem dados em abril, maio e agosto: a integração esteve fora do ar.",
    data: comFalhas,
    series: [{ key: "portais", label: "Portais" }],
  },
}

export const SixSeries: Story = {
  args: {
    title: "Leads por canal",
    description: "Com seis séries, a legenda e o tooltip dão os nomes.",
    data: leads,
    series: [
      { key: "portais", label: "Portais" },
      { key: "site", label: "Site" },
      { key: "redes", label: "Redes sociais" },
      { key: "indicacao", label: "Indicação" },
      { key: "plantao", label: "Plantão" },
      { key: "outros", label: "Outros" },
    ],
  },
}

export const Money: Story = {
  args: {
    title: "Preço médio do m²",
    description: "Lançamentos na região, 2026.",
    data: precoMedio,
    series: [{ key: "preco", label: "Preço do m²" }],
    formatValue: brlM2,
  },
}

export const WithTable: Story = {
  args: {
    ...SeveralSeries.args,
    showTable: true,
    labels: { category: "Mês" },
  },
}

export const Loading: Story = {
  args: { loading: true },
}

export const Empty: Story = {
  args: { data: [], emptyMessage: "Nenhuma venda no período." },
}

export const Dark: Story = {
  args: { ...SeveralSeries.args },
  globals: { theme: "Escuro" },
}
