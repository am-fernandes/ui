import type { Meta, StoryObj } from "@storybook/react-vite"

import { BarChart } from "./bar-chart"

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value)

const meses = [
  "jan.",
  "fev.",
  "mar.",
  "abr.",
  "mai.",
  "jun.",
  "jul.",
  "ago.",
  "set.",
  "out.",
  "nov.",
  "dez.",
]

const vendasPorMes = meses.map((mes, i) => ({
  mes,
  unidades: [14, 11, 18, 16, 21, 19, 23, 20, 25, 22, 27, 31][i] ?? 0,
}))

const vendasPorTrimestre = [
  { trimestre: "1º tri", bosque: 42, torre: 31, vila: 18 },
  { trimestre: "2º tri", bosque: 38, torre: 36, vila: 24 },
  { trimestre: "3º tri", bosque: 45, torre: 29, vila: 30 },
  { trimestre: "4º tri", bosque: 51, torre: 40, vila: 27 },
]

const leadsPorCanal = meses.slice(0, 6).map((mes, i) => ({
  mes,
  site: [120, 134, 150, 141, 162, 175][i] ?? 0,
  portais: [210, 198, 226, 240, 231, 255][i] ?? 0,
  indicacao: [45, 52, 48, 61, 58, 66][i] ?? 0,
  redes: [80, 92, 101, 97, 115, 124][i] ?? 0,
}))

const canais = [
  { canal: "Portais imobiliários (Zap, Viva Real, OLX)", leads: 1360 },
  { canal: "Site da incorporadora", leads: 882 },
  { canal: "Redes sociais", leads: 609 },
  { canal: "Indicação de corretor parceiro", leads: 330 },
  { canal: "Plantão de vendas", leads: 214 },
]

const saldoPropostas = [
  { empreendimento: "Residencial Bosque", saldo: 12 },
  { empreendimento: "Torre Norte", saldo: -5 },
  { empreendimento: "Vila Jardim", saldo: 8 },
  { empreendimento: "Parque das Águas", saldo: -9 },
  { empreendimento: "Mirante Sul", saldo: 3 },
]

const propostas = meses.slice(0, 6).map((mes, i) => ({
  mes,
  aprovadas: [18, 22, 19, 25, 28, 24][i] ?? 0,
  recusadas: [-6, -4, -9, -5, -7, -3][i] ?? 0,
}))

const seisEmpreendimentos = [
  { trimestre: "1º tri", a: 42, b: 31, c: 18, d: 26, e: 12, f: 22 },
  { trimestre: "2º tri", a: 38, b: 36, c: 24, d: 30, e: 15, f: 19 },
  { trimestre: "3º tri", a: 45, b: 29, c: 30, d: 27, e: 18, f: 25 },
]

const meta = {
  title: "Data/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Gráfico de barras em SVG, sem dependência: compara quantidades entre categorias (vendas por mês, leads por canal).",
          "",
          '- `data` (um registro por categoria), `category` (a chave do nome da categoria) e `series: { key, label, color? }[]`, até seis. As séries pegam `--chart-1`, `--chart-2`… nesta ordem; uma sétima é erro de desenvolvimento (agrupe em "Outros").',
          "- A cor é da série: ocultar uma na legenda não repinta as outras. Se a lista de séries muda entre renders, fixe `color` (1–6).",
          '- `orientation="horizontal"` para nomes longos; `stacked` empilha (negativos para baixo). Valores negativos crescem a partir da linha do zero.',
          "- Duas séries ou mais têm legenda, cujos itens mostram e ocultam a série; uma série não tem (o título já diz o que é).",
          '- `formatValue` formata dinheiro e unidades no tooltip e na tabela; os eixos ficam compactos ("10 mil", "1,5 mi").',
          "- Passar o mouse ou percorrer com as setas mostra o tooltip da categoria. A tabela com os mesmos números está sempre lá para o leitor de tela; `showTable` a mostra.",
          "- `title` é obrigatório: é o nome acessível. `loading`, `emptyMessage` e `labels` como nos outros componentes.",
        ].join("\n"),
      },
    },
  },
  args: {
    title: "Unidades vendidas por mês",
    description: "Todos os empreendimentos, 2026.",
    data: vendasPorMes,
    category: "mes",
    series: [{ key: "unidades", label: "Unidades" }],
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarChart>
export default meta
type Story = StoryObj<typeof meta>

export const SingleSeries: Story = {}

export const SeveralSeries: Story = {
  args: {
    title: "Vendas por empreendimento",
    description: "Unidades vendidas por trimestre.",
    data: vendasPorTrimestre,
    category: "trimestre",
    series: [
      { key: "bosque", label: "Residencial Bosque" },
      { key: "torre", label: "Torre Norte" },
      { key: "vila", label: "Vila Jardim" },
    ],
  },
}

export const Stacked: Story = {
  args: {
    title: "Leads por canal",
    description: "Leads recebidos por mês, 1º semestre.",
    data: leadsPorCanal,
    category: "mes",
    stacked: true,
    series: [
      { key: "portais", label: "Portais" },
      { key: "site", label: "Site" },
      { key: "redes", label: "Redes sociais" },
      { key: "indicacao", label: "Indicação" },
    ],
  },
}

export const Horizontal: Story = {
  args: {
    title: "Leads por canal de origem",
    description: "1º semestre de 2026.",
    data: canais,
    category: "canal",
    orientation: "horizontal",
    series: [{ key: "leads", label: "Leads" }],
  },
}

export const NegativeValues: Story = {
  args: {
    title: "Saldo de propostas por empreendimento",
    description: "Aprovadas menos canceladas, no mês.",
    data: saldoPropostas,
    category: "empreendimento",
    series: [{ key: "saldo", label: "Saldo" }],
  },
}

export const ApprovedVersusRefused: Story = {
  name: "Stacked with negatives",
  args: {
    title: "Propostas aprovadas e recusadas",
    description: "Recusadas abaixo do zero.",
    data: propostas,
    category: "mes",
    stacked: true,
    series: [
      { key: "aprovadas", label: "Aprovadas" },
      { key: "recusadas", label: "Recusadas" },
    ],
  },
}

export const Money: Story = {
  args: {
    title: "VGV vendido por trimestre",
    description: "Valor geral de vendas, em reais.",
    data: vendasPorTrimestre.map((t) => ({
      trimestre: t.trimestre,
      vgv: t.bosque * 412_000 + t.torre * 655_000 + t.vila * 298_000,
    })),
    category: "trimestre",
    series: [{ key: "vgv", label: "VGV" }],
    formatValue: brl,
  },
}

export const WithTable: Story = {
  args: {
    ...SeveralSeries.args,
    showTable: true,
  },
}

export const SixSeries: Story = {
  args: {
    title: "Vendas dos seis empreendimentos",
    data: seisEmpreendimentos,
    category: "trimestre",
    series: [
      { key: "a", label: "Residencial Bosque" },
      { key: "b", label: "Torre Norte" },
      { key: "c", label: "Vila Jardim" },
      { key: "d", label: "Parque das Águas" },
      { key: "e", label: "Mirante Sul" },
      { key: "f", label: "Solar do Lago" },
    ],
  },
}

export const Loading: Story = {
  args: { loading: true },
}

export const Empty: Story = {
  args: {
    data: [],
    emptyMessage: "Nenhuma venda no período. Mude o filtro de datas.",
  },
}

export const Dark: Story = {
  args: { ...SeveralSeries.args },
  globals: { theme: "Escuro" },
}
