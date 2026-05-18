import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart"

const monthlyRevenue = [
  { month: "Jan", receita: 28500 },
  { month: "Fev", receita: 31200 },
  { month: "Mar", receita: 29800 },
  { month: "Abr", receita: 34600 },
  { month: "Mai", receita: 36900 },
  { month: "Jun", receita: 41200 },
]

const monthlyRevenueConfig = {
  receita: { label: "Receita (R$)", color: "var(--chart-1)" },
} satisfies ChartConfig

const salesByCategory = [
  { categoria: "Jurídico", vendas: 24 },
  { categoria: "Tributário", vendas: 18 },
  { categoria: "Trabalhista", vendas: 12 },
  { categoria: "Contratos", vendas: 21 },
  { categoria: "Compliance", vendas: 9 },
]

const salesByCategoryConfig = {
  vendas: { label: "Vendas", color: "var(--chart-2)" },
} satisfies ChartConfig

const multiSeriesData = [
  { month: "Jan", aprovados: 12, pendentes: 3, recusados: 1 },
  { month: "Fev", aprovados: 18, pendentes: 5, recusados: 2 },
  { month: "Mar", aprovados: 15, pendentes: 2, recusados: 0 },
  { month: "Abr", aprovados: 22, pendentes: 6, recusados: 3 },
  { month: "Mai", aprovados: 19, pendentes: 4, recusados: 1 },
  { month: "Jun", aprovados: 25, pendentes: 5, recusados: 2 },
]

const multiSeriesConfig = {
  aprovados: { label: "Aprovados", color: "var(--chart-1)" },
  pendentes: { label: "Pendentes", color: "var(--chart-2)" },
  recusados: { label: "Recusados", color: "var(--chart-3)" },
} satisfies ChartConfig

const distribution = [
  { categoria: "Jurídico", value: 34, fill: "var(--chart-1)" },
  { categoria: "Tributário", value: 22, fill: "var(--chart-2)" },
  { categoria: "Trabalhista", value: 18, fill: "var(--chart-3)" },
  { categoria: "Contratos", value: 26, fill: "var(--chart-4)" },
]

const distributionConfig = {
  juridico: { label: "Jurídico", color: "var(--chart-1)" },
  tributario: { label: "Tributário", color: "var(--chart-2)" },
  trabalhista: { label: "Trabalhista", color: "var(--chart-3)" },
  contratos: { label: "Contratos", color: "var(--chart-4)" },
} satisfies ChartConfig

const areaData = [
  { month: "Jan", entradas: 12000, saidas: 8400 },
  { month: "Fev", entradas: 18000, saidas: 9600 },
  { month: "Mar", entradas: 15500, saidas: 11200 },
  { month: "Abr", entradas: 22000, saidas: 13800 },
  { month: "Mai", entradas: 24500, saidas: 14100 },
  { month: "Jun", entradas: 28000, saidas: 15400 },
]

const areaConfig = {
  entradas: { label: "Entradas", color: "var(--chart-1)" },
  saidas: { label: "Saídas", color: "var(--chart-3)" },
} satisfies ChartConfig

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

const meta = {
  title: "Data/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Wrapper de [recharts](https://recharts.org) que padroniza container, tooltip e legend ao DS. Compose qualquer chart de recharts (`BarChart`, `LineChart`, `AreaChart`, `PieChart`, etc.) dentro do `<ChartContainer config={...}>`.",
          "",
          "**Composição:**",
          "- `ChartContainer` — wrapper responsivo (`ResponsiveContainer` por dentro). Recebe `config: ChartConfig` que mapeia cada `dataKey` para `{ label, color, icon? }` e injeta as cores como CSS variables (`--color-<key>`) escopadas ao chart.",
          "- `ChartTooltip` — re-export do `Tooltip` do recharts; passe `content={<ChartTooltipContent />}` para renderizar o tooltip do DS.",
          "- `ChartTooltipContent` — tooltip padronizado com label, indicador colorido e formatação coerente ao tema.",
          "- `ChartLegend` / `ChartLegendContent` — legenda integrada ao `config`.",
          "",
          "**Cores:** use `var(--chart-1)` a `var(--chart-5)` (tokens do DS) ou referencie via `var(--color-<dataKey>)` quando a chave estiver no `config`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          "import {",
          "  type ChartConfig,",
          "  ChartContainer,",
          "  ChartTooltip,",
          "  ChartTooltipContent,",
          '} from "@am-fernandes/ui"',
          'import { Bar, BarChart, XAxis } from "recharts"',
          "",
          "const config = {",
          '  receita: { label: "Receita", color: "var(--chart-1)" },',
          "} satisfies ChartConfig",
          "",
          "<ChartContainer config={config}>",
          "  <BarChart data={data}>",
          '    <XAxis dataKey="month" />',
          "    <ChartTooltip content={<ChartTooltipContent />} />",
          '    <Bar dataKey="receita" fill="var(--color-receita)" />',
          "  </BarChart>",
          "</ChartContainer>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    config: {
      control: false,
      description:
        "Mapa `dataKey -> { label, color, icon? }` que injeta `--color-<key>` no escopo do container.",
      table: { type: { summary: "ChartConfig" } },
    },
    className: {
      control: "text",
      description: "Classes extras aplicadas ao wrapper.",
      table: { type: { summary: "string" } },
    },
    id: {
      control: "text",
      description: "ID estável (usado para escopar as CSS variables). Default: gerado via `useId`.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof ChartContainer>

export default meta
// Use the component type (not `typeof meta`) so `render`-only stories don't need `args`.
type Story = StoryObj<typeof ChartContainer>

export const LineChartStory: Story = {
  name: "LineChart",
  render: () => (
    <div className="h-[280px] w-[520px]">
      <ChartContainer config={monthlyRevenueConfig}>
        <LineChart data={monthlyRevenue} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickFormatter={(v) => brl.format(Number(v))} width={80} />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => brl.format(Number(value))} />}
          />
          <Line
            type="monotone"
            dataKey="receita"
            stroke="var(--color-receita)"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Linha simples mostrando receita por mês. Tooltip e eixo Y são formatados como BRL via `Intl.NumberFormat`.",
      },
    },
  },
}

export const BarChartStory: Story = {
  name: "BarChart",
  render: () => (
    <div className="h-[280px] w-[520px]">
      <ChartContainer config={salesByCategoryConfig}>
        <BarChart data={salesByCategory} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="categoria" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="vendas" fill="var(--color-vendas)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Barras verticais simples — vendas por categoria. `radius={[6, 6, 0, 0]}` arredonda só o topo.",
      },
    },
  },
}

export const AreaChartStory: Story = {
  name: "AreaChart",
  render: () => (
    <div className="h-[280px] w-[520px]">
      <ChartContainer config={areaConfig}>
        <AreaChart data={areaData} margin={{ left: 12, right: 12 }}>
          <defs>
            <linearGradient id="fillEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-entradas)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-entradas)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-saidas)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-saidas)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickFormatter={(v) => brl.format(Number(v))} width={80} />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => brl.format(Number(value))} />}
          />
          <Area
            type="monotone"
            dataKey="entradas"
            stroke="var(--color-entradas)"
            fill="url(#fillEntradas)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="saidas"
            stroke="var(--color-saidas)"
            fill="url(#fillSaidas)"
            strokeWidth={2}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Área dupla (entradas vs. saídas) com gradiente vertical custom. Inclui `ChartLegend` no rodapé.",
      },
    },
  },
}

export const PieChartStory: Story = {
  name: "PieChart",
  render: () => (
    <div className="h-[320px] w-[420px]">
      <ChartContainer config={distributionConfig}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="categoria" hideLabel />} />
          <Pie
            data={distribution}
            dataKey="value"
            nameKey="categoria"
            innerRadius={60}
            outerRadius={100}
            strokeWidth={2}
          >
            {distribution.map((entry) => (
              <Cell key={entry.categoria} fill={entry.fill} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="categoria" />} />
        </PieChart>
      </ChartContainer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Donut chart com legenda. `nameKey="categoria"` instrui o tooltip/legend a usarem essa propriedade como chave.',
      },
    },
  },
}

export const MultiSeries: Story = {
  render: () => (
    <div className="h-[320px] w-[560px]">
      <ChartContainer config={multiSeriesConfig}>
        <LineChart data={multiSeriesData} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="aprovados"
            stroke="var(--color-aprovados)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="pendentes"
            stroke="var(--color-pendentes)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="recusados"
            stroke="var(--color-recusados)"
            strokeWidth={2}
            dot={false}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      </ChartContainer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Três séries simultâneas — cada `Line` lê a cor de `var(--color-<dataKey>)` injetada pelo `config`.",
      },
    },
  },
}

export const CustomTooltip: Story = {
  render: () => (
    <div className="h-[280px] w-[520px]">
      <ChartContainer config={monthlyRevenueConfig}>
        <BarChart data={monthlyRevenue} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickFormatter={(v) => brl.format(Number(v))} width={80} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(label) => `Mês: ${String(label)}`}
                formatter={(value, name) => (
                  <span className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">{String(name)}</span>
                    <span className="font-mono font-medium">{brl.format(Number(value))}</span>
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="receita" fill="var(--color-receita)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`ChartTooltipContent` aceita `indicator`, `labelFormatter` e `formatter` para customizar o conteúdo sem perder o estilo do DS.",
      },
    },
  },
}

export const Empty: Story = {
  render: () => (
    <div className="flex h-[280px] w-[520px] items-center justify-center rounded-md border border-dashed bg-muted/30 p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-medium text-sm">Sem dados para exibir</span>
        <p className="text-muted-foreground text-xs">
          Nenhum dado encontrado para o período selecionado. Ajuste os filtros e tente novamente.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Estado vazio recomendado quando o array de dados está vazio: substitua o `ChartContainer` por um placeholder com mensagem clara em vez de renderizar um chart em branco.",
      },
    },
  },
}
