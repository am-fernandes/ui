import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "../primitives/badge"
import { DataTable } from "./data-table"

interface Contrato {
  numero: string
  cliente: string
  vencimento: string
  valor: number
  status: "aprovado" | "pendente" | "vencido"
}

const contratos: Contrato[] = [
  {
    numero: "C-2026-001",
    cliente: "Empresa A",
    vencimento: "2026-06-15",
    valor: 12000,
    status: "aprovado",
  },
  {
    numero: "C-2026-002",
    cliente: "Empresa B",
    vencimento: "2026-06-20",
    valor: 8500,
    status: "pendente",
  },
  {
    numero: "C-2026-003",
    cliente: "Empresa C",
    vencimento: "2026-05-10",
    valor: 22000,
    status: "vencido",
  },
  {
    numero: "C-2026-004",
    cliente: "Empresa D",
    vencimento: "2026-07-01",
    valor: 5400,
    status: "aprovado",
  },
  {
    numero: "C-2026-005",
    cliente: "Empresa E",
    vencimento: "2026-07-10",
    valor: 17800,
    status: "pendente",
  },
  {
    numero: "C-2026-006",
    cliente: "Empresa F",
    vencimento: "2026-08-01",
    valor: 9300,
    status: "aprovado",
  },
  {
    numero: "C-2026-007",
    cliente: "Empresa G",
    vencimento: "2026-08-15",
    valor: 31000,
    status: "pendente",
  },
  {
    numero: "C-2026-008",
    cliente: "Empresa H",
    vencimento: "2026-08-20",
    valor: 14200,
    status: "aprovado",
  },
  {
    numero: "C-2026-009",
    cliente: "Empresa I",
    vencimento: "2026-08-25",
    valor: 7600,
    status: "vencido",
  },
  {
    numero: "C-2026-010",
    cliente: "Empresa J",
    vencimento: "2026-09-01",
    valor: 19500,
    status: "aprovado",
  },
  {
    numero: "C-2026-011",
    cliente: "Empresa K",
    vencimento: "2026-09-05",
    valor: 4800,
    status: "pendente",
  },
  {
    numero: "C-2026-012",
    cliente: "Empresa L",
    vencimento: "2026-09-10",
    valor: 27300,
    status: "aprovado",
  },
  {
    numero: "C-2026-013",
    cliente: "Empresa M",
    vencimento: "2026-09-15",
    valor: 11100,
    status: "pendente",
  },
  {
    numero: "C-2026-014",
    cliente: "Empresa N",
    vencimento: "2026-09-20",
    valor: 6700,
    status: "vencido",
  },
  {
    numero: "C-2026-015",
    cliente: "Empresa O",
    vencimento: "2026-09-25",
    valor: 23400,
    status: "aprovado",
  },
]

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

const columns: ColumnDef<Contrato>[] = [
  { accessorKey: "numero", header: "Número" },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "vencimento", header: "Vencimento" },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => brl.format(row.original.valor),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const variant =
        row.original.status === "aprovado"
          ? "default"
          : row.original.status === "vencido"
            ? "destructive"
            : "secondary"
      return <Badge variant={variant}>{row.original.status}</Badge>
    },
  },
]

const meta = {
  title: "Data/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tabela rica baseada em `@tanstack/react-table` e nos primitives `Table*` do DS. Suporta busca global por colunas predefinidas (`searchableColumns`) e ordenação por coluna (toggle no header — `enableSorting: false` na column def para desligar).",
      },
    },
  },
  args: {
    columns: columns as ColumnDef<unknown>[],
    data: contratos as unknown[],
  },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <DataTable columns={columns} data={contratos} />
    </div>
  ),
}

export const Searchable: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos}
        searchableColumns={["numero", "cliente"]}
        searchPlaceholder="Buscar por número ou cliente..."
      />
    </div>
  ),
}

export const WithPagination: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos}
        searchableColumns={["numero", "cliente"]}
        pagination={{ pageSize: 5 }}
      />
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={[]}
        searchableColumns={["numero", "cliente"]}
        emptyMessage="Nenhum contrato cadastrado."
      />
    </div>
  ),
}
