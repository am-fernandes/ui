import type { Meta, StoryObj } from "@storybook/react-vite"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

const meta = {
  title: "Data/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Primitives de tabela (`Table`, `TableHeader`, `TableRow`, `TableCell`, etc.) para uso direto. Para tabelas com sort/search, prefira `DataTable`.",
      },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const invoices = [
  { numero: "INV-001", cliente: "Cliente A", vencimento: "30/05/2026", valor: "R$ 1.200,00" },
  { numero: "INV-002", cliente: "Cliente B", vencimento: "02/06/2026", valor: "R$ 3.450,00" },
  { numero: "INV-003", cliente: "Cliente C", vencimento: "10/06/2026", valor: "R$ 780,00" },
  { numero: "INV-004", cliente: "Cliente D", vencimento: "15/06/2026", valor: "R$ 5.000,00" },
]

export const Default: Story = {
  render: () => (
    <div className="w-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.numero}>
              <TableCell className="font-medium">{invoice.numero}</TableCell>
              <TableCell>{invoice.cliente}</TableCell>
              <TableCell>{invoice.vencimento}</TableCell>
              <TableCell>{invoice.valor}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}
