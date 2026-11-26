# Erros comuns e migração

## O jeito certo, de cada reflexo shadcn

Cada linha da tabela "Reflexo shadcn → jeito AMF" do `SKILL.md`, escrita por inteiro. Este bloco compila contra a lib.

```tsx
import { Copy, Trash2 } from "lucide-react"
import * as React from "react"
import {
  Accordion,
  Alert,
  AlertDialog,
  AppShell,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  CommandPalette,
  Dialog,
  DropdownMenu,
  IconButton,
  Input,
  Popover,
  RadioGroup,
  SegmentedControl,
  Select,
  Sheet,
  Tabs,
  Token,
  Tooltip,
  cn,
  formatBRL,
  toast,
} from "@amfernandesinc/ui"

export function JeitoCerto({ excluir }: { excluir: () => Promise<void> }) {
  const [paletaAberta, setPaletaAberta] = React.useState(false)
  return (
    <AppShell items={[{ id: "leads", label: "Leads", href: "/leads" }]}>
      <div className={cn("grid gap-4", "md:grid-cols-2")}>
        <Card title="Proposta 123" description="Enviada ontem" headerAction={<Button size="sm">Abrir</Button>} footer={<span>{formatBRL(250000)}</span>}>
          Corpo do card
        </Card>
        <Dialog trigger={<Button>Abrir</Button>} title="Editar proposta" footer={<Button>Salvar</Button>}>
          Corpo do dialog
        </Dialog>
        <Sheet side="right" trigger={<Button variant="outline">Detalhes</Button>} title="Detalhes do lead">
          Corpo do sheet
        </Sheet>
        <AlertDialog
          trigger={<Button variant="destructive">Excluir</Button>}
          title="Excluir proposta?"
          confirmLabel="Excluir"
          confirmVariant="destructive"
          onConfirm={excluir}
        />
        <Select label="Etapa" options={[{ value: "visita", label: "Visita agendada" }]} />
        <DropdownMenu
          trigger={<Button variant="outline">Ações</Button>}
          items={[{ label: "Duplicar", icon: Copy, onSelect: () => toast("Duplicado.") }, { type: "separator" }, { label: "Excluir", variant: "destructive" }]}
        />
        <Tabs aria-label="Seções" items={[{ value: "dados", label: "Dados", content: "…" }]} />
        <Accordion type="single" collapsible items={[{ value: "a", title: "Pergunta", content: "Resposta" }]} />
        <RadioGroup label="Tipo de unidade" options={[{ value: "apto", label: "Apartamento" }, { value: "casa", label: "Casa" }]} />
        <SegmentedControl label="Visão" options={[{ value: "lista", label: "Lista" }, { value: "quadro", label: "Quadro" }]} />
        <Tooltip content="Copia o link da proposta">
          <Button variant="ghost">Copiar link</Button>
        </Tooltip>
        <Popover trigger={<Button variant="outline">Filtros</Button>} aria-label="Filtros">
          <Input label="Cidade" />
        </Popover>
        <Avatar src="/ana.jpg" alt="Ana Souza" fallback="AS" />
        <Alert variant="warning" title="Documentos pendentes" description="Envie o comprovante de renda." />
        <Breadcrumb items={[{ label: "Leads", href: "/leads" }, { label: "Ana Souza" }]} />
        <IconButton icon={<Trash2 />} label="Excluir proposta" />
        <Token label="Urgente" color="red" onRemove={() => {}} />
        <Button onClick={() => setPaletaAberta(true)}>Comandos</Button>
        <CommandPalette
          open={paletaAberta}
          onOpenChange={setPaletaAberta}
          title="Comandos"
          groups={[{ heading: "Páginas", items: [{ label: "Leads", onSelect: () => {} }] }]}
        />
      </div>
    </AppShell>
  )
}
```

## Catálogo

| Erro | Por que está errado | Faça assim |
|---|---|---|
| Na 0.5.x, CSS sem `@source "…/@amfernandesinc/ui/dist"` | O Tailwind v4 não lê `node_modules`: classes da lib não existem e overlays saem sem estilo | Adicione o `@source` com o caminho relativo ao CSS (na 0.6 o `styles` já traz) |
| `@import "tailwindcss"` junto com `@amfernandesinc/ui/styles` | Carrega o Tailwind duas vezes | Só `fonts` + `styles` + `@source` |
| `toast()` sem `<Toaster />` | Não aparece nada | Monte `<Toaster />` uma vez na raiz |
| `:root { --primary: … }` / `@theme { --color-primary }` no app | Briga com os tokens, quebra o tema escuro e o contraste validado | Use os tokens como estão |
| `shadow-md`, `rounded-xl`, `rounded-[10px]` num componente | O sistema é flat e tem três raios por papel | Borda + superfície; `rounded-inner/element/container` |
| `bg-white`, `text-gray-500`, `border-gray-200` | Não acompanham o tema escuro | `bg-card`, `text-muted-foreground`, `border-border` |
| `<CardHeader>`, `<DialogContent>`, `<SelectItem>` | Não existem: os componentes são dirigidos por props | Ver o bloco acima |
| `<Button size="icon"><Trash2 /></Button>` | Botão sem nome acessível | `<IconButton icon={<Trash2 />} label="Excluir" />` |
| `IconButton icon={Trash2}` | `icon` do `IconButton` é o elemento | `icon={<Trash2 />}` (já `Token` e os `items` pedem o componente) |
| `<Button>` de envio sem `type="submit"` | `Button` é `type="button"` por padrão | `type="submit"` no botão que envia |
| `<div onClick>` / `<span onClick>` | Sem teclado, sem papel, sem foco | `Button`, `IconButton`, link, `onRowClick` |
| Rótulo + `<input>` + `<p>` de erro à mão | Perde a ligação de nome, descrição e erro | O campo da lib com `label`, `description`, `error` |
| `{...register("valor")}` num `CurrencyInput` | Ele entrega número por `onValueChange`, não evento | `Controller` |
| `useForm()` sem `defaultValues` | Campo troca de não controlado para controlado | `defaultValues` com o vazio de cada tipo |
| `<form>` sem `noValidate` com `required` | O balão do navegador aparece antes das suas mensagens | `noValidate` |
| `<CurrencyInput value={centavos} />` | O valor é em reais | `value={reais}`; centavos só para contas |
| `<PercentageInput value={0.3} />` | O valor é 0–100 | `value={30}` |
| `valor * 0.07` com o float do `CurrencyInput` | Erro de arredondamento | `percentOfTotal(7, valor)` ou contas em `toCents` |
| `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })` | Formatação divergente da lib | `formatBRL(v)` |
| `new Date("2026-03-10")` para data pura | Vira meia-noite UTC: no Brasil, mostra dia 9 | Guarde `"2026-03-10"`; `formatDate`, `parseDate` |
| Máscara de CPF/CNPJ/telefone caseira | Duplica a lib e erra colagem e CNPJ alfanumérico | Os inputs de domínio + `isValid*` + `format*` |
| Guardar o CPF com máscara | O valor da lib é só dígitos | Guarde dígitos; exiba com `formatCPF` |
| `maxSize={2097152}` | Número mágico | `maxSize={mb(2)}` |
| `DataTable` esperando busca/ordenação sozinha | São opt-in | `searchableColumns`, `sortableColumns` |
| `DataTable` sem `getRowId` com dados que mudam | Estado de linha pula para outra linha | `getRowId={(r) => r.id}` |
| Paginação no servidor sem `rowCount`/`manualPagination` | Total e páginas errados | `manualPagination`, `pageIndex`, `onPaginationChange`, `rowCount` |
| Export no servidor sem `fetchAll` | Exporta só a página atual | `downloadable={{ fetchAll }}` |
| Menu "…" de linha com `modal` padrão | Trocar de linha leva dois cliques | `DropdownMenu modal={false}` |
| `Select` com 200 opções | Sem busca, lista enorme | `Combobox` |
| `Tooltip` com informação essencial | Não existe no toque | Texto visível; tooltip só complementa |
| `recharts`/Chart.js num app AMF | Cores e acessibilidade fora do sistema | `BarChart`, `LineChart`, `Sparkline` |
| Gráfico com dois eixos Y | Leitura enganosa | Dois gráficos |
| Sete séries num gráfico | Acima de 6 não há cor distinguível | Agrupe em "Outros" ou divida |
| `Image` sem `alt` / `Video` sem `aria-label` | Sem nome acessível | `alt` (ou `decorative`), `aria-label` |
| `Card headingLevel={1}` | Aceita 2 a 6 | O `h1` da página vem do `Typography` |
| `z-[9999]`, `duration-300` em overlay seu | Fura as camadas e o movimento do sistema | `z-(--z-popover)`, `duration-(--duration-fast)` |
| `clsx`/`tailwind-merge` direto | Duplica o `cn` | `cn` da lib |
| `forwardRef` | React 19 passa `ref` como prop | `ref` comum |
| Texto pt-BR fixo num componente compartilhado | Não dá para traduzir | `labels` ou props de texto |

## Versões: 0.5.x e 0.6

Esta skill descreve a **0.6** (o código atual do repositório, próximo release). Confira a versão instalada em `node_modules/@amfernandesinc/ui/package.json`. A 0.5.x não tem:

- tema escuro (era só claro) e os três raios (era 4px em tudo);
- `Select`, `NumberInput`, `Slider`, `IconButton`, `SegmentedControl`, `Token`, `DropdownMenu`, `EmptyState`, `Pagination`, `Stepper`, `Schedule`, `Tour`, `BarChart`, `LineChart`, `Sparkline`;
- `AppShell` (era `Sidebar`), `size` em botões e campos, `readOnly` em todos os campos, `labels` em todos os componentes.

Num app em 0.5.x, use só o que o `dist/index.d.ts` instalado exporta; não importe um componente que não está lá.

### Migrar de 0.5.x para 0.6

Mudanças que quebram:

| Mudança | O que fazer |
|---|---|
| Tokens de status claros saem (`--status-*-bg`/`-text`/`-border`, classes `bg-status-*`, `text-status-*`, `border-status-*`) | Procure `status-` no app: a classe some sem erro de compilação. Troque por `bg-success text-success-foreground` (e `warning`, `info`, `destructive`) ou `<Badge variant="success" dot>`. |
| `Sidebar` sai, entra `AppShell` (subpath `/app-shell`) | `items` iguais (`SidebarItem` virou `AppShellItem`, com alias). Usuário, perfil e sair vão no `footer`. O `<main>` com rolagem sai do app: o conteúdo vai como `children`. Sob outra barra fixa, `className="h-full"`. |
| `Button` nasce `type="button"` | Ponha `type="submit"` nos botões que enviam formulário. |
| `Badge` é `<span>` | Só muda se você estilizava `div` dentro dele. |
| Raio em três níveis | `rounded-md` passa de 4px a 8px e `rounded-lg`+ a 12px nas suas telas: revise cantos. |
| Borda translúcida em dois níveis | Molduras entre camadas: `border-border-strong`; divisórias internas: `border-border`. |
| `Video` mostra o quadro inteiro (`objectFit="contain"`) | Para o corte antigo: `objectFit="cover"`. |
| `Image` com `src` vazio mostra "Sem imagem" | Não é mais erro; use `fallback` para personalizar. |
| `addMonths` para no fim do mês | `addMonths("2024-01-31", 1)` dá 29/02/2024 (antes 02/03). Revise cálculos de vencimento que dependiam do estouro. |
| Export da `DataTable` sem `xlsx` | Nada a fazer; se o app dependia do `xlsx` transitivo, declare-o. |
| `lib/date` em `America/Sao_Paulo` | `formatDate("2024-01-15T14:30:00Z", "brl-full")` passa de 14:30 a 11:30. Data pura em instante UTC (`"…T00:00:00.000Z"`): passe `"UTC"` como fuso ou corte para `YYYY-MM-DD`. |
| `DateInput` é um campo de texto | `ref` de `HTMLInputElement` (era `HTMLButtonElement`); nos testes, `getByRole("textbox")`. Texto incompleto ou inválido reporta `""`. |
| `--accent` é o azul de seleção | Onde `bg-accent` era fundo neutro, use `bg-muted`. Todas as cores mudam de valor; `--chart-2` a `--chart-5` mudam de matiz. |
| `--background` é só a página | Painel ou barra do app com `bg-background` passa a `bg-card border-border-strong`. |
| Tailwind 4.1 ou mais novo (peer `tailwindcss@^4.1`) | Atualize o `tailwindcss` e o plugin dele (`@tailwindcss/vite` ou `@tailwindcss/postcss`) do app. |

Mudanças de comportamento: o `TimePicker` reporta `""` a cada edição que deixa a hora inválida; o `Calendar` marca o hoje de São Paulo (passe `today` para outro fuso); campo somente leitura vazio não mostra placeholder; o `Schedule` mostra os eventos em `timeZone` (São Paulo) e, com SSR, precisa de `defaultDate` e `today` para o servidor mandar a agenda pronta. O passo a passo completo fica na página "Migração 0.6" do Storybook.

Tema escuro: opcional; ligue a classe `dark` no `<html>` (ou numa seção) quando quiser e troque cores fixas das suas telas por tokens. Numa seção, os menus e dialogs abertos dali também saem escuros.

O `@source "…/@amfernandesinc/ui/dist"` do CSS do app pode sair: na 0.6 o `styles` já o declara (deixá-lo não atrapalha).

### Escopo antigo e cópias do shadcn

- `@am-fernandes/ui` → `@amfernandesinc/ui` (mesma API da versão correspondente).
- App com cópias locais do shadcn (`src/components/ui/*`): troque um import por vez (`from "@/components/ui/button"` → `from "@amfernandesinc/ui"`), reescreva os compostos (`<Card><CardHeader>` etc.) com as props da lib, teste a tela, e só então apague a cópia local.
