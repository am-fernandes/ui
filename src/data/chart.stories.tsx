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
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"

const data = [
  { month: "Jan", aprovados: 12, pendentes: 3 },
  { month: "Fev", aprovados: 18, pendentes: 5 },
  { month: "Mar", aprovados: 15, pendentes: 2 },
  { month: "Abr", aprovados: 22, pendentes: 6 },
  { month: "Mai", aprovados: 19, pendentes: 4 },
]

const config = {
  aprovados: { label: "Aprovados", color: "var(--chart-1)" },
  pendentes: { label: "Pendentes", color: "var(--chart-2)" },
} satisfies ChartConfig

const distribuicao = [
  { categoria: "Jurídico", value: 34, fill: "var(--chart-1)" },
  { categoria: "Tributário", value: 22, fill: "var(--chart-2)" },
  { categoria: "Trabalhista", value: 18, fill: "var(--chart-3)" },
  { categoria: "Contratos", value: 26, fill: "var(--chart-4)" },
]

const distribuicaoConfig = {
  juridico: { label: "Jurídico", color: "var(--chart-1)" },
  tributario: { label: "Tributário", color: "var(--chart-2)" },
  trabalhista: { label: "Trabalhista", color: "var(--chart-3)" },
  contratos: { label: "Contratos", color: "var(--chart-4)" },
} satisfies ChartConfig

const radialData = [{ name: "Meta", value: 78, fill: "var(--chart-1)" }]

const radialConfig = {
  value: { label: "Progresso", color: "var(--chart-1)" },
} satisfies ChartConfig

const meta = {
  title: "Data/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Wrapper de [recharts](https://recharts.org) que padroniza container, tooltip e legend ao DS. Compose qualquer chart de recharts (BarChart, LineChart, AreaChart, PieChart, RadialBarChart...) dentro do `<ChartContainer config={...}>`. Use `var(--chart-1)` a `var(--chart-5)` ou `var(--color-<dataKey>)` mapeado via `config` para cores.",
      },
    },
  },
  args: {
    config,
    children: <div />,
  },
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

export const BarChartStory: Story = {
  name: "BarChart",
  render: () => (
    <div className="w-[480px] h-[280px]">
      <ChartContainer config={config}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="aprovados" fill="var(--color-aprovados)" radius={4} />
          <Bar dataKey="pendentes" fill="var(--color-pendentes)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  ),
}

export const LineChartStory: Story = {
  name: "LineChart",
  render: () => (
    <div className="w-[480px] h-[280px]">
      <ChartContainer config={config}>
        <LineChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
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
        </LineChart>
      </ChartContainer>
    </div>
  ),
}

export const AreaChartStory: Story = {
  name: "AreaChart",
  render: () => (
    <div className="w-[480px] h-[280px]">
      <ChartContainer config={config}>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="aprovados"
            stackId="1"
            stroke="var(--color-aprovados)"
            fill="var(--color-aprovados)"
            fillOpacity={0.4}
          />
          <Area
            type="monotone"
            dataKey="pendentes"
            stackId="1"
            stroke="var(--color-pendentes)"
            fill="var(--color-pendentes)"
            fillOpacity={0.4}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  ),
}

export const PieChartStory: Story = {
  name: "PieChart",
  render: () => (
    <div className="w-[480px] h-[280px]">
      <ChartContainer config={distribuicaoConfig}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="categoria" hideLabel />} />
          <Pie data={distribuicao} dataKey="value" nameKey="categoria" innerRadius={50}>
            {distribuicao.map((entry) => (
              <Cell key={entry.categoria} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  ),
}

export const RadialBarChartStory: Story = {
  name: "RadialBarChart",
  render: () => (
    <div className="w-[480px] h-[280px]">
      <ChartContainer config={radialConfig}>
        <RadialBarChart
          data={radialData}
          startAngle={90}
          endAngle={-270}
          innerRadius={80}
          outerRadius={120}
        >
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <RadialBar dataKey="value" background cornerRadius={8} />
        </RadialBarChart>
      </ChartContainer>
    </div>
  ),
}
