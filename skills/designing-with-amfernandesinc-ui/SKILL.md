---
name: designing-with-amfernandesinc-ui
description: Use ao construir, modificar, estilizar, testar ou revisar qualquer UI React num projeto que depende de @amfernandesinc/ui (o design system da AM Fernandes, "AMF UI", "nossa lib de UI"). Cobre setup do Tailwind v4 (inclusive o @source que a 0.5.x exige no app, sem o qual os overlays saem sem estilo), tema claro e escuro, escolha e composição dos mais de 60 componentes, formulários com react-hook-form, dinheiro em BRL, percentuais, datas sem bug de fuso, inputs brasileiros (CPF/CNPJ/CEP/telefone), tabelas (DataTable), gráficos (BarChart/LineChart/Sparkline), overlays, navegação (AppShell), textos trocáveis (labels/i18n), acessibilidade e as regras visuais do sistema (flat, raio por papel, densidade). Dispara em qualquer import de @amfernandesinc/ui (ou do legado @am-fernandes/ui).
---

# Construindo interfaces com @amfernandesinc/ui

`@amfernandesinc/ui` é o design system da AM Fernandes: React 19 + Tailwind v4, mais de 60 componentes acessíveis (WCAG 2.1 AA), tema claro e escuro, textos em pt-BR trocáveis, inputs brasileiros e helpers de dinheiro, data e formatação. Os componentes usam Radix por baixo, mas **a API é da lib, não do Radix nem do shadcn/ui**.

> **A regra que evita 80% dos erros:** parece shadcn/ui, mas não é. Não existem `<CardHeader>`, `<DialogContent>`, `<SelectItem>`, `<DropdownMenuItem>`, `<TabsTrigger>`. Cada componente é **um** elemento, dirigido por props e por dados (`items`, `options`, `steps`, `series`). Na dúvida sobre o nome ou o formato de uma prop, abra `reference/api/` (gerada do código, sempre atual) em vez de chutar pela memória do shadcn.

Dois enquadramentos para toda decisão:

- **O layout é seu; a aparência dos componentes é do sistema.** Organize a página com Tailwind (`flex`, `grid`, `gap-*`, `space-y-*`, larguras). Não reestilize os componentes por dentro (cor, raio, sombra, altura).
- **Os tokens são a API visual.** Cor, raio, altura, z-index e movimento vêm de classes de token (`bg-card`, `text-muted-foreground`, `rounded-element`, `h-control-md`, `z-(--z-popover)`). Nunca hex fixo, nunca redefinir tokens.

## Quando usar esta skill

- O `package.json` tem `@amfernandesinc/ui` (ou o escopo legado `@am-fernandes/ui`).
- Há `import … from "@amfernandesinc/ui"` ou de um subpath (`@amfernandesinc/ui/button`).
- Pedem tela, formulário, tabela, gráfico, modal, menu, sidebar ou qualquer UI num repo que já usa o pacote.
- Falam em "AMF UI", "design system da AM Fernandes", "nossa lib de componentes".

Não aplique estas APIs a projetos com shadcn/ui puro, MUI, Chakra etc.: a aparência rima, a API não.

## Antes de escrever código

1. **Veja a versão instalada:** `node_modules/@amfernandesinc/ui/package.json`. Esta skill descreve a **0.6** (o código atual da lib). A 0.5.x não tem tema escuro, os três raios, `Select`, `NumberInput`, `Slider`, `IconButton`, `DropdownMenu`, gráficos, `AppShell` (era `Sidebar`) e outros: num app em 0.5.x, use só o que o `dist/index.d.ts` instalado exporta, e veja a migração em [`reference/anti-patterns.md`](reference/anti-patterns.md#versões-05x-e-06).
2. **Confira o setup** (próxima seção): os dois imports de CSS (mais a linha `@source` na 0.5.x) e um `<Toaster />`. Se faltar algo, conserte primeiro: sem isso, componentes aparecem sem estilo e toasts somem em silêncio.
3. **Escolha os componentes** pelo mapa abaixo e **leia as props exatas** em `reference/api/` antes de usar cada um.

## Setup (a parte que quebra em silêncio)

No CSS de entrada do app (`src/index.css`, `app/globals.css`):

```css
@import "@amfernandesinc/ui/fonts";   /* Geist e Geist Mono, self-hosted */
@import "@amfernandesinc/ui/styles";  /* tokens + Tailwind v4 + o @source da própria lib */
```

- **Não** escreva `@import "tailwindcss"` de novo: `./styles` já faz isso.
- **Na 0.5.x, acrescente** `@source "../node_modules/@amfernandesinc/ui/dist";` (caminho relativo a esse CSS). O Tailwind v4 não lê `node_modules`; sem a linha, as classes usadas só dentro da lib não existem e Dialog, Popover, Select e DataTable aparecem sem estilo. Na 0.6 o `styles` já declara isso (a linha a mais não atrapalha).
- **Monte `<Toaster />` uma vez**, na raiz. Sem ele, `toast(...)` não mostra nada.
- **Tema escuro:** classe `dark` no `<html>` (ou num ancestral). Não há provider da lib; para seguir o sistema, use `next-themes` com `attribute="class"`.
- **Peer deps:** `react@^19`, `react-dom@^19`, `tailwindcss@^4.1`. React 18 não funciona (`ref` como prop). `react-hook-form` e `@tanstack/react-table` (tipos de coluna) são do app.

Detalhes, Next.js, Vite e verificação em [`reference/setup-and-theming.md`](reference/setup-and-theming.md).

```tsx
import { Toaster } from "@amfernandesinc/ui"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
```

## Regras visuais do sistema

São decisões de produto, garantidas no CI da lib. Quebrá-las deixa a tela fora do padrão.

| Regra | Na prática |
|---|---|
| **Flat, sem sombra** | Nunca `shadow-*`. Hierarquia vem de borda (`border-border` / `border-border-strong`), superfície (`bg-background` → `bg-card`), espaço e tipografia. |
| **Raio por papel, 3 níveis** | `rounded-inner` 4px (peças dentro de controles), `rounded-element` 8px (o controle: botão, campo, item de menu), `rounded-container` 12px (card, dialog, painel). A escala do Tailwind cai nesses três (`rounded-sm`=4, `rounded-md`=8, `rounded-lg`…`rounded-4xl`=12). Nada de `rounded-[10px]`. `rounded-full` só para avatar, pílula, ponto. |
| **Claro e escuro** | Use só tokens de cor: a tela acompanha o tema sozinha. Ajuste exclusivo do escuro: variante `dark:`. Teste os dois temas. |
| **Densidade enterprise** | Corpo `text-sm` (14px). Controles com `size` `sm` 32px, `md` 40px (padrão), `lg` 44px; campos e botões do mesmo `size` alinham. Para algo seu na mesma altura: `h-control-md`. |
| **Foco único** | Um anel de foco para tudo: em elemento clicável seu, `focus-visible:focus-outline` (ou `focus-visible:focus-outline-inset` em célula/linha). Não remova o foco dos componentes. |
| **Estados por camada** | Hover/pressed de superfícies clicáveis suas: utilitário `state-layer` (pinta uma camada da cor do texto). Não invente `hover:bg-gray-100`. |
| **Cursor** | Tudo que é clicável tem `cursor-pointer` (os componentes já têm; o seu também). |
| **z-index e movimento** | Overlays usam `--z-overlay/modal/popover/tooltip/toast` (40→80) e as durações `--duration-*`. Nunca `z-[9999]` nem `duration-[…]` ad hoc. Movimento reduzido é respeitado. |
| **Texto em pt-BR** | Todo texto da UI em português ("Salvar", "Cancelar"). Os componentes já trazem pt-BR e aceitam `labels` para trocar. |
| **Cor com significado** | `primary` é a ação principal; `destructive` (erro, excluir), `success`, `warning`, `info` só pelo significado e sempre com texto/ícone, nunca cor sozinha. Categorias (tags, agenda) usam a paleta `category-*` via `Token color`. |

## Reflexo shadcn → jeito AMF

| Você escreveria (errado aqui) | Jeito AMF |
|---|---|
| `<Card><CardHeader><CardTitle>` | `<Card title="…" description="…" headerAction={…} footer={…}>corpo</Card>` |
| `<Dialog><DialogTrigger/><DialogContent>…` | `<Dialog trigger={<Button>Abrir</Button>} title="…" footer={…}>corpo</Dialog>` |
| `<Sheet><SheetContent side="right">` | `<Sheet side="right" trigger={…} title="…">corpo</Sheet>` |
| `<AlertDialog>` com `AlertDialogAction` | `<AlertDialog title="…" confirmVariant="destructive" onConfirm={excluir} trigger={…} />` |
| `<Select><SelectTrigger/><SelectContent><SelectItem/>` | `<Select label="…" options={[{ value, label }]} />` (até ~15 opções) ou `<Combobox>` (busca, muitas, múltipla) |
| `<DropdownMenu><DropdownMenuTrigger/><DropdownMenuItem/>` | `<DropdownMenu trigger={…} items={[{ label, onSelect }, { type: "separator" }]} />` |
| `<Tabs><TabsList><TabsTrigger/>…<TabsContent/>` | `<Tabs aria-label="…" items={[{ value, label, content }]} />` |
| `<Accordion><AccordionItem><AccordionTrigger/>` | `<Accordion type="single" items={[{ value, title, content }]} />` |
| `<RadioGroup><RadioGroupItem/>` | `<RadioGroup label="…" options={[{ value, label }]} />` |
| `<ToggleGroup>` | `<SegmentedControl label="…" options={[…]} />` |
| `<Tooltip><TooltipTrigger/><TooltipContent/>` + provider | `<Tooltip content="…"><Button>…</Button></Tooltip>` |
| `<Popover><PopoverTrigger/><PopoverContent/>` | `<Popover trigger={…} aria-label="…">conteúdo</Popover>` |
| `<Avatar><AvatarImage/><AvatarFallback/>` | `<Avatar src="…" alt="Ana Souza" fallback="AS" />` |
| `<Alert><AlertTitle/><AlertDescription/>` | `<Alert variant="warning" title="…" description="…" />` |
| `<Breadcrumb><BreadcrumbList><BreadcrumbItem/>` | `<Breadcrumb items={[{ label, href }]} renderLink={…} />` |
| `<Command><CommandInput/><CommandItem/>` | `<CommandPalette open onOpenChange title="…" groups={[…]} />` |
| `<Button size="icon"><Trash/></Button>` | `<IconButton icon={<Trash2 />} label="Excluir" />` (nome acessível e tooltip inclusos) |
| `Button size="sm"` | Existe: `size="sm" \| "md" \| "lg"`. `variant`: `default`, `destructive`, `secondary`, `outline`, `ghost`, `link`. |
| Badge com X para remover | `<Token label="…" onRemove={…} />` |
| `const { toast } = useToast()` | `import { toast } from "@amfernandesinc/ui"` + `<Toaster />` montado |
| `<ChartContainer>` / recharts | `<BarChart>`, `<LineChart>`, `<Sparkline>` da lib |
| `<Form><FormField><FormItem>` | react-hook-form direto; o campo da lib tem `label`/`description`/`error` |
| `<Sidebar><SidebarMenu>` | `<AppShell items={[…]} renderLink={…}>página</AppShell>` |
| `<table>` montado à mão | `<DataTable columns={…} data={…} />` (ou `tableStyles()` numa tabela estática) |
| `<label>` + `<input>` + `<p>` de erro | `<Input label="…" description="…" error={msg} required />` |
| `forwardRef` | `ref` como prop comum (React 19) |
| `clsx` / `twMerge` direto | `cn` da lib |
| `toLocaleString("pt-BR", { style: "currency" })` | `formatBRL(valor)` |

## Mapa de componentes ("preciso de…")

| Preciso de | Use |
|---|---|
| Texto, e-mail, senha, busca | `Input` (`leadingIcon`/`trailingIcon`, `size`) |
| Texto longo | `Textarea` (`maxLength` mostra contador; `autoResize`) |
| Número inteiro ou decimal, quantidade, área | `NumberInput` (`value: number \| null`, `decimals`, `min`/`max`, `steppers`, `suffix`) |
| Dinheiro (BRL) | `CurrencyInput` (`value` em **reais**, float) |
| Percentual | `PercentageInput` (`value` 0–`max`, ex.: `12.5` = 12,5 %) |
| CPF, CNPJ, CEP, telefone | `CPFInput`, `CNPJInput`, `CEPInput` (`onComplete` para buscar endereço), `PhoneInput`: `value` só dígitos + `isValid*` |
| Escolher 1 de poucas (≤ ~15) | `Select` |
| Escolher com busca, muitas, várias ou criar nova | `Combobox` (`multiple`, `creatable`, `onSearchChange` para busca no servidor) |
| 2 a 5 opções sempre visíveis | `RadioGroup` (campo) ou `SegmentedControl` (alternância compacta, filtros, modo de visão) |
| Liga/desliga de formulário | `Switch` (campo com `label`) |
| Botão de alternância (toolbar) | `Toggle` (`pressed`) |
| Marcar itens / aceite | `Checkbox` (aceita `"indeterminate"`) |
| Faixa ou valor num intervalo | `Slider` (`range` para mínimo/máximo, `marks`) |
| Lista de valores digitados (tags, números) | `MultiInput` (`type="number"` para inteiros) |
| Data | `DateInput` (digitável, `"yyyy-MM-dd"`) |
| Período | `DateRangePicker` (`{ from, to }` ISO) |
| Hora | `TimePicker` (`"HH:mm"`) |
| Calendário inline | `Calendar` (props do react-day-picker) |
| Código de verificação | `InputOTP` (`length`) |
| Arquivos (com câmera, preview, anexos do servidor) | `FileUpload` (`File[]`; `maxSize={mb(10)}`) |
| Ação | `Button` (`variant`, `size`, `loading`, `asChild`) |
| Ação só com ícone | `IconButton` (`icon`, `label` obrigatórios) |
| Status curto | `Badge` (`variant`, `dot`) |
| Etiqueta/categoria, removível ou link | `Token` (`color`, `onRemove`, `href`) |
| Pessoa | `Avatar` |
| Títulos e texto | `Typography` (`variant`: `heading`, `title`, `subtitle`, `lead`, `body`, `caption`; `as`) |
| Mensagem fixa na página | `Alert` |
| Aviso passageiro | `toast.success/error/info/warning/promise` |
| Confirmar algo destrutivo | `AlertDialog` |
| Formulário ou detalhe em modal | `Dialog` (`size` `sm`→`xl`, `footer`) |
| Painel lateral (filtros, detalhe) | `Sheet` (`side`, `size`) |
| Conteúdo interativo ancorado | `Popover` |
| Menu de ações | `DropdownMenu` (itens, checkbox, radio, submenu, links) |
| Dica curta ao passar o mouse | `Tooltip` (nunca informação essencial) |
| Tour guiado | `Tour` (`steps` com `target`) |
| Seção que abre/fecha | `Collapsible` (uma) / `Accordion` (lista) |
| Progresso | `Progress` (`value` 0–100; `null` = indeterminado) |
| Carregando | `Skeleton`, `SkeletonGroup`; `loading` em `DataTable`, gráficos, `Schedule` |
| Bloco com título e ações | `Card` (`padding`, `headingLevel`) |
| Nada para mostrar | `EmptyState` (`title`, `description`, `actions`) |
| Tabela com busca, ordenação, paginação, seleção, export | `DataTable` (+ `dateColumn`, `formattedColumn`) |
| Tabela estática simples | `tableStyles()` |
| Árvore (pastas, estrutura) | `Tree` (`onLoadChildren` para carregar sob demanda) |
| Agenda/calendário de eventos | `Schedule` (mês, semana, dia, lista) |
| Gráfico de barras / linhas / tendência | `BarChart` / `LineChart` / `Sparkline` |
| Imagem, vídeo | `Image` (`alt` obrigatório, `fallback`), `Video` |
| Área com rolagem | `ScrollArea` (dê `aria-label` se o conteúdo for importante) |
| Separador | `Separator` |
| Layout do app (menu lateral, topo) | `AppShell` (+ `useAppShell`) |
| Trilha | `Breadcrumb` |
| Abas | `Tabs` |
| Paginação fora da DataTable | `Pagination` |
| Assistente em etapas | `Stepper` |
| Busca de comandos ⌘K | `CommandPalette` (você registra o atalho) |

**Select × Combobox:** `Select` é a lista simples, sem busca (como um `<select>`). Passou de ~15 opções, precisa buscar, escolher várias ou criar valor: `Combobox`.
**Switch × Toggle × Checkbox:** `Switch` é um campo de formulário com efeito imediato ("Notificar por e-mail"); `Checkbox` marca itens ou aceite e combina com "Salvar"; `Toggle` é botão de toolbar (negrito, filtro ligado), não campo.

## O contrato de campo

Todo campo (`Input`, `Textarea`, `Select`, `Combobox`, `NumberInput`, `CurrencyInput`, `PercentageInput`, `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput`, `DateInput`, `DateRangePicker`, `TimePicker`, `MultiInput`, `InputOTP`, `FileUpload`, `Slider`, `Checkbox`, `Switch`, `RadioGroup`, `SegmentedControl`) traz o próprio rótulo, ajuda e erro:

- `label` (o nome acessível), `description` (ajuda, ligada por `aria-describedby`), `error` (borda vermelha, `aria-invalid`, mensagem com `role="alert"`).
- `required` (asterisco + obrigatório para o navegador e o leitor de tela), `disabled` (sai do formulário), `readOnly` (mostra, recebe foco, vai no formulário).
- `labelPosition`: `"up"` (padrão, acima do campo), `"left"`, `"hidden"` (some da tela, continua para o leitor de tela).
- `size`: `"sm" | "md" | "lg"`. `name` (e `form`): o valor vai no `FormData`, sem máscara.

A lib **não valida**: quem decide o erro é o app. Com react-hook-form, campos de `onChange(event)` (`Input`, `Textarea`, `Checkbox`, `Switch` simples) usam `register`; todos os outros entregam o valor e usam `Controller`. Use `noValidate` no `<form>` para que as mensagens sejam as suas, no visual da lib. Veja [`reference/forms.md`](reference/forms.md).

```tsx
import { Controller, useForm } from "react-hook-form"
import { Button, CurrencyInput, Input, Select } from "@amfernandesinc/ui"

type Proposta = { cliente: string; valor: number; etapa: string }

export function PropostaForm({ onSave }: { onSave: (p: Proposta) => void }) {
  const { register, control, handleSubmit, formState } = useForm<Proposta>({
    defaultValues: { cliente: "", valor: 0, etapa: "" },
  })
  return (
    <form noValidate onSubmit={handleSubmit(onSave)} className="grid max-w-md gap-4">
      <Input
        label="Cliente"
        required
        {...register("cliente", { required: "Informe o cliente." })}
        error={formState.errors.cliente?.message}
      />
      <Controller
        control={control}
        name="valor"
        rules={{ min: { value: 0.01, message: "O valor precisa ser maior que zero." } }}
        render={({ field, fieldState }) => (
          <CurrencyInput
            label="Valor da proposta"
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="etapa"
        rules={{ required: "Escolha a etapa." }}
        render={({ field, fieldState }) => (
          <Select
            label="Etapa"
            required
            options={[
              { value: "visita", label: "Visita agendada" },
              { value: "proposta", label: "Proposta enviada" },
              { value: "fechado", label: "Fechado" },
            ]}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button type="submit" loading={formState.isSubmitting} className="justify-self-start">
        Salvar proposta
      </Button>
    </form>
  )
}
```

`Button` é `type="button"` por padrão: o de envio precisa de `type="submit"`.

## Dinheiro, números e datas

- **Faça contas em centavos** (`toCents`, `fromCents`, `percentOfTotal`), exiba com `formatBRL` ("R$ 1.234,56") ou `toBRLMoney` ("1.234,56"). Nunca `valor * 0.07` no float.
- `CurrencyInput.value` é **reais** (float), não centavos. `PercentageInput.value` é `12.5` para 12,5 %, não `0.125`. Para campos que podem ficar vazios, `emptyValue="null"`.
- Texto digitado por humanos ("1.234,5", "R$ 1.500"): `parseBRNumber`.
- **Datas:** use `lib/date` (`formatDate`, `parseDate`, `addDays`, `diffInDays`, `isSameDay`…), que trata data pura (`"2024-01-15"`, nunca muda de dia) e instante (fuso `America/Sao_Paulo` por padrão). `DateInput` e `DateRangePicker` trabalham com `"yyyy-MM-dd"`; `Calendar` e `Schedule` com `Date`.
- **Dados brasileiros:** os inputs guardam só dígitos e formatam a exibição; valide com `isValidCPF`, `isValidCNPJ`, `isValidCEP`, `isValidPhone`; formate texto com `formatCPF`, `formatCNPJ`, `formatCEP`, `formatPhone`.

Tudo em [`reference/helpers.md`](reference/helpers.md).

```ts
import { formatBRL, formatDate, fromCents, isValidCPF, percentOfTotal, toCents } from "@amfernandesinc/ui"

const parcela = fromCents(Math.round(toCents(250_000) / 120)) // 2083.33
const entrada = percentOfTotal(20, 250_000) // 50000
export const resumo = `${formatBRL(entrada)} de entrada e 120 parcelas de ${formatBRL(parcela)}`
export const vencimento = formatDate("2026-03-10") // "10/03/2026"
export const cpfOk = isValidCPF("529.982.247-25") // true
```

## Textos e idioma

Todo texto embutido vem de um objeto `labels` com padrão pt-BR (`defaultDataTableLabels`, `defaultSelectLabels`…, 28 ao todo). Troque só o que precisa: `labels={{ placeholder: "Choose…" }}`. Textos que dependem de quantidade são funções. `Dialog`/`Sheet` usam `closeLabel`; `AlertDialog`, `confirmLabel`/`cancelLabel`. Não escreva texto pt-BR fixo dentro de componentes seus que devam ser traduzíveis. Veja [`reference/i18n.md`](reference/i18n.md).

## Imports, SSR e ícones

- Barrel (`import { Button } from "@amfernandesinc/ui"`) ou subpath (`"@amfernandesinc/ui/button"`, `"@amfernandesinc/ui/lib/date"`): mesmo código, os dois são tree-shakeable.
- Componentes já têm `"use client"`: em Next.js App Router podem ser importados de Server Components; handlers e estado ficam num componente seu com `"use client"`. Os helpers de `lib/*` funcionam no servidor.
- Ícones: `lucide-react`, tamanho padrão `size-4`. Props de componente pedem o **elemento** (`<IconButton icon={<Trash2 />} />`, `leadingIcon={<Search />}`, `Alert`/`EmptyState` `icon`); `Token` e os dados (`items` do `AppShell`, `DropdownMenu`, `CommandPalette`, nós da `Tree`, opções de `RadioGroup`/`SegmentedControl`) pedem o **componente** (`icon: Trash2`).
- Links de navegação (`AppShell`, `Breadcrumb`, `Pagination`, `Token`): passe `renderLink` para usar o `<Link>` do seu roteador.

## Acessibilidade que é sua

A lib cuida de foco, teclado, ARIA e contraste dos componentes. Você ainda precisa:

- Dar nome a tudo: `label` nos campos; `aria-label` quando não há rótulo visível (`Tabs`, `Popover`, `ScrollArea`, `DataTable`, `Video`); `alt` em `Image` (ou `decorative`).
- Manter a hierarquia de títulos (`headingLevel` em `Card`, `EmptyState`, `Accordion`, `Schedule`).
- Não pôr informação essencial só em `Tooltip`, só em cor ou só em ícone.
- Respeitar o teclado: nada de `div onClick`; use `Button`, `IconButton`, `onRowClick` da `DataTable`.

Checklist completo em [`reference/accessibility.md`](reference/accessibility.md).

## Sinais de alerta (pare e reconsidere)

- `shadow-*`, `rounded-[…]`, `rounded-xl` para "ficar mais bonito"
- `@theme { --color-… }` ou `:root { --primary: … }` no app
- `bg-white`, `text-gray-500`, `#1a1a1a`: cor fixa que não acompanha o tema escuro
- `<CardHeader>`, `<DialogContent>`, `<SelectItem>`, `<DropdownMenuItem>`, `size="icon"`, `useToast()`
- um `<label>` + `<input>` + erro montados à mão
- `div` ou `span` com `onClick`
- `z-[9999]`, `duration-300` num overlay
- `value * 0.07` no float do `CurrencyInput`; `new Date("2024-01-15")` para data pura
- `toLocaleString` para BRL; máscara de CPF caseira; `clsx`/`tailwind-merge` direto
- `recharts` ou outra lib de gráfico quando `BarChart`/`LineChart` resolvem

Catálogo com correções em [`reference/anti-patterns.md`](reference/anti-patterns.md).

## Fluxo para construir uma tela

1. Setup conferido (CSS, `@source` na 0.5.x, `<Toaster />`).
2. Escolha os componentes pelo mapa; leia as props em `reference/api/`.
3. Monte o layout com Tailwind; componha com os componentes da lib, sem reestilizar.
4. Campos pelo contrato de campo; dinheiro e datas pelos helpers.
5. Estados da tela: carregando (`loading`/`Skeleton`), vazio (`EmptyState`), erro (`Alert` ou `error` + `onRetry` na `DataTable`).
6. Confira claro e escuro, 360px de largura, teclado (Tab, Enter, Esc) e nomes acessíveis.

Receitas completas (cadastro, listagem com filtros, detalhe em Sheet, dashboard, assistente, upload) em [`reference/recipes.md`](reference/recipes.md).

## Arquivos de referência

| Arquivo | Quando abrir |
|---|---|
| [`reference/api/README.md`](reference/api/README.md) | Índice de **todo** export → arquivo. A pasta `api/` é gerada do código: props, tipos, padrões, `labels` padrão. Fonte da verdade para nomes e formatos. |
| [`reference/setup-and-theming.md`](reference/setup-and-theming.md) | Instalação, CSS, `@source`, fontes, tema escuro, tokens de cor, raio, altura, utilitários (`focus-outline`, `state-layer`), Next.js e Vite |
| [`reference/forms.md`](reference/forms.md) | Cada campo, valores, react-hook-form, `FormData`, reset, validação, `readOnly`, layouts de formulário |
| [`reference/data-display.md`](reference/data-display.md) | `DataTable` a fundo (servidor, seleção, export), colunas, `Card`, `EmptyState`, `Tree`, `Schedule`, `Image`, `Video` |
| [`reference/charts.md`](reference/charts.md) | `BarChart`, `LineChart`, `Sparkline` e as regras de visualização |
| [`reference/overlays.md`](reference/overlays.md) | `Dialog`, `Sheet`, `AlertDialog`, `Popover`, `DropdownMenu`, `Tooltip`, toasts, `Tour` |
| [`reference/navigation.md`](reference/navigation.md) | `AppShell`, roteadores (`renderLink`), `Breadcrumb`, `Tabs`, `Accordion`, `Pagination`, `Stepper`, `CommandPalette` |
| [`reference/helpers.md`](reference/helpers.md) | Dinheiro, números, datas e fusos, validadores e máscaras, bytes, busca sem acento, URLs seguras, hooks |
| [`reference/i18n.md`](reference/i18n.md) | `labels`, plural, inglês, locale da agenda |
| [`reference/accessibility.md`](reference/accessibility.md) | O que é seu na acessibilidade e como testar |
| [`reference/recipes.md`](reference/recipes.md) | Telas completas para copiar |
| [`reference/anti-patterns.md`](reference/anti-patterns.md) | Erros comuns, com o porquê e a correção; migração de versões antigas |
