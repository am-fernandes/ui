import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { useState } from "react"

import { Badge } from "../primitives/badge"
import { dateColumn } from "./columns"
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
    a11y: {
      // muted-foreground used for column-header secondary text + Badge variants on row data
      // does not pass 4.5:1 against background. Tracked in design-tokens roadmap.
      config: { rules: [{ id: "color-contrast", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          "Tabela rica baseada em [`@tanstack/react-table`](https://tanstack.com/table/latest) e nos primitives `Table*` do DS. Suporta busca global escopada (`searchableColumns`), ordenação por coluna, paginação opcional e props controladas para uso server-side.",
          "",
          "**Props:**",
          "- `columns: ColumnDef<TData>[]` — definição das colunas (tipo do `@tanstack/react-table`).",
          "- `data: TData[]` — array de linhas. `TData` é o seu tipo de domínio.",
          "- `searchableColumns?: string[]` — `accessorKey`s das colunas incluídas na busca global. Sem isso, o campo de busca não aparece.",
          "- `sortableColumns?: string[]` — `accessorKey`s das colunas com header ordenável. Sem isso, **nenhum** header é ordenável — mesma semântica opt-in de `searchableColumns`.",
          "- `searchPlaceholder?: string` — placeholder do input de busca (default `Buscar...`).",
          "- `emptyMessage?: ReactNode` — conteúdo exibido quando `data` filtrado fica vazio (default `Nenhum resultado.`).",
          "- `pagination?: { pageSize?: number; pageSizeOptions?: number[] }` — habilita paginação. Quando `pageSizeOptions` é informado (ex.: `[10, 20, 50, 100]`), o footer mostra um `<select>` 'Linhas por página' que ao mudar reseta o cursor pra página 1 e propaga via `onPaginationChange`. Sem `pageSize` explícito, o tamanho inicial vira `pageSizeOptions[0]`.",
          "- `showRowCount?: boolean` — mostra a contagem de registros no footer.",
          "- `globalFilter` / `onGlobalFilterChange` — filtro de busca controlado.",
          "- `pageIndex` / `onPaginationChange` / `pageCount` / `manualPagination` — paginação server-side.",
          "- `labels?: { search?, empty?, rowCount?(filtered, total) => string }` — sobrescreve os textos default.",
          '- `onRowClick?: (row, event) => void` — torna cada linha clicável. Adiciona `role="button"`, `tabIndex=0` e suporte a Enter/Espaço automaticamente.',
          "- `rowClassName?: (row, index) => string | undefined` — classes por linha. Retorne `undefined` para a linha herdar o estilo padrão. Útil para colorir linhas por status.",
          "- `loading?: boolean` — exibe estado skeleton: linhas (count = `pagination.pageSize ?? 5`, células = `columns.length`), input de busca, contagem e botões de paginação. Wrapper recebe `aria-busy`.",
          "- `downloadable?: boolean | { filename?, sheetName?, rowToRecord? }` — botão `Exportar para Excel` (ghost) à direita; abre popover com 3 escopos: dados filtrados, página atual, todos. Gera `.xlsx` via `xlsx` (SheetJS) lazy-loaded.",
          "- `className?: string` — classes extras no wrapper externo.",
          "",
          "**Helpers para colunas:**",
          "- `dateColumn({ accessorKey, header, showTime? })` — column helper para campos data/datetime. Renderiza `dd/MM/yyyy` (ou `dd/MM/yyyy HH:mm` se a linha trouxer hora/minuto), e tem `sortingFn` que ordena por timestamp — funciona até quando o valor é string BR (`19/05/2026`). Aceita `Date`, ISO (`2026-05-19[T14:30]`), string BR ou epoch (number).",
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
          "  // 3. Coluna sem sort: simplesmente deixe-a fora de `sortableColumns`.",
          "  {",
          '    accessorKey: "status",',
          '    header: "Status",',
          "    cell: ({ row }) => <Badge>{row.original.status}</Badge>,",
          "  },",
          "]",
          "```",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { DataTable } from "@amfernandesinc/ui"',
          'import type { ColumnDef } from "@tanstack/react-table"',
          "",
          "<DataTable",
          "  columns={columns}",
          "  data={contratos}",
          '  searchableColumns={["numero", "cliente"]}',
          '  sortableColumns={["numero", "cliente", "vencimento", "valor"]}',
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
        "Definições de coluna do `@tanstack/react-table`. Para habilitar ordenação use a prop top-level `sortableColumns`.",
      table: { type: { summary: "ColumnDef<TData>[]" } },
    },
    sortableColumns: {
      control: "object",
      description:
        "`accessorKey`s das colunas cujo header é ordenável. Quando omitido, nenhum header é clicável.",
      table: { type: { summary: "string[]" } },
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
        "Habilita paginação. `pageSize` define o tamanho inicial. `pageSizeOptions` (opcional) renderiza um `<select>` no footer com tamanhos pré-definidos — trocar reseta para a página 1 e propaga via `onPaginationChange` (funciona em client- e server-side). Quando `pageSizeOptions` é definido e `pageSize` não, o tamanho inicial vira `pageSizeOptions[0]`.",
      table: { type: { summary: "{ pageSize?: number; pageSizeOptions?: number[] }" } },
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
    onRowClick: {
      control: false,
      description:
        "Disparado quando a linha é clicada (ou ativada via Enter/Espaço). Recebe `(row, event)`.",
      table: { type: { summary: "(row: TData, event: MouseEvent) => void" } },
    },
    rowClassName: {
      control: false,
      description:
        "Função que recebe `(row, index)` e retorna classes para a linha. Use para destacar linhas por status — ex: `row.status === 'vencido' ? 'bg-destructive/10' : undefined`.",
      table: { type: { summary: "(row: TData, index: number) => string | undefined" } },
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
      <DataTable
        columns={columns}
        data={contratos.slice(0, 10)}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "10 linhas, sem busca, sem paginação. Cabeçalhos das colunas listadas em `sortableColumns` ficam clicáveis (Status não).",
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
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
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
      <DataTable
        columns={columns}
        data={contratos}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
        pagination={{ pageSize: 5 }}
        showRowCount
      />
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

export const PaginatedWithPageSizeSelector: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
        pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20, 50] }}
        showRowCount
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          "Passe `pagination.pageSizeOptions` para renderizar um `<select>` 'Linhas por página' no footer.",
          "Trocar a opção reseta o cursor pra página 1 (de forma atômica via `setPagination`) e propaga via `onPaginationChange`. Funciona em client- e server-side.",
          "",
          "```tsx",
          "<DataTable",
          "  columns={columns}",
          "  data={contratos}",
          "  pagination={{ pageSize: 5, pageSizeOptions: [5, 10, 20, 50] }}",
          "  showRowCount",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
}

export const PaginatedWithPageSizeSelectorServerSide: Story = {
  render: () => {
    function Wrapper() {
      const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
      })
      const total = contratos.length
      const pageCount = Math.ceil(total / pageSize)
      const visible = contratos.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      return (
        <div className="space-y-2 p-6">
          <p className="text-muted-foreground text-xs">
            Server-side com seletor de tamanho de página. Página{" "}
            <strong className="text-foreground">{pageIndex + 1}</strong> de {pageCount} ·{" "}
            <strong className="text-foreground">{pageSize}</strong> linhas/página.
          </p>
          <DataTable
            columns={columns}
            data={visible}
            sortableColumns={["numero", "cliente", "vencimento", "valor"]}
            manualPagination
            pageIndex={pageIndex}
            pageCount={pageCount}
            pagination={{ pageSize, pageSizeOptions: [5, 10, 20] }}
            onPaginationChange={(updater) => {
              const next =
                typeof updater === "function"
                  ? (updater as (old: PaginationState) => PaginationState)({ pageIndex, pageSize })
                  : updater
              // O consumer recebe `{pageIndex: 0, pageSize: novo}` atomicamente
              // quando o usuário troca o tamanho — sem fetch da página errada.
              setPagination(next)
            }}
            showRowCount
            labels={{
              rowCount: () => `${total} registros (server-side)`,
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
          "Mesma feature em modo manual/server-side: o `onPaginationChange` recebe `{pageIndex: 0, pageSize: novo}` em uma única chamada quando o usuário troca o tamanho — basta o consumer refazer o fetch com a nova fatia. O reset pra página 1 é garantido por `setPagination` atômico (em vez de duas chamadas encadeadas que perdiam o reset quando `pageIndex` ≠ 0).",
      },
    },
  },
}

export const Sortable: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos.slice(0, 8)}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Clique no header para alternar entre `asc` / `desc` / sem ordenação. Status fica fora de `sortableColumns` — header continua sendo texto puro.",
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
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
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
            sortableColumns={["numero", "cliente", "vencimento", "valor"]}
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

export const English: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos.slice(0, 8)}
        searchableColumns={["numero", "cliente"]}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
        pagination={{ pageSize: 5 }}
        showRowCount
        downloadable
        labels={{
          search: "Search...",
          searchAriaLabel: "Search the table",
          empty: "No results.",
          loading: "Loading data…",
          paginationPrevious: "Previous page",
          paginationNext: "Next page",
          rowCount: (filtered, total) =>
            filtered === total
              ? `${total} record${total === 1 ? "" : "s"}`
              : `${filtered} of ${total} records`,
          pageIndicator: (idx, total) => `Page ${idx + 1} of ${total}`,
          sortBy: (h) => `Sort by ${h}`,
          exportTrigger: "Export to Excel",
          exportFiltered: "Export filtered data",
          exportPage: "Export current page",
          exportAll: "Export all data",
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Full en-US override via the `labels` prop. Defaults are pt-BR; pass `labels={{ ... }}` to translate or rewrite copy per instance.",
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
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
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

export const WithRowCount: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos.slice(0, 8)}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
        showRowCount
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Passe `showRowCount` para exibir a contagem total de registros no canto **inferior esquerdo**. Quando há filtro ativo a string vira `<filtrados> de <total> registros`. Independente de paginação — funciona em qualquer modo.",
      },
    },
  },
}

interface Pedido {
  numero: string
  cliente: string
  /** ISO date-only — vai ser exibida como `dd/MM/yyyy`. */
  vencimento: string
  /** ISO datetime — vai ser exibida como `dd/MM/yyyy HH:mm`. */
  criadoEm: string
}

const pedidos: Pedido[] = [
  {
    numero: "P-001",
    cliente: "Empresa A",
    vencimento: "2026-06-15",
    criadoEm: "2026-05-19T14:30:00",
  },
  {
    numero: "P-002",
    cliente: "Empresa B",
    vencimento: "2025-12-20",
    criadoEm: "2026-05-18T09:15:00",
  },
  {
    numero: "P-003",
    cliente: "Empresa C",
    vencimento: "2026-01-10",
    criadoEm: "2026-05-19T08:00:00",
  },
  {
    numero: "P-004",
    cliente: "Empresa D",
    vencimento: "2026-08-01",
    criadoEm: "2026-05-17T17:45:00",
  },
  {
    numero: "P-005",
    cliente: "Empresa E",
    vencimento: "2025-11-05",
    criadoEm: "2026-05-19T11:20:00",
  },
]

const pedidoColumns: ColumnDef<Pedido>[] = [
  { accessorKey: "numero", header: "Número" },
  { accessorKey: "cliente", header: "Cliente" },
  dateColumn<Pedido>({ accessorKey: "vencimento", header: "Vencimento" }),
  dateColumn<Pedido>({ accessorKey: "criadoEm", header: "Criado em" }),
]

export const WithDateColumns: Story = {
  render: () => (
    <div className="space-y-2 p-6">
      <p className="text-muted-foreground text-xs">
        Coluna <strong className="text-foreground">Vencimento</strong> usa ISO date-only
        (`2026-06-15`) → renderiza `dd/MM/yyyy`.{" "}
        <strong className="text-foreground">Criado em</strong> usa ISO datetime → renderiza
        `dd/MM/yyyy HH:mm`. Clique nos headers para ordenar — o sort compara timestamps, não
        strings, então a ordenação cronológica é correta mesmo quando a string formatada não está em
        ordem alfabética.
      </p>
      <DataTable
        columns={pedidoColumns}
        data={pedidos}
        sortableColumns={["vencimento", "criadoEm"]}
        showRowCount
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          '`dateColumn<TData>({ accessorKey, header })` cuida de formatação + sort. Detecta automaticamente se a linha tem hora/minuto (mode `"auto"`, default).',
          "",
          "```tsx",
          'import { dateColumn, DataTable } from "@amfernandesinc/ui"',
          "",
          "const cols: ColumnDef<Pedido>[] = [",
          '  { accessorKey: "numero", header: "Número" },',
          '  dateColumn<Pedido>({ accessorKey: "vencimento", header: "Vencimento" }),',
          '  dateColumn<Pedido>({ accessorKey: "criadoEm", header: "Criado em", showTime: true }),',
          "]",
          "```",
          "",
          'Aceita `Date`, ISO string, string BR (`19/05/2026 14:30`) ou epoch (number). `showTime` pode ser `"auto"` (default), `true` ou `false`.',
        ].join("\n"),
      },
    },
  },
}

export const WithRowClick: Story = {
  render: () => {
    function Wrapper() {
      const [selected, setSelected] = useState<Contrato | null>(null)
      return (
        <div className="space-y-2 p-6">
          <p className="text-muted-foreground text-xs">
            Clique em uma linha (ou use Tab + Enter) para selecionar o contrato.
            {selected ? (
              <>
                {" "}
                Selecionado:{" "}
                <strong className="text-foreground">
                  {selected.numero} — {selected.cliente}
                </strong>
              </>
            ) : (
              " Nenhum selecionado."
            )}
          </p>
          <DataTable
            columns={columns}
            data={contratos.slice(0, 8)}
            sortableColumns={["numero", "cliente", "vencimento", "valor"]}
            onRowClick={(row) => setSelected(row)}
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
          'Passe `onRowClick={(row) => ...}` para tornar a linha inteira clicável. O componente cuida da a11y (`role="button"`, `tabIndex=0`, Enter/Espaço) e adiciona `cursor-pointer`.',
      },
    },
  },
}

export const WithRowColoring: Story = {
  render: () => (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={contratos.slice(0, 10)}
        sortableColumns={["numero", "cliente", "vencimento", "valor"]}
        rowClassName={(row) => {
          if (row.status === "vencido") return "bg-destructive/10 hover:bg-destructive/15"
          if (row.status === "pendente") return "bg-amber-50 hover:bg-amber-100/70"
          return undefined
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`rowClassName(row, index)` permite estilizar linhas individualmente. Aqui: vermelho-claro para `vencido`, âmbar para `pendente`. Retorne `undefined` para manter o estilo padrão.",
      },
    },
  },
}

export const ClickableAndColored: Story = {
  render: () => {
    function Wrapper() {
      const [selected, setSelected] = useState<string | null>(null)
      return (
        <div className="space-y-2 p-6">
          <p className="text-muted-foreground text-xs">
            Combinação: linhas coloridas por status + clique para selecionar.
            {selected ? (
              <>
                {" "}
                Selecionado: <strong className="text-foreground">{selected}</strong>
              </>
            ) : null}
          </p>
          <DataTable
            columns={columns}
            data={contratos.slice(0, 8)}
            sortableColumns={["numero", "cliente", "vencimento", "valor"]}
            onRowClick={(row) => setSelected(row.numero)}
            rowClassName={(row) => {
              if (row.numero === selected) return "bg-primary/10 hover:bg-primary/15"
              if (row.status === "vencido") return "bg-destructive/10 hover:bg-destructive/15"
              return undefined
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
          "`onRowClick` e `rowClassName` se combinam — a linha selecionada usa `bg-primary/10`, vencidas ficam destacadas em vermelho.",
      },
    },
  },
}

export const WithDownload: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <section className="space-y-2">
        <p className="text-muted-foreground text-xs">
          <strong className="text-foreground">Toolbar com busca + download</strong> — busca à
          esquerda, botão `Exportar para Excel` (ghost) à direita. Clique pra abrir o popover com 3
          escopos.
        </p>
        <DataTable
          columns={columns}
          data={contratos}
          searchableColumns={["numero", "cliente"]}
          sortableColumns={["numero", "cliente", "vencimento", "valor"]}
          pagination={{ pageSize: 5 }}
          showRowCount
          downloadable={{
            filename: "contratos.xlsx",
            sheetName: "Contratos",
          }}
        />
      </section>

      <section className="space-y-2">
        <p className="text-muted-foreground text-xs">
          <strong className="text-foreground">Só download (sem busca)</strong> — botão ainda fica à
          direita; o lado esquerdo do toolbar fica vazio.
        </p>
        <DataTable
          columns={columns}
          data={contratos.slice(0, 6)}
          sortableColumns={["numero", "cliente", "vencimento", "valor"]}
          downloadable
        />
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          "Passe `downloadable` para expor um botão `Exportar para Excel` (variante ghost, ícone Download) à direita do toolbar.",
          "",
          "O click abre um Popover com 3 itens:",
          "1. **Exportar dados filtrados** — todas as linhas que passam pela busca (`getFilteredRowModel`), ignorando paginação.",
          "2. **Exportar página atual** — só as linhas visíveis no momento (`getRowModel` — após filtro + paginação).",
          "3. **Exportar todos os dados** — o array `data` original, sem filtros nem paginação.",
          "",
          '**Geração do arquivo**: usa `xlsx` (SheetJS) **lazy-loaded** via `await import("xlsx")` — o package só entra no bundle do consumer no primeiro clique de export. Default: 1 sheet ("Dados"), 1 linha por registro, 1 coluna por leaf column visível (label = `columnDef.header` quando string, senão `column.id`).',
          "",
          "**Customização (objeto)**: `downloadable={{ filename, sheetName, rowToRecord }}`.",
          '- `filename` — default `"export.xlsx"`.',
          '- `sheetName` — default `"Dados"`.',
          "- `rowToRecord(row)` — mapping custom de cada linha pro objeto exportado. Use pra renomear colunas, formatar valores (BRL, datas), ou omitir campos.",
          "",
          "```tsx",
          'import { DataTable } from "@amfernandesinc/ui"',
          "",
          "<DataTable",
          "  columns={columns}",
          "  data={contratos}",
          '  searchableColumns={["numero", "cliente"]}',
          "  pagination={{ pageSize: 10 }}",
          "  downloadable={{",
          '    filename: "contratos.xlsx",',
          '    sheetName: "Contratos",',
          "    rowToRecord: (r) => ({",
          "      Número: r.numero,",
          "      Cliente: r.cliente,",
          "      Valor: brl.format(r.valor),",
          "    }),",
          "  }}",
          "/>",
          "```",
          "",
          "Botão fica `disabled` quando `data.length === 0`. Em `loading=true` vira skeleton.",
        ].join("\n"),
      },
    },
  },
}

export const Loading: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <section className="space-y-2">
        <p className="text-muted-foreground text-xs">
          <strong className="text-foreground">Loading básico</strong> — sem busca, sem paginação.
          Renderiza 5 linhas skeleton (default).
        </p>
        <DataTable
          columns={columns}
          data={[]}
          loading
          sortableColumns={["numero", "cliente", "vencimento", "valor"]}
        />
      </section>

      <section className="space-y-2">
        <p className="text-muted-foreground text-xs">
          <strong className="text-foreground">Com busca + paginação</strong> — o input de busca
          também vira skeleton; o número de linhas vem de `pagination.pageSize` (aqui 8); botões de
          página ficam disabled; contagem no footer também é skeleton.
        </p>
        <DataTable
          columns={columns}
          data={[]}
          loading
          searchableColumns={["numero", "cliente"]}
          sortableColumns={["numero", "cliente", "vencimento", "valor"]}
          pagination={{ pageSize: 8 }}
          showRowCount
        />
      </section>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: [
          "Passe `loading` (boolean) para exibir um estado skeleton enquanto os dados carregam. O componente:",
          "",
          "- Renderiza `pagination.pageSize ?? 5` linhas skeleton, cada uma com `columns.length` células (larguras variando entre 5 valores pra parecer natural).",
          "- Se `searchableColumns` estiver definido, troca o `<Input>` de busca por um skeleton equivalente — sem perda de layout.",
          "- Footer: contagem (`showRowCount`) e indicador de página viram skeletons; botões prev/next ficam disabled.",
          "- Cabeçalho permanece — colunas são conhecidas estaticamente.",
          '- `aria-busy="true"` no wrapper externo para assistive tech anunciar uma única vez.',
          "",
          "```tsx",
          'import { DataTable } from "@amfernandesinc/ui"',
          "",
          "<DataTable",
          "  columns={columns}",
          "  data={data ?? []}",
          "  loading={isLoading}",
          '  searchableColumns={["numero", "cliente"]}',
          "  pagination={{ pageSize: 10 }}",
          "  showRowCount",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
}
