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
        component: [
          "Tabela rica baseada em [`@tanstack/react-table`](https://tanstack.com/table/latest) e nos primitives `Table*` do DS. Suporta busca global escopada (`searchableColumns`), ordenação por coluna (toggle no header) e paginação opcional.",
          "",
          "**Props:**",
          "- `columns: ColumnDef<TData>[]` — definição das colunas (tipo do `@tanstack/react-table`).",
          "- `data: TData[]` — array de linhas. `TData` é o seu tipo de domínio.",
          "- `searchableColumns?: string[]` — `accessorKey`s das colunas incluídas na busca global. Sem isso, o campo de busca não aparece.",
          "- `searchPlaceholder?: string` — placeholder do input de busca (default `Buscar...`).",
          "- `emptyMessage?: ReactNode` — conteúdo exibido quando `data` filtrado fica vazio (default `Nenhum resultado.`).",
          "- `pagination?: { pageSize?: number }` — habilita paginação; quando omitido, todas as linhas são renderizadas.",
          "- `showRowCount?: boolean` — mostra a contagem de registros no footer (`12 registros` ou `5 de 12 registros` quando filtrado). Default `false`.",
          "- `className?: string` — classes extras no wrapper externo.",
          "",
          "### Como definir colunas",
          "",
          "Cada item de `columns` é um `ColumnDef<TData>` do `@tanstack/react-table`. Os campos mais usados:",
          "",
          "```tsx",
          'import type { ColumnDef } from "@tanstack/react-table"',
          "",
          "type Contrato = { numero: string; cliente: string; valor: number; status: string }",
          "",
          "const columns: ColumnDef<Contrato>[] = [",
          "  // 1. Coluna básica — apenas mapeia a chave do objeto para o header.",
          '  { accessorKey: "numero", header: "Número" },',
          "",
          "  // 2. Cell customizado — recebe `row.original` (a linha tipada) e retorna ReactNode.",
          "  {",
          '    accessorKey: "valor",',
          '    header: "Valor",',
          "    cell: ({ row }) =>",
          '      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(',
          "        row.original.valor,",
          "      ),",
          "  },",
          "",
          "  // 3. Desabilitar ordenação em uma coluna específica.",
          "  //    O header NÃO vira botão clicável e o ícone de sort some.",
          "  {",
          '    accessorKey: "status",',
          '    header: "Status",',
          "    enableSorting: false,",
          "    cell: ({ row }) => <Badge>{row.original.status}</Badge>,",
          "  },",
          "]",
          "```",
          "",
          "Por padrão **todas as colunas são ordenáveis** — o usuário clica no header para alternar entre asc / desc / sem ordenação. Para travar uma coluna (ex.: ações, badges, colunas sem ordem natural), defina `enableSorting: false` na column def. Outros campos úteis do `ColumnDef`: `id`, `accessorFn`, `enableHiding`, `meta`. Consulte a [API do TanStack Table](https://tanstack.com/table/latest/docs/api/core/column-def) para a referência completa.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    columns: {
      control: false,
      description:
        "Definições de coluna do `@tanstack/react-table`. Use `enableSorting: false` para travar a ordenação em colunas específicas.",
      table: { type: { summary: "ColumnDef<TData>[]" } },
    },
    data: {
      control: false,
      description: "Array de linhas tipadas como `TData`.",
      table: { type: { summary: "TData[]" } },
    },
    searchableColumns: {
      control: "object",
      description:
        "`accessorKey`s das colunas incluídas na busca global. Quando omitido, o input de busca não é renderizado.",
      table: { type: { summary: "string[]" } },
    },
    searchPlaceholder: {
      control: "text",
      description: "Placeholder do input de busca.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'Buscar...'" },
      },
    },
    emptyMessage: {
      control: "text",
      description: "Conteúdo exibido quando o resultado filtrado fica vazio.",
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "'Nenhum resultado.'" },
      },
    },
    pagination: {
      control: "object",
      description:
        "Habilita paginação com tamanho de página configurável. Omita para listar todas as linhas.",
      table: { type: { summary: "{ pageSize?: number }" } },
    },
    showRowCount: {
      control: "boolean",
      description:
        "Mostra a contagem de registros no footer. Se houver filtro ativo, exibe `<filtrados> de <total> registros`.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    className: {
      control: "text",
      description: "Classes extras no wrapper externo.",
      table: { type: { summary: "string" } },
    },
  },
  args: {
    columns: columns as ColumnDef<unknown>[],
    data: contratos as unknown[],
  },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    columns: columns as ColumnDef<unknown>[],
    data: contratos as unknown[],
    searchableColumns: ["numero", "cliente"],
    searchPlaceholder: "Buscar por número ou cliente...",
    emptyMessage: "Nenhum resultado.",
    pagination: { pageSize: 5 },
    showRowCount: true,
  },
  render: (args) => (
    <div className="p-6">
      <DataTable {...args} />
    </div>
  ),
}

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

export const WithRowCount: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos}
        searchableColumns={["numero", "cliente"]}
        showRowCount
      />
    </div>
  ),
}

export const WithRowCountAndPagination: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos}
        searchableColumns={["numero", "cliente"]}
        pagination={{ pageSize: 5 }}
        showRowCount
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
