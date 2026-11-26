# Exibição de dados

## DataTable

Tabela completa sobre o TanStack Table: busca, ordenação, paginação (no cliente ou no servidor), seleção, colunas fixas, linhas clicáveis, estados de carregando/erro/vazio e export para Excel ou CSV. As colunas são `ColumnDef` do TanStack (o tipo sai da lib: `import type { ColumnDef } from "@amfernandesinc/ui"`).

Tudo é **opt-in**: sem `searchableColumns` não há busca; sem `sortableColumns`, nenhuma coluna ordena; sem `pagination`, sem paginação.

### Colunas

| Helper | Para |
|---|---|
| `{ accessorKey, header }` | texto simples |
| `dateColumn({ accessorKey, header, showTime })` | datas: `dd/MM/yyyy` (ou com hora), ordena e exporta como data, fuso `America/Sao_Paulo`; data pura nunca muda de dia |
| `formattedColumn({ accessorKey, header, format, align, truncate })` | exibição formatada (dinheiro, CPF, telefone, status) mantendo o valor bruto para ordenar e exportar; números alinham à direita sozinhos |
| `{ id, header, cell }` | ações, componentes (`Badge`, `DropdownMenu`) |

`meta` de coluna (`DataTableColumnMeta`): `searchText` (o texto que a busca compara), `align`, `exportOnly` (só no arquivo), `export` (`false` ou função do valor exportado).

### Tabela no cliente

```tsx
import { MoreHorizontal } from "lucide-react"
import {
  Badge,
  type ColumnDef,
  DataTable,
  DropdownMenu,
  EmptyState,
  IconButton,
  dateColumn,
  formatBRL,
  formatCPF,
  formattedColumn,
} from "@amfernandesinc/ui"

type Contrato = {
  id: string
  numero: string
  cliente: { nome: string; cpf: string }
  valor: number
  assinadoEm: string
  status: "ativo" | "pendente" | "cancelado"
}

const statusBadge = {
  ativo: <Badge variant="success">Ativo</Badge>,
  pendente: <Badge variant="warning">Pendente</Badge>,
  cancelado: <Badge variant="destructive">Cancelado</Badge>,
}

function colunas(acoes: { abrir: (c: Contrato) => void; cancelar: (c: Contrato) => void }): ColumnDef<Contrato>[] {
  return [
    { accessorKey: "numero", header: "Contrato" },
    formattedColumn<Contrato, string>({
      id: "cliente",
      accessorFn: (row) => row.cliente.nome,
      header: "Cliente",
      truncate: { max: 28 },
    }),
    formattedColumn<Contrato, string>({
      id: "cpf",
      accessorFn: (row) => row.cliente.cpf,
      header: "CPF",
      format: (cpf) => formatCPF(cpf),
    }),
    formattedColumn<Contrato, number>({ accessorKey: "valor", header: "Valor", format: (v) => formatBRL(v) }),
    dateColumn<Contrato>({ accessorKey: "assinadoEm", header: "Assinado em" }),
    formattedColumn<Contrato, Contrato["status"]>({
      accessorKey: "status",
      header: "Status",
      format: (status) => statusBadge[status],
    }),
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <DropdownMenu
          trigger={<IconButton icon={<MoreHorizontal />} label={`Ações do contrato ${row.original.numero}`} />}
          align="end"
          // Menu de linha: com modal={false}, abrir o "…" de outra linha leva um clique só.
          modal={false}
          items={[
            { label: "Abrir", onSelect: () => acoes.abrir(row.original) },
            { type: "separator" },
            { label: "Cancelar contrato", variant: "destructive", onSelect: () => acoes.cancelar(row.original) },
          ]}
        />
      ),
    },
  ]
}

export function ContratosTable({
  contratos,
  carregando,
  erro,
  recarregar,
  abrir,
  cancelar,
}: {
  contratos: Contrato[]
  carregando: boolean
  erro?: string
  recarregar: () => void
  abrir: (c: Contrato) => void
  cancelar: (c: Contrato) => void
}) {
  return (
    <DataTable
      aria-label="Contratos"
      columns={colunas({ abrir, cancelar })}
      data={contratos}
      getRowId={(row) => row.id}
      searchableColumns={["numero", "cliente", "cpf"]}
      searchPlaceholder="Buscar por contrato, cliente ou CPF"
      sortableColumns={["numero", "cliente", "valor", "assinadoEm"]}
      pagination={{ pageSize: 20, pageSizeOptions: [20, 50, 100] }}
      showRowCount
      loading={carregando}
      error={erro}
      onRetry={recarregar}
      onRowClick={abrir}
      downloadable={{ filename: "contratos.xlsx", sheetName: "Contratos" }}
      emptyMessage={
        <EmptyState
          compact
          announce
          title="Nenhum contrato encontrado"
          description="Mude a busca ou os filtros."
        />
      }
    />
  )
}
```

- `getRowId` sempre que as linhas têm id: estado da linha (seleção, campo, menu aberto) acompanha a linha, não a posição.
- `onRowClick` torna a linha clicável com um botão real na primeira célula (teclado e leitor de tela chegam nele). Ações dentro da linha não disparam o clique da linha.
- Busca ignora acento e caixa e compara o texto que a célula mostra (`formatCPF` → acha "123.456").
- O nome da tabela: `aria-label`, `aria-labelledby` (um título visível) ou `caption`.

### Paginação, busca e ordenação no servidor

Com `manualPagination`/`manualSorting`/`manualFiltering`, a tabela só mostra o que recebe e avisa as mudanças. `rowCount` dá o total.

```tsx
import * as React from "react"
import {
  type ColumnDef,
  DataTable,
  type PaginationState,
  type SortingState,
  useDebounce,
} from "@amfernandesinc/ui"

type Lead = { id: string; nome: string; origem: string; criadoEm: string }
type Pagina = { linhas: Lead[]; total: number }

const columns: ColumnDef<Lead>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "origem", header: "Origem" },
  { accessorKey: "criadoEm", header: "Criado em" },
]

export function LeadsServidor({
  buscar,
  buscarTodos,
}: {
  buscar: (q: { pagina: number; tamanho: number; ordem: SortingState; termo: string }) => Promise<Pagina>
  buscarTodos: () => Promise<Lead[]>
}) {
  const [paginacao, setPaginacao] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 })
  const [ordem, setOrdem] = React.useState<SortingState>([{ id: "criadoEm", desc: true }])
  const [termo, setTermo] = React.useState("")
  const termoAtrasado = useDebounce(termo, 300)
  const [dados, setDados] = React.useState<Pagina>({ linhas: [], total: 0 })
  const [carregando, setCarregando] = React.useState(true)

  React.useEffect(() => {
    let atual = true
    setCarregando(true)
    buscar({ pagina: paginacao.pageIndex, tamanho: paginacao.pageSize, ordem, termo: termoAtrasado })
      .then((pagina) => atual && setDados(pagina))
      .finally(() => atual && setCarregando(false))
    return () => {
      atual = false
    }
  }, [buscar, paginacao, ordem, termoAtrasado])

  return (
    <DataTable
      aria-label="Leads"
      columns={columns}
      data={dados.linhas}
      getRowId={(row) => row.id}
      loading={carregando}
      searchableColumns={["nome"]}
      globalFilter={termo}
      onGlobalFilterChange={setTermo}
      manualFiltering
      sortableColumns={["nome", "criadoEm"]}
      sorting={ordem}
      onSortingChange={setOrdem}
      manualSorting
      pagination={{ pageSize: paginacao.pageSize, pageSizeOptions: [25, 50, 100] }}
      pageIndex={paginacao.pageIndex}
      onPaginationChange={setPaginacao}
      manualPagination
      rowCount={dados.total}
      showRowCount
      downloadable={{ filename: "leads.xlsx", fetchAll: buscarTodos }}
    />
  )
}
```

No servidor, o export sem `fetchAll`/`fetchFiltered` levaria só a página atual: passe os fetchers.

### Seleção e ações em lote

```tsx
import * as React from "react"
import { Button, type ColumnDef, DataTable } from "@amfernandesinc/ui"

type Unidade = { id: string; bloco: string; numero: string }

const columns: ColumnDef<Unidade>[] = [
  { accessorKey: "bloco", header: "Bloco" },
  { accessorKey: "numero", header: "Unidade" },
]

export function UnidadesSelecionaveis({
  unidades,
  reservar,
}: {
  unidades: Unidade[]
  reservar: (ids: string[]) => void
}) {
  const [selecionadas, setSelecionadas] = React.useState<string[]>([])
  return (
    <DataTable
      aria-label="Unidades disponíveis"
      columns={columns}
      data={unidades}
      getRowId={(row) => row.id}
      selectable
      selectedRowIds={selecionadas}
      onSelectionChange={setSelecionadas}
      selectionActions={(ids) => (
        <Button size="sm" onClick={() => reservar(ids)}>
          Reservar {ids.length}
        </Button>
      )}
      pinnedColumns={{ left: ["bloco"] }}
      maxHeight={480}
    />
  )
}
```

### Outros recursos

- `density="compact"` para telas densas; `maxHeight` + `stickyHeader` (ligado por padrão com `maxHeight`).
- `rowClassName` para destacar linhas (use tokens: `bg-accent`, não cores fixas).
- `onClearFilters` mostra "Limpar filtros" na barra (os filtros são seus; você decide o que zerar).
- Export: `filename` terminado em `.csv` gera CSV para o Excel brasileiro (`;`, vírgula decimal, datas `dd/mm/aaaa`, proteção contra fórmula). `meta.export`/`meta.exportOnly` controlam colunas; `onExportError` recebe falhas.
- Textos (busca, paginação, vazio, export) em `labels` (`defaultDataTableLabels`).

### Tabela estática

Para um resumo pequeno, sem interação, use `tableStyles()` numa `<table>` comum:

```tsx
import { formatBRL, tableStyles } from "@amfernandesinc/ui"

const t = tableStyles()

export function ResumoParcelas({ parcelas }: { parcelas: { n: number; valor: number; vencimento: string }[] }) {
  return (
    <table className={t.table}>
      <caption className="sr-only">Parcelas da proposta</caption>
      <thead className={t.header}>
        <tr className={t.row}>
          <th scope="col" className={t.head}>Parcela</th>
          <th scope="col" className={t.head}>Vencimento</th>
          <th scope="col" className={`${t.head} text-right`}>Valor</th>
        </tr>
      </thead>
      <tbody className={t.body}>
        {parcelas.map((p) => (
          <tr key={p.n} className={t.row}>
            <td className={t.cell}>{p.n}</td>
            <td className={t.cell}>{p.vencimento}</td>
            <td className={`${t.cell} text-right tabular-nums`}>{formatBRL(p.valor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## Card

`title`, `description`, `headerAction` (botão ou menu no canto), `footer`, `padding` (`"default"`, `"compact"` para dashboards, `"none"` quando o conteúdo tem bordas próprias: tabela, lista, gráfico), `headingLevel` (padrão 3; ajuste à hierarquia da página).

```tsx
import { Plus } from "lucide-react"
import { Button, Card, DataTable, type ColumnDef } from "@amfernandesinc/ui"

type Visita = { id: string; cliente: string; data: string }
const columns: ColumnDef<Visita>[] = [
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "data", header: "Data" },
]

export function VisitasCard({ visitas, agendar }: { visitas: Visita[]; agendar: () => void }) {
  return (
    <Card
      title="Visitas da semana"
      description="Agendadas pelos corretores do plantão."
      headingLevel={2}
      padding="none"
      headerAction={
        <Button size="sm" variant="outline" onClick={agendar}>
          <Plus aria-hidden="true" />
          Agendar
        </Button>
      }
    >
      <DataTable aria-label="Visitas da semana" columns={columns} data={visitas} density="compact" />
    </Card>
  )
}
```

## EmptyState

`title` (obrigatório), `description`, `icon` (elemento), `actions`, `compact` (cards, colunas estreitas), `headingLevel` (padrão 3), `announce` (anuncia quando aparece por ação do usuário: busca ou filtro sem resultado; não para conteúdo vazio ao carregar a página).

```tsx
import { Inbox } from "lucide-react"
import { Button, EmptyState } from "@amfernandesinc/ui"

export function SemLeads({ novo }: { novo: () => void }) {
  return (
    <EmptyState
      icon={<Inbox />}
      title="Nenhum lead ainda"
      description="Os leads dos portais e do site aparecem aqui."
      actions={<Button onClick={novo}>Cadastrar lead</Button>}
    />
  )
}
```

## Estados de carregamento

- Lista ou tabela: `loading` da `DataTable` (linhas esqueleto do tamanho da página).
- Bloco que vai ganhar conteúdo: `SkeletonGroup` com `Skeleton`s no formato do conteúdo. O grupo é o único `role="status"` ("Carregando…"); os blocos ficam escondidos do leitor de tela.
- Gráficos e agenda: prop `loading`.

```tsx
import { Skeleton, SkeletonGroup } from "@amfernandesinc/ui"

export function CardCarregando() {
  return (
    <SkeletonGroup className="space-y-3 rounded-container border border-border-strong bg-card p-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </SkeletonGroup>
  )
}
```

## Badge, Token e Avatar

- `Badge`: status curto, `variant` `default`, `info`, `success`, `warning`, `destructive`, `secondary`, `outline`; `dot` para um ponto antes do texto. Contagens: `formatCount(n)` ("9999+").
- `Token`: etiqueta de categoria (`color` da paleta: `gray`, `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink`), removível (`onRemove`) ou link (`href` + `renderLink`). `icon` recebe o componente.
- `Avatar`: `alt` (quem é) e `fallback` (iniciais) obrigatórios; `src` opcional.

```tsx
import { Tag } from "lucide-react"
import { Avatar, Badge, Token } from "@amfernandesinc/ui"

export function CabecalhoDoLead({ nome, foto, tags, remover }: {
  nome: string
  foto?: string
  tags: string[]
  remover: (tag: string) => void
}) {
  const iniciais = nome.split(" ").map((p) => p[0]).slice(0, 2).join("")
  return (
    <div className="flex items-center gap-3">
      <Avatar src={foto} alt={nome} fallback={iniciais} />
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {nome}
          <Badge variant="info" dot>
            Quente
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Token key={tag} label={tag} color="purple" icon={Tag} size="sm" onRemove={() => remover(tag)} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Tree

Hierarquia navegável por teclado (setas, Home/End, digitação). `data: TreeNodeData[]` (`id`, `label`, `icon` como componente, `children`, `hasChildren` para carregar sob demanda), `selected`/`onSelectedChange`, `expanded`/`onExpandedChange`, `onLoadChildren`.

```tsx
import { Building2, Folder } from "lucide-react"
import * as React from "react"
import { Tree, type TreeNodeData } from "@amfernandesinc/ui"

export function EstruturaDoEmpreendimento({
  carregarUnidades,
}: {
  carregarUnidades: (blocoId: string) => Promise<TreeNodeData[]>
}) {
  const [data, setData] = React.useState<TreeNodeData[]>([
    {
      id: "bosque",
      label: "Residencial Bosque",
      icon: Building2,
      children: [
        { id: "bloco-a", label: "Bloco A", icon: Folder, hasChildren: true },
        { id: "bloco-b", label: "Bloco B", icon: Folder, hasChildren: true },
      ],
    },
  ])
  const [selecionado, setSelecionado] = React.useState<string>()

  const carregar = async (node: TreeNodeData) => {
    const filhos = await carregarUnidades(node.id)
    const inserir = (nodes: TreeNodeData[]): TreeNodeData[] =>
      nodes.map((n) => (n.id === node.id ? { ...n, children: filhos } : { ...n, children: n.children && inserir(n.children) }))
    setData(inserir)
  }

  return (
    <Tree
      aria-label="Estrutura do empreendimento"
      data={data}
      defaultExpanded={["bosque"]}
      selected={selecionado}
      onSelectedChange={setSelecionado}
      onLoadChildren={carregar}
    />
  )
}
```

## Schedule

Agenda com visões mês, semana, dia e lista. Eventos `ScheduleEvent` (`id`, `title`, `start`, `end`, `allDay`, `color` da paleta, `description`). Busque os eventos do período em `onRangeChange` (chamado ao montar e a cada mudança, `end` exclusivo).

- `onEventClick` ou `renderEventDetails` (popover com o conteúdo) tornam os eventos clicáveis; sem eles, eventos são só conteúdo.
- `onSlotClick(date)` para "novo evento" num dia ou horário (também pelo teclado).
- Fuso: os eventos são instantes (`Date`) e aparecem em `timeZone` (`America/Sao_Paulo` por padrão), igual em qualquer máquina. Evento de dia inteiro começa à meia-noite desse fuso.
- Renderização no servidor (Next.js): o relógio do navegador só entra depois da hidratação. Sem `today`, o servidor não marca o hoje nem a linha da hora atual; sem `date`, `defaultDate` ou `today`, manda só a moldura e o período chega no navegador. Para o servidor mandar a agenda pronta, passe `defaultDate` e `today`.
- `views` limita as visões; `minHour`/`maxHour`/`scrollToHour` para o expediente; `weekStartsOn`; `locale` (`"pt-BR"` padrão) para nomes de dias e meses.
- `today` fixo deixa testes e screenshots determinísticos.

```tsx
import * as React from "react"
import { Button, Schedule, type ScheduleEvent, formatDate } from "@amfernandesinc/ui"

export function AgendaDeVisitas({
  buscar,
  novaVisita,
}: {
  buscar: (inicio: Date, fim: Date) => Promise<ScheduleEvent[]>
  novaVisita: (quando: Date) => void
}) {
  const [eventos, setEventos] = React.useState<ScheduleEvent[]>([])
  const [carregando, setCarregando] = React.useState(false)

  const aoMudarPeriodo = React.useCallback(
    async ({ start, end }: { start: Date; end: Date }) => {
      setCarregando(true)
      try {
        setEventos(await buscar(start, end))
      } finally {
        setCarregando(false)
      }
    },
    [buscar],
  )

  return (
    <Schedule
      events={eventos}
      loading={carregando}
      defaultView="week"
      minHour={7}
      maxHour={21}
      onRangeChange={aoMudarPeriodo}
      onSlotClick={novaVisita}
      renderEventDetails={(evento) => (
        <div className="space-y-2 text-sm">
          <p className="font-medium">{evento.title}</p>
          <p className="text-muted-foreground">{formatDate(evento.start, "brl-full")}</p>
          {evento.description}
          <Button size="sm" variant="outline">
            Remarcar
          </Button>
        </div>
      )}
    />
  )
}
```

`getScheduleRange(view, date, { weekStartsOn, timeZone })` dá o mesmo período fora do componente (para pré-carregar).

## Image e Video

- `Image`: `alt` obrigatório (ou `decorative`); `src` vazio/`null` mostra "Sem imagem" como estado normal; `fallback` troca o que aparece sem foto ou em erro (iniciais, ícone); `aspectRatio` reserva o espaço; `objectFit` (`cover` padrão, `contain`, `fill`, `none`, `scale-down`); `rounded` (`none`, `sm`, `md`, `lg`, `full`); `placeholder` (`skeleton`, `blur` com `blurDataURL`, `none`); `loading="lazy"` padrão; `srcSet`/`sizes`.
- `Video`: `aria-label` obrigatório (ou `aria-labelledby`); `poster`; `captions` (`{ src, srcLang, label, default }`); `objectFit` `contain` padrão (mostra o quadro inteiro, inclusive vídeo vertical); `preload`. Mostra carregando e erro com "Tentar de novo".
- Os dois só aceitam `http:`, `https:` e caminhos relativos. `allowedProtocols` **substitui** essa lista; para acrescentar (um `blob:` de prévia), espalhe o padrão: `allowedProtocols={[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "blob:"]}`.

```tsx
import { Image, Video } from "@amfernandesinc/ui"

export function MidiaDoImovel({ foto, tour }: { foto?: string | null; tour?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Image src={foto} alt="Fachada do Residencial Bosque" aspectRatio={4 / 3} rounded="lg" />
      {tour ? <Video src={tour} aria-label="Tour virtual do apartamento decorado" poster={foto ?? undefined} /> : null}
    </div>
  )
}
```

## ScrollArea

Área com rolagem e barra no estilo do sistema. `orientation` (`"vertical"`, `"horizontal"`, `"both"`). Com `aria-label`, vira uma região nomeada e focável (o teclado rola). Dê uma altura ao container.

```tsx
import { ScrollArea } from "@amfernandesinc/ui"

export function Historico({ itens }: { itens: { id: string; texto: string }[] }) {
  return (
    <ScrollArea aria-label="Histórico do lead" className="h-64 rounded-container border border-border-strong">
      <ul className="divide-y divide-border">
        {itens.map((item) => (
          <li key={item.id} className="px-3 py-2 text-sm">
            {item.texto}
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
```
