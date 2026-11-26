import type { Meta, StoryObj } from "@storybook/react-vite"

import { Card } from "./card"
import { Sparkline } from "./sparkline"

const vendas = [14, 11, 18, 16, 21, 19, 23, 20, 25, 22, 27, 22]

const meta = {
  title: "Data/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Linha de tendência pequena para uma célula de tabela ou um card de métrica: sem eixos e sem tooltip, a linha na cor de apoio e o ponto mais recente em destaque.",
          "",
          "- `data: number[]`, do mais antigo ao mais recente.",
          '- `label` é obrigatório: é tudo o que o leitor de tela recebe, então diga a tendência em palavras ("Vendas dos últimos 12 meses, de 14 para 22").',
          "- `width` e `height` fixos (96 × 28 por padrão). Para ler os valores, use um `LineChart`.",
        ].join("\n"),
      },
    },
  },
  args: {
    data: vendas,
    label: "Vendas dos últimos 12 meses, de 14 para 22, com pico de 27 em novembro",
  },
} satisfies Meta<typeof Sparkline>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InMetricCard: Story = {
  render: (args) => (
    <div className="w-[280px]">
      <Card title="Unidades vendidas" headingLevel={3}>
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-semibold">22</span>
            <span className="text-xs text-muted-foreground">em dezembro</span>
          </div>
          <Sparkline {...args} width={112} height={36} />
        </div>
      </Card>
    </div>
  ),
}

export const InTableCell: Story = {
  render: () => {
    const linhas = [
      { nome: "Residencial Bosque", dados: [8, 7, 10, 9, 12, 11, 13, 12, 14, 13, 15, 17] },
      { nome: "Torre Norte", dados: [4, 3, 5, 5, 6, 5, 7, 5, 7, 6, 8, 9] },
      { nome: "Vila Jardim", dados: [5, 6, 4, 4, 3, 4, 3, 3, 2, 3, 2, 2] },
    ]
    return (
      <table className="text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">
              Empreendimento
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              Vendas em 12 meses
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha.nome} className="border-b">
              <td className="px-3 py-2">{linha.nome}</td>
              <td className="px-3 py-2">
                <Sparkline
                  data={linha.dados}
                  label={`Vendas de ${linha.nome} nos últimos 12 meses, de ${linha.dados[0]} para ${linha.dados[11]}`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  },
}

export const Flat: Story = {
  args: { data: [5, 5, 5, 5, 5, 5], label: "Estoque estável em 5 unidades" },
}

export const Dark: Story = {
  globals: { theme: "Escuro" },
}
