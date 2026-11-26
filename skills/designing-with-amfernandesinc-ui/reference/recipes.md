# Receitas

Telas completas, para copiar e adaptar. Cada uma compila contra a lib (o teste da skill garante). Trocam-se os dados e as funções de API; a estrutura e os componentes ficam.

## 1. Listagem com filtros, detalhe e exclusão

Cabeçalho da página, barra de filtros, `DataTable` com ações por linha, detalhe num `Sheet`, exclusão confirmada num `AlertDialog`, avisos por toast.

```tsx
import { MoreHorizontal, Plus } from "lucide-react"
import * as React from "react"
import {
  AlertDialog,
  Badge,
  Button,
  type ColumnDef,
  Combobox,
  DataTable,
  type DateRangeValue,
  DateRangePicker,
  DropdownMenu,
  EmptyState,
  IconButton,
  Input,
  Select,
  Sheet,
  Typography,
  dateColumn,
  formatBRL,
  formattedColumn,
  toast,
} from "@amfernandesinc/ui"

type Status = "novo" | "em_atendimento" | "proposta" | "perdido"
type Lead = {
  id: string
  nome: string
  telefone: string
  empreendimento: string
  rendaFamiliar: number
  criadoEm: string
  status: Status
}

const STATUS: Record<Status, { label: string; variant: "info" | "warning" | "success" | "secondary" }> = {
  novo: { label: "Novo", variant: "info" },
  em_atendimento: { label: "Em atendimento", variant: "warning" },
  proposta: { label: "Proposta", variant: "success" },
  perdido: { label: "Perdido", variant: "secondary" },
}

const empreendimentos = [
  { value: "Residencial Bosque", label: "Residencial Bosque" },
  { value: "Torre Norte", label: "Torre Norte" },
  { value: "Vila Jardim", label: "Vila Jardim" },
]

export function LeadsPage({
  leads,
  carregando,
  excluir,
  novo,
}: {
  leads: Lead[]
  carregando: boolean
  excluir: (id: string) => Promise<void>
  novo: () => void
}) {
  const [busca, setBusca] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [filtroEmpreendimentos, setFiltroEmpreendimentos] = React.useState<string[]>([])
  const [periodo, setPeriodo] = React.useState<DateRangeValue>({ from: "", to: "" })
  const [aberto, setAberto] = React.useState<Lead | null>(null)
  const [paraExcluir, setParaExcluir] = React.useState<Lead | null>(null)

  const filtrados = leads.filter(
    (l) =>
      (!status || l.status === status) &&
      (filtroEmpreendimentos.length === 0 || filtroEmpreendimentos.includes(l.empreendimento)) &&
      (!periodo.from || l.criadoEm >= periodo.from) &&
      (!periodo.to || l.criadoEm <= periodo.to),
  )
  const temFiltro = Boolean(busca || status || filtroEmpreendimentos.length || periodo.from || periodo.to)
  const limpar = () => {
    setBusca("")
    setStatus("")
    setFiltroEmpreendimentos([])
    setPeriodo({ from: "", to: "" })
  }

  const columns: ColumnDef<Lead>[] = [
    { accessorKey: "nome", header: "Nome" },
    { accessorKey: "empreendimento", header: "Empreendimento" },
    formattedColumn<Lead, number>({ accessorKey: "rendaFamiliar", header: "Renda familiar", format: (v) => formatBRL(v) }),
    dateColumn<Lead>({ accessorKey: "criadoEm", header: "Criado em" }),
    formattedColumn<Lead, Status>({
      accessorKey: "status",
      header: "Status",
      format: (s) => <Badge variant={STATUS[s].variant}>{STATUS[s].label}</Badge>,
    }),
    {
      id: "acoes",
      header: () => <span className="sr-only">Ações</span>,
      cell: ({ row }) => (
        <DropdownMenu
          modal={false}
          align="end"
          trigger={<IconButton icon={<MoreHorizontal />} label={`Ações de ${row.original.nome}`} />}
          items={[
            { label: "Ver detalhes", onSelect: () => setAberto(row.original) },
            { type: "separator" },
            { label: "Excluir lead", variant: "destructive", onSelect: () => setParaExcluir(row.original) },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Typography variant="heading" as="h1">
            Leads
          </Typography>
          <Typography className="text-muted-foreground">Contatos dos portais, do site e do plantão.</Typography>
        </div>
        <Button onClick={novo}>
          <Plus aria-hidden="true" />
          Novo lead
        </Button>
      </header>

      <section
        aria-label="Filtros"
        className="flex flex-wrap items-end gap-3 rounded-container border border-border-strong bg-card p-3"
      >
        <Input label="Buscar" size="sm" value={busca} onChange={(e) => setBusca(e.target.value)} wrapperClassName="w-56" />
        <Select
          label="Status"
          size="sm"
          value={status}
          onValueChange={setStatus}
          options={Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))}
          wrapperClassName="w-44"
        />
        <Combobox
          multiple
          label="Empreendimentos"
          size="sm"
          options={empreendimentos}
          value={filtroEmpreendimentos}
          onValueChange={setFiltroEmpreendimentos}
          showBadges={false}
          className="w-56"
        />
        <DateRangePicker label="Criado entre" size="sm" value={periodo} onValueChange={setPeriodo} />
      </section>

      <DataTable
        aria-label="Leads"
        columns={columns}
        data={filtrados}
        getRowId={(row) => row.id}
        loading={carregando}
        searchableColumns={["nome", "empreendimento"]}
        globalFilter={busca}
        onGlobalFilterChange={setBusca}
        sortableColumns={["nome", "rendaFamiliar", "criadoEm"]}
        pagination={{ pageSize: 20 }}
        showRowCount
        onRowClick={setAberto}
        onClearFilters={limpar}
        clearFiltersDisabled={!temFiltro}
        downloadable={{ filename: "leads.xlsx" }}
        emptyMessage={
          temFiltro ? (
            <EmptyState
              compact
              announce
              title="Nenhum lead com esses filtros"
              actions={
                <Button variant="outline" size="sm" onClick={limpar}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <EmptyState compact title="Nenhum lead ainda" actions={<Button size="sm" onClick={novo}>Cadastrar lead</Button>} />
          )
        }
      />

      <Sheet
        open={aberto != null}
        onOpenChange={(open) => !open && setAberto(null)}
        title={aberto?.nome ?? "Lead"}
        description={aberto?.empreendimento}
        size="md"
      >
        {aberto ? (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Telefone</dt>
            <dd>{aberto.telefone}</dd>
            <dt className="text-muted-foreground">Renda familiar</dt>
            <dd className="tabular-nums">{formatBRL(aberto.rendaFamiliar)}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <Badge variant={STATUS[aberto.status].variant}>{STATUS[aberto.status].label}</Badge>
            </dd>
          </dl>
        ) : null}
      </Sheet>

      <AlertDialog
        open={paraExcluir != null}
        onOpenChange={(open) => !open && setParaExcluir(null)}
        title={`Excluir ${paraExcluir?.nome ?? "lead"}?`}
        description="O histórico de contatos também será apagado. Não dá para desfazer."
        confirmLabel="Excluir lead"
        confirmVariant="destructive"
        onConfirm={async () => {
          if (!paraExcluir) return
          await excluir(paraExcluir.id)
          toast.success("Lead excluído.")
        }}
      />
    </div>
  )
}
```

## 2. Painel (dashboard)

Filtro de período no topo, KPIs com `Sparkline`, gráficos em grade, lista curta numa `Card` sem padding.

```tsx
import * as React from "react"
import {
  BarChart,
  Card,
  type ColumnDef,
  DataTable,
  LineChart,
  SegmentedControl,
  Sparkline,
  Typography,
  formatBRL,
  formattedColumn,
} from "@amfernandesinc/ui"

type Periodo = "mes" | "trimestre" | "ano"
type Kpi = { titulo: string; valor: number; historico: number[]; dinheiro?: boolean }
type Painel = {
  kpis: Kpi[]
  vendasPorEmpreendimento: { empreendimento: string; unidades: number }[]
  leadsPorMes: { mes: string; portais: number; site: number; plantao: number }[]
  melhoresCorretores: { id: string; nome: string; vgv: number }[]
}

const corretoresColumns: ColumnDef<Painel["melhoresCorretores"][number]>[] = [
  { accessorKey: "nome", header: "Corretor" },
  formattedColumn({ accessorKey: "vgv", header: "VGV", format: (v: number) => formatBRL(v) }),
]

function KpiCard({ kpi }: { kpi: Kpi }) {
  const formatar = (v: number) => (kpi.dinheiro ? formatBRL(v) : new Intl.NumberFormat("pt-BR").format(v))
  return (
    <Card title={kpi.titulo} padding="compact" headingLevel={2}>
      <div className="flex items-end justify-between gap-4">
        <Typography variant="title" as="p" className="tabular-nums">
          {formatar(kpi.valor)}
        </Typography>
        <Sparkline
          data={kpi.historico}
          label={`${kpi.titulo} nos últimos ${kpi.historico.length} meses, de ${formatar(kpi.historico[0] ?? 0)} para ${formatar(kpi.valor)}`}
        />
      </div>
    </Card>
  )
}

export function PainelComercial({ dados, carregando, onPeriodo }: {
  dados: Painel
  carregando: boolean
  onPeriodo: (p: Periodo) => void
}) {
  const [periodo, setPeriodo] = React.useState<Periodo>("mes")
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Typography variant="heading" as="h1">
          Painel comercial
        </Typography>
        <SegmentedControl
          label="Período"
          value={periodo}
          onValueChange={(v) => {
            setPeriodo(v as Periodo)
            onPeriodo(v as Periodo)
          }}
          options={[
            { value: "mes", label: "Mês" },
            { value: "trimestre", label: "Trimestre" },
            { value: "ano", label: "Ano" },
          ]}
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dados.kpis.map((kpi) => (
          <KpiCard key={kpi.titulo} kpi={kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Vendas por empreendimento" headingLevel={2} padding="compact">
          <BarChart
            title="Unidades vendidas"
            data={dados.vendasPorEmpreendimento}
            category="empreendimento"
            orientation="horizontal"
            series={[{ key: "unidades", label: "Unidades" }]}
            loading={carregando}
          />
        </Card>
        <Card title="Leads por origem" headingLevel={2} padding="compact">
          <LineChart
            title="Leads por mês"
            data={dados.leadsPorMes}
            x="mes"
            series={[
              { key: "portais", label: "Portais", color: 1 },
              { key: "site", label: "Site", color: 2 },
              { key: "plantao", label: "Plantão", color: 3 },
            ]}
            loading={carregando}
          />
        </Card>
      </div>

      <Card title="Melhores corretores" headingLevel={2} padding="none">
        <DataTable
          aria-label="Melhores corretores"
          columns={corretoresColumns}
          data={dados.melhoresCorretores}
          getRowId={(r) => r.id}
          density="compact"
          loading={carregando}
        />
      </Card>
    </div>
  )
}
```

## 3. Página de detalhe com abas

```tsx
import { Pencil } from "lucide-react"
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Tabs,
  Typography,
  formatBRL,
  formatCPF,
  formatDate,
  formatPhone,
} from "@amfernandesinc/ui"

type Cliente = {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
  clienteDesde: string
  documentosPendentes: number
  contratos: { id: string; unidade: string; valor: number }[]
}

export function ClientePage({ cliente, editar }: { cliente: Cliente; editar: () => void }) {
  const iniciais = cliente.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Clientes", href: "/clientes" }, { label: cliente.nome }]} />
      <header className="flex flex-wrap items-center gap-4">
        <Avatar alt={cliente.nome} fallback={iniciais} />
        <div className="min-w-0 flex-1 space-y-1">
          <Typography variant="heading" as="h1" className="truncate">
            {cliente.nome}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            Cliente desde {formatDate(cliente.clienteDesde)}
          </Typography>
        </div>
        <Button variant="outline" onClick={editar}>
          <Pencil aria-hidden="true" />
          Editar
        </Button>
      </header>

      {cliente.documentosPendentes > 0 ? (
        <Alert
          variant="warning"
          title={`${cliente.documentosPendentes} documento${cliente.documentosPendentes === 1 ? "" : "s"} pendente${cliente.documentosPendentes === 1 ? "" : "s"}`}
          description="O repasse ao banco só começa com a documentação completa."
        />
      ) : null}

      <Tabs
        aria-label="Seções do cliente"
        defaultValue="dados"
        items={[
          {
            value: "dados",
            label: "Dados",
            content: (
              <Card title="Dados pessoais" headingLevel={2}>
                <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">CPF</dt>
                    <dd>{formatCPF(cliente.cpf)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Telefone</dt>
                    <dd>{formatPhone(cliente.telefone)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">E-mail</dt>
                    <dd>{cliente.email}</dd>
                  </div>
                </dl>
              </Card>
            ),
          },
          {
            value: "contratos",
            label: "Contratos",
            badge: <Badge variant="secondary">{cliente.contratos.length}</Badge>,
            content: (
              <ul className="divide-y divide-border rounded-container border border-border-strong">
                {cliente.contratos.map((c) => (
                  <li key={c.id} className="flex justify-between px-4 py-3 text-sm">
                    <span>Unidade {c.unidade}</span>
                    <span className="tabular-nums">{formatBRL(c.valor)}</span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]}
      />
    </div>
  )
}
```

## 4. Assistente em etapas com validação por etapa

```tsx
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import {
  Button,
  CPFInput,
  Card,
  CurrencyInput,
  Input,
  NumberInput,
  Select,
  Stepper,
  Typography,
  formatBRL,
  isValidCPF,
  toast,
} from "@amfernandesinc/ui"

type Venda = { nome: string; cpf: string; unidade: string; valor: number; parcelas: number | null }

const etapas = [
  { id: "comprador", label: "Comprador", campos: ["nome", "cpf"] as const },
  { id: "unidade", label: "Unidade", campos: ["unidade", "valor"] as const },
  { id: "pagamento", label: "Pagamento", campos: ["parcelas"] as const },
  { id: "revisao", label: "Revisão", campos: [] as const },
]

export function NovaVenda({ salvar }: { salvar: (v: Venda) => Promise<void> }) {
  const [ativa, setAtiva] = React.useState(0)
  const { register, control, trigger, handleSubmit, getValues, formState } = useForm<Venda>({
    mode: "onTouched",
    defaultValues: { nome: "", cpf: "", unidade: "", valor: 0, parcelas: null },
  })
  const etapa = etapas[ativa]

  const avancar = async () => {
    if (!etapa) return
    if (await trigger([...etapa.campos])) setAtiva((i) => i + 1)
  }

  const concluir = handleSubmit(async (venda) => {
    await salvar(venda)
    toast.success("Venda registrada.")
  })

  return (
    <div className="space-y-4">
      <Typography variant="heading" as="h1">
        Nova venda
      </Typography>
      <Card title={etapa?.label ?? "Venda"} headingLevel={2}>
      <form noValidate onSubmit={concluir} className="space-y-6">
        <Stepper
          steps={etapas.map(({ id, label }) => ({ id, label }))}
          activeStep={ativa}
          onStepClick={setAtiva}
          isStepClickable={(i) => i < ativa}
        />

        {etapa?.id === "comprador" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome do comprador"
              required
              {...register("nome", { required: "Informe o nome." })}
              error={formState.errors.nome?.message}
            />
            <Controller
              control={control}
              name="cpf"
              rules={{ validate: (v) => isValidCPF(v) || "CPF inválido." }}
              render={({ field, fieldState }) => (
                <CPFInput
                  label="CPF"
                  required
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        ) : null}

        {etapa?.id === "unidade" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="unidade"
              rules={{ required: "Escolha a unidade." }}
              render={({ field, fieldState }) => (
                <Select
                  label="Unidade"
                  required
                  options={[
                    { label: "Bloco A", options: [{ value: "A-101", label: "101" }, { value: "A-102", label: "102" }] },
                    { label: "Bloco B", options: [{ value: "B-201", label: "201" }] },
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="valor"
              rules={{ min: { value: 1, message: "Informe o valor da unidade." } }}
              render={({ field, fieldState }) => (
                <CurrencyInput
                  label="Valor"
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </div>
        ) : null}

        {etapa?.id === "pagamento" ? (
          <Controller
            control={control}
            name="parcelas"
            rules={{ required: "Informe as parcelas." }}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Parcelas"
                min={1}
                max={240}
                suffix="meses"
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message}
                wrapperClassName="max-w-xs"
              />
            )}
          />
        ) : null}

        {etapa?.id === "revisao" ? (
          <p className="text-sm">
            {getValues("nome")} compra a unidade {getValues("unidade")} por {formatBRL(getValues("valor"))} em{" "}
            {getValues("parcelas")} parcelas.
          </p>
        ) : null}

        <div className="flex justify-between">
          <Button variant="outline" disabled={ativa === 0} onClick={() => setAtiva((i) => i - 1)}>
            Voltar
          </Button>
          {etapa?.id === "revisao" ? (
            <Button type="submit" loading={formState.isSubmitting}>
              Registrar venda
            </Button>
          ) : (
            <Button onClick={avancar}>Continuar</Button>
          )}
        </div>
      </form>
      </Card>
    </div>
  )
}
```

`Card` aceita `headingLevel` de 2 a 6: o `h1` da página vem do `Typography`.

## 5. Configurações

Preferências com efeito imediato: `Switch` e `SegmentedControl`, cada mudança salva e confirmada.

```tsx
import * as React from "react"
import { Card, SegmentedControl, Separator, Switch, toast } from "@amfernandesinc/ui"

type Preferencias = { emailNovoLead: boolean; resumoDiario: boolean; tema: "claro" | "escuro" | "sistema" }

export function PreferenciasPage({
  inicial,
  salvar,
}: {
  inicial: Preferencias
  salvar: (p: Preferencias) => Promise<void>
}) {
  const [prefs, setPrefs] = React.useState(inicial)
  const mudar = async <K extends keyof Preferencias>(chave: K, valor: Preferencias[K]) => {
    const anterior = prefs
    const proximo = { ...prefs, [chave]: valor }
    setPrefs(proximo)
    try {
      await salvar(proximo)
      toast.success("Preferência salva.")
    } catch {
      setPrefs(anterior)
      toast.error("Não foi possível salvar. Tente de novo.")
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card title="Notificações" headingLevel={2}>
        <div className="space-y-4">
          <Switch
            label="E-mail a cada novo lead"
            description="Enviado na hora, para o corretor responsável."
            checked={prefs.emailNovoLead}
            onCheckedChange={(v) => mudar("emailNovoLead", v)}
          />
          <Separator />
          <Switch
            label="Resumo diário"
            description="Às 8h, com os leads e visitas do dia."
            checked={prefs.resumoDiario}
            onCheckedChange={(v) => mudar("resumoDiario", v)}
          />
        </div>
      </Card>
      <Card title="Aparência" headingLevel={2}>
        <SegmentedControl
          label="Tema"
          labelPosition="up"
          value={prefs.tema}
          onValueChange={(v) => mudar("tema", v as Preferencias["tema"])}
          options={[
            { value: "claro", label: "Claro" },
            { value: "escuro", label: "Escuro" },
            { value: "sistema", label: "Sistema" },
          ]}
        />
      </Card>
    </div>
  )
}
```
