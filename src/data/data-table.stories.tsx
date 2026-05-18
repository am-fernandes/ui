import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table"
import { useState } from "react"

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
          "Tabela rica baseada em [`@tanstack/react-table`](https://tanstack.com/table/latest) e nos primitives `Table*` do DS. Suporta busca global escopada (`searchableColumns`), ordenação por coluna, paginação opcional e props controladas para uso server-side.",
          "",
          "**Props:**",
          "- `columns: ColumnDef<TData>[]` — definição das colunas (tipo do `@tanstack/react-table`).",
          "- `data: TData[]` — array de linhas. `TData` é o seu tipo de domínio.",
          "- `searchableColumns?: string[]` — `accessorKey`s das colunas incluídas na busca global. Sem isso, o campo de busca não aparece.",
          "- `searchPlaceholder?: string` — placeholder do input de busca (default `Buscar...`).",
          "- `emptyMessage?: ReactNode` — conteúdo exibido quando `data` filtrado fica vazio (default `Nenhum resultado.`).",
          "- `pagination?: { pageSize?: number }` — habilita paginação.",
          "- `showRowCount?: boolean` — mostra a contagem de registros no footer.",
          "- `sorting` / `onSortingChange` — sorting controlado.",
          "- `globalFilter` / `onGlobalFilterChange` — filtro de busca controlado.",
          "- `pageIndex` / `onPaginationChange` / `pageCount` / `manualPagination` — paginação server-side.",
          "- `labels?: { search?, empty?, rowCount?(filtered, total) => string }` — sobrescreve os textos default.",
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
          "  {",
          '    accessorKey: "status",',
          '    header: "Status",',
          "    enableSorting: false,",
          "    cell: ({ row }) => <Badge>{row.original.status}</Badge>,",
          "  },",
          "]",
          "```",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { DataTable } from "@am-fernandes/ui"',
          'import type { ColumnDef } from "@tanstack/react-table"',
          "",
          "<DataTable",
          "  columns={columns}",
          "  data={contratos}",
          '  searchableColumns={["numero", "cliente"]}',
          "  pagination={{ pageSize: 10 }}",
          "  showRowCount",
          "/>",
          "```",
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
    manualPagination: {
      control: "boolean",
      description: "Pagina é controlada externamente (server-side). Exige `pageCount`.",
      table: { type: { summary: "boolean" } },
    },
    labels: {
      control: false,
      description:
        "Sobrescreve os textos default: `{ search?, empty?, rowCount?(filtered, total) => string }`.",
      table: { type: { summary: "DataTableLabels" } },
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

export const Default: Story = {
  render: () => (
    <div className="p-6">
      <DataTable columns={columns} data={contratos.slice(0, 10)} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "10 linhas, sem busca, sem paginação. Cabeçalhos ordenáveis por padrão.",
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: "Input de busca aparece automaticamente quando `searchableColumns` é definido.",
      },
    },
  },
}

export const Paginated: Story = {
  render: () => (
    <div className="p-6">
      <DataTable columns={columns} data={contratos} pagination={{ pageSize: 5 }} showRowCount />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Paginação com 5 linhas por página + contagem no footer.",
      },
    },
  },
}

export const Sortable: Story = {
  render: () => (
    <div className="p-6">
      <DataTable columns={columns} data={contratos.slice(0, 8)} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Clique no header para alternar entre `asc` / `desc` / sem ordenação. Status tem `enableSorting: false` na column def — header continua sendo texto puro.",
      },
    },
  },
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
  parameters: {
    docs: {
      description: {
        story: "`emptyMessage` é exibido quando o data array vai a zero (ou após filtro).",
      },
    },
  },
}

export const ServerSide: Story = {
  render: () => {
    function Wrapper() {
      const pageSize = 5
      const [pageIndex, setPageIndex] = useState(0)
      const total = contratos.length
      const pageCount = Math.ceil(total / pageSize)
      const visible = contratos.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      return (
        <div className="space-y-2 p-6">
          <p className="text-muted-foreground text-xs">
            Server-side: `manualPagination` ON, `pageCount={pageCount}` controla o total de páginas.
            Página atual: <strong className="text-foreground">{pageIndex + 1}</strong> de{" "}
            {pageCount}.
          </p>
          <DataTable
            columns={columns}
            data={visible}
            manualPagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pagination={{ pageSize }}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === "function"
                  ? (updater as (old: PaginationState) => PaginationState)({
                      pageIndex,
                      pageSize,
                    })
                  : updater
              setPageIndex(next.pageIndex)
            }}
            showRowCount
            labels={{
              rowCount: (_filtered, _t) => `${total} registros (server-side)`,
            }}
          />
        </div>
      )
    }
    return <Wrapper />
  },
  parameters: {
    docs: {
      description: {
        story:
          "Server-side: o backend devolve uma página por vez. Passe `manualPagination`, `pageIndex`, `pageCount` e `onPaginationChange` — o componente não tenta paginar localmente.",
      },
    },
  },
}

export const CustomLabels: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos.slice(0, 6)}
        searchableColumns={["numero", "cliente"]}
        showRowCount
        labels={{
          search: "Procurar contrato...",
          empty: "Sem contratos cadastrados.",
          rowCount: (filtered, total) =>
            filtered === total
              ? `${total} contrato${total === 1 ? "" : "s"} no total`
              : `Exibindo ${filtered} de ${total} contratos`,
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Sobrescreva os textos padrão via `labels`. `rowCount` recebe a quantidade filtrada e total, e retorna a string completa.",
      },
    },
  },
}

export const ControlledSorting: Story = {
  render: () => {
    function Wrapper() {
      const [sorting, setSorting] = useState<SortingState>([{ id: "valor", desc: true }])
      return (
        <div className="space-y-2 p-6">
          <p className="text-muted-foreground text-xs">
            Sorting controlado externamente — atualmente ordenando por{" "}
            <code className="rounded bg-muted px-1">{sorting[0]?.id ?? "(nenhum)"}</code>{" "}
            {sorting[0]?.desc ? "↓" : "↑"}.
          </p>
          <DataTable
            columns={columns}
            data={contratos.slice(0, 8)}
            sorting={sorting}
            onSortingChange={setSorting}
          />
        </div>
      )
    }
    return <Wrapper />
  },
  parameters: {
    docs: {
      description: {
        story:
          "Passe `sorting` + `onSortingChange` para controlar a ordenação externamente — útil para sincronizar com a URL ou um estado global.",
      },
    },
  },
}
