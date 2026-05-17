import type { Meta, StoryObj } from "@storybook/react-vite"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

const meta = {
  title: "Data/Chart",
  component: ChartContainer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    config,
    children: <div />,
  },
} satisfies Meta<typeof ChartContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
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
