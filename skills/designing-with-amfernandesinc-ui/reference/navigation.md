# Navegação

Todos os componentes de navegação são dirigidos por dados (`items`, `steps`, `groups`) e aceitam `renderLink` para usar o `<Link>` do seu roteador. `href` com protocolo inseguro (`javascript:`) é descartado: o item vira botão.

## Roteadores: `renderLink`

A lib entrega ao link tudo que um `<a>` recebe (`href`, `className`, `aria-current`, `onClick` da lib, `children`, `ref`). Repasse **todas** as props.

```tsx
// fora da verificação: depende de react-router e next
import { Link as RouterLink } from "react-router"
import NextLink from "next/link"
import type { RenderLink } from "@amfernandesinc/ui"

export const reactRouterLink: RenderLink = ({ href, ...props }) => <RouterLink to={href} {...props} />
export const nextLink: RenderLink = (props) => <NextLink {...props} />
```

Sem roteador, não passe nada: a lib usa `<a href>`.

## AppShell

O layout do app: menu lateral (recolhível para um trilho de ícones de 64px no desktop, gaveta no celular), barra superior (`navbar`) e a área de conteúdo (`<main id="conteudo">`, a única que rola). Escolha de recolher fica salva no `localStorage` (`storageKey`, um por app).

`items: AppShellItem[]`: `{ id, label, icon (componente), href, onClick, badge, disabled, disabledReason, items (submenu de um nível), defaultOpen }`, e `{ id, type: "section", label, items }` para títulos de seção. `isActive(item)` marca a página atual.

```tsx
import { Building2, ChartColumn, FileText, LayoutDashboard, LogOut, Settings, Users } from "lucide-react"
import {
  AppShell,
  type AppShellItem,
  Avatar,
  Button,
  DropdownMenu,
  type RenderLink,
  useAppShell,
} from "@amfernandesinc/ui"

const items: AppShellItem[] = [
  { id: "painel", label: "Painel", icon: LayoutDashboard, href: "/" },
  {
    id: "vendas",
    type: "section",
    label: "Vendas",
    items: [
      { id: "leads", label: "Leads", icon: Users, href: "/leads", badge: 12 },
      { id: "propostas", label: "Propostas", icon: FileText, href: "/propostas" },
      { id: "relatorios", label: "Relatórios", icon: ChartColumn, href: "/relatorios", disabled: true, disabledReason: "Disponível para o perfil Gestor" },
    ],
  },
  {
    id: "cadastros",
    label: "Cadastros",
    icon: Building2,
    items: [
      { id: "empreendimentos", label: "Empreendimentos", href: "/empreendimentos" },
      { id: "corretores", label: "Corretores", href: "/corretores" },
    ],
  },
  { id: "config", label: "Configurações", icon: Settings, href: "/configuracoes" },
]

function Conta({ nome, sair }: { nome: string; sair: () => void }) {
  const { collapsed } = useAppShell()
  return (
    <DropdownMenu
      side="top"
      trigger={
        <Button variant="ghost" className="w-full justify-start gap-2" aria-label={collapsed ? nome : undefined}>
          <Avatar alt={nome} fallback={nome.slice(0, 2).toUpperCase()} />
          {collapsed ? null : <span className="truncate">{nome}</span>}
        </Button>
      }
      items={[{ label: "Sair", icon: LogOut, onSelect: sair }]}
    />
  )
}

export function Layout({
  pathname,
  renderLink,
  usuario,
  sair,
  children,
}: {
  pathname: string
  renderLink?: RenderLink
  usuario: string
  sair: () => void
  children: React.ReactNode
}) {
  return (
    <AppShell
      items={items}
      isActive={(item) => (item.href === "/" ? pathname === "/" : !!item.href && pathname.startsWith(item.href))}
      renderLink={renderLink}
      brand={<img src="/logo.svg" alt="" className="size-full" />}
      brandText="AMF Vendas"
      storageKey="amf-vendas:menu"
      navbar={<Button className="ml-auto" size="sm">Novo lead</Button>}
      footer={<Conta nome={usuario} sair={sair} />}
    >
      {children}
    </AppShell>
  )
}
```

- `useAppShell()` (dentro do shell): `collapsed`, `isMobile`, `closeMenu()`, `toggle()` (atalho de teclado para recolher).
- `contentPadding={false}` para telas de borda a borda (mapa, quadro, tabela cheia).
- A página rola dentro do `<main>`, não na janela: passe `mainRef` à restauração de rolagem do roteador (ou `mainRef.current?.scrollTo(0, 0)` ao navegar).
- `disabledReason` explica um item indisponível (tooltip + descrição, alcançável por teclado).

## Breadcrumb

`items: { label, href, onClick, isCurrentPage }[]`; o último sem `href` é a página atual. `maxItems` recolhe o meio num "…" com menu. `ariaLabel` (padrão dos `labels`).

```tsx
import { Breadcrumb } from "@amfernandesinc/ui"

export function Trilha({ empreendimento, unidade }: { empreendimento: { id: string; nome: string }; unidade: string }) {
  return (
    <Breadcrumb
      maxItems={4}
      items={[
        { label: "Início", href: "/" },
        { label: "Empreendimentos", href: "/empreendimentos" },
        { label: empreendimento.nome, href: `/empreendimentos/${empreendimento.id}` },
        { label: `Unidade ${unidade}` },
      ]}
    />
  )
}
```

## Tabs

`items: { value, label, content, badge, disabled }[]` e `aria-label` (nome da lista de abas). Controle com `value`/`onValueChange` (ou `defaultValue`). Por padrão só a aba ativa fica montada; `keepMounted` mantém o conteúdo das outras (formulário não controlado, filtros, upload em andamento) e `lazy` monta cada uma na primeira visita.

```tsx
import * as React from "react"
import { Badge, Tabs } from "@amfernandesinc/ui"

export function AbasDoLead({ dados, historico, propostas, totalPropostas }: {
  dados: React.ReactNode
  historico: React.ReactNode
  propostas: React.ReactNode
  totalPropostas: number
}) {
  const [aba, setAba] = React.useState("dados")
  return (
    <Tabs
      aria-label="Seções do lead"
      value={aba}
      onValueChange={setAba}
      keepMounted
      lazy
      items={[
        { value: "dados", label: "Dados", content: dados },
        { value: "historico", label: "Histórico", content: historico },
        {
          value: "propostas",
          label: "Propostas",
          badge: <Badge variant="secondary">{totalPropostas}</Badge>,
          content: propostas,
        },
      ]}
    />
  )
}
```

## Accordion

`items: { value, title, content, action, disabled }[]`; `type="single"` (uma aberta; `collapsible` permite fechar todas) ou `type="multiple"`. `headingLevel` encaixa os títulos na hierarquia da página. `keepMounted` como em `Tabs`.

```tsx
import { Accordion } from "@amfernandesinc/ui"

export function PerguntasFrequentes() {
  return (
    <Accordion
      type="single"
      collapsible
      headingLevel={2}
      items={[
        { value: "itbi", title: "Quem paga o ITBI?", content: "O comprador, na escritura." },
        { value: "chaves", title: "Quando recebo as chaves?", content: "Depois da quitação ou do repasse ao banco." },
      ]}
    />
  )
}
```

## Pagination

Para listas fora da `DataTable` (que já tem a sua). `page` começa em **1**. Com `totalItems` + `pageSize` mostra "11–20 de 243"; só `totalPages` também serve; sem total, `hasMore` (paginação por cursor). `variant="pages"` (números) ou `"compact"` ("Página 3 de 10"). `getPageHref` gera links reais (`?page=3`).

```tsx
import { Pagination } from "@amfernandesinc/ui"

export function PaginacaoDeImoveis({ pagina, total, irPara }: { pagina: number; total: number; irPara: (p: number) => void }) {
  return (
    <Pagination
      page={pagina}
      onPageChange={irPara}
      totalItems={total}
      pageSize={12}
      getPageHref={(p) => `?pagina=${p}`}
    />
  )
}
```

## Stepper

`steps: { id, label, description, optional, disabled, status, content }[]` e `activeStep` (começa em **0**; `steps.length` marca todos como concluídos). `onStepClick` + `isStepClickable` para voltar a etapas anteriores (`(i) => i < activeStep`). `orientation` `"horizontal"` (padrão) ou `"vertical"` (com `content` sob a etapa ativa e `keepMounted`).

```tsx
import * as React from "react"
import { Button, Stepper } from "@amfernandesinc/ui"

const etapas = [
  { id: "comprador", label: "Comprador" },
  { id: "unidade", label: "Unidade" },
  { id: "pagamento", label: "Pagamento", description: "Entrada e parcelas" },
  { id: "revisao", label: "Revisão" },
]

export function AssistenteDeVenda({ conteudo }: { conteudo: (etapa: string) => React.ReactNode }) {
  const [ativa, setAtiva] = React.useState(0)
  const atual = etapas[ativa]
  return (
    <div className="space-y-6">
      <Stepper steps={etapas} activeStep={ativa} onStepClick={setAtiva} isStepClickable={(i) => i < ativa} />
      {atual ? conteudo(atual.id) : null}
      <div className="flex justify-between">
        <Button variant="outline" disabled={ativa === 0} onClick={() => setAtiva((i) => i - 1)}>
          Voltar
        </Button>
        <Button onClick={() => setAtiva((i) => Math.min(i + 1, etapas.length))}>
          {ativa === etapas.length - 1 ? "Concluir" : "Continuar"}
        </Button>
      </div>
    </div>
  )
}
```

## CommandPalette

Busca de comandos e navegação (⌘K). `open`/`onOpenChange` são obrigatórios e o atalho é seu. `title` (obrigatório, nome do diálogo), `groups: { heading, items }[]` com `{ id, label, icon (componente), shortcut, keywords, onSelect, disabled }`. Busca no servidor: `search`/`onSearchChange` + `shouldFilter={false}` + `loading`. `closeOnSelect` (padrão `true`).

```tsx
import { FileText, Plus, Users } from "lucide-react"
import * as React from "react"
import { CommandPalette } from "@amfernandesinc/ui"

export function Comandos({ navegar, novoLead }: { navegar: (href: string) => void; novoLead: () => void }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      title="Ir para ou executar"
      groups={[
        {
          heading: "Ações",
          items: [{ id: "novo-lead", label: "Novo lead", icon: Plus, shortcut: "N", onSelect: novoLead }],
        },
        {
          heading: "Páginas",
          items: [
            { id: "leads", label: "Leads", icon: Users, keywords: ["clientes", "contatos"], onSelect: () => navegar("/leads") },
            { id: "propostas", label: "Propostas", icon: FileText, onSelect: () => navegar("/propostas") },
          ],
        },
      ]}
    />
  )
}
```
