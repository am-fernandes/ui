# Overlays e feedback

Todos os overlays são um componente só, com o conteúdo em props: `trigger` (o elemento que abre), `title`, `description`, `children`, `footer`. Foco preso dentro dos modais, Esc fecha, o foco volta ao gatilho ao fechar, rolagem da página travada, empilhamento por tokens de z-index: tudo já vem pronto.

Controle de abertura: sem `open`, o overlay cuida de si (abre pelo `trigger`). Com `open` + `onOpenChange`, quem manda é você (abrir por código, fechar depois de salvar). `ref` aponta para o painel; `contentProps` passa `id`, `data-*` e `aria-*` extras para ele.

## Qual usar

| Situação | Use |
|---|---|
| Formulário curto ou detalhe que interrompe a tarefa | `Dialog` (`size` `sm`, `md`, `lg`, `xl`) |
| Painel lateral: filtros, detalhe de um item da lista, edição longa mantendo a lista ao lado | `Sheet` (`side`, `size`) |
| Confirmar algo destrutivo ou irreversível | `AlertDialog` |
| Conteúdo interativo pequeno ancorado (filtros rápidos, escolha de colunas) | `Popover` |
| Lista de ações de um item | `DropdownMenu` |
| Explicar um controle (nome do ícone, atalho) | `Tooltip` |
| Avisar o resultado de uma ação | `toast` |
| Mensagem que fica na página (aviso, erro de carga, informação) | `Alert` |
| Mostrar o produto a um usuário novo | `Tour` |
| Esconder parte do conteúdo, aberta pelo usuário | `Collapsible` / `Accordion` |
| Progresso de uma tarefa | `Progress` |

## Dialog

`title` é obrigatório (nome acessível). O `footer` fica sempre visível no fim; aceita uma função que recebe `close`. Formulário dentro: o `<form id>` no corpo e o botão de envio no `footer` com `form="id"`.

```tsx
import * as React from "react"
import { Button, CurrencyInput, Dialog, Input, toast } from "@amfernandesinc/ui"

export function NovaPropostaDialog({ salvar }: { salvar: (dados: { cliente: string; valor: number }) => Promise<void> }) {
  const [open, setOpen] = React.useState(false)
  const [cliente, setCliente] = React.useState("")
  const [valor, setValor] = React.useState(0)
  const [enviando, setEnviando] = React.useState(false)

  const enviar = async (event: React.FormEvent) => {
    event.preventDefault()
    setEnviando(true)
    try {
      await salvar({ cliente, valor })
      toast.success("Proposta criada.")
      setOpen(false)
    } catch {
      toast.error("Não foi possível criar a proposta. Tente de novo.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button>Nova proposta</Button>}
      title="Nova proposta"
      description="Os valores podem ser ajustados depois."
      footer={({ close }) => (
        <>
          <Button variant="outline" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form="nova-proposta" loading={enviando}>
            Criar proposta
          </Button>
        </>
      )}
    >
      <form id="nova-proposta" onSubmit={enviar} className="grid gap-4">
        <Input label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} required />
        <CurrencyInput label="Valor" value={valor} onValueChange={setValor} />
      </form>
    </Dialog>
  )
}
```

- `dismissible={false}`: Esc e clique fora não fecham (fluxo obrigatório); o X some.
- `onOpenAutoFocus` para escolher o foco inicial (`event.preventDefault()` e foque o que quiser); por padrão, o primeiro elemento focável do painel.
- Sem `trigger`, controlado por `open`: o foco volta para onde estava quando abriu.
- Evite abrir um Dialog de dentro de outro: troque o conteúdo do mesmo Dialog ou use um `Sheet`. Popover, menu, calendário e lista abertos de dentro do Dialog funcionam normalmente.

## Sheet

Mesma API do `Dialog`, mais `side` (`"right"` padrão, `"left"`, `"top"`, `"bottom"`) e `size` (`sm`, `md`, `lg`). Bom para detalhe de um item com a lista ainda visível ao fundo.

```tsx
import { Button, Sheet } from "@amfernandesinc/ui"

export function FiltrosSheet({ children, aplicar, limpar }: {
  children: React.ReactNode
  aplicar: () => void
  limpar: () => void
}) {
  return (
    <Sheet
      trigger={<Button variant="outline">Filtros</Button>}
      title="Filtros"
      side="right"
      size="sm"
      footer={({ close }) => (
        <>
          <Button variant="ghost" onClick={limpar}>
            Limpar
          </Button>
          <Button
            onClick={() => {
              aplicar()
              close()
            }}
          >
            Aplicar
          </Button>
        </>
      )}
    >
      <div className="grid gap-4">{children}</div>
    </Sheet>
  )
}
```

## AlertDialog

Confirmação. `onConfirm` obrigatório; se ele devolve uma Promise, o diálogo espera: spinner no botão, botões e Esc ignorados, fecha quando resolve e continua aberto quando rejeita (mostre o erro em `children` ou num toast). `confirmVariant="destructive"` para excluir. Textos dos botões em `confirmLabel`/`cancelLabel` (padrão "Confirmar"/"Cancelar"); use o verbo da ação.

```tsx
import { Trash2 } from "lucide-react"
import { AlertDialog, IconButton, toast } from "@amfernandesinc/ui"

export function ExcluirLead({ nome, excluir }: { nome: string; excluir: () => Promise<void> }) {
  return (
    <AlertDialog
      trigger={<IconButton icon={<Trash2 />} label={`Excluir ${nome}`} variant="destructive" />}
      title={`Excluir ${nome}?`}
      description="O lead e o histórico de contatos serão apagados. Não dá para desfazer."
      confirmLabel="Excluir lead"
      confirmVariant="destructive"
      onConfirm={async () => {
        await excluir()
        toast.success("Lead excluído.")
      }}
    />
  )
}
```

## Popover

`trigger` (abre e fecha) ou `anchor` (só aponta; você abre com `open`). Nomeie com `aria-label` ou `aria-labelledby` (é um `role="dialog"`). `side`, `align`, `sideOffset`, `collisionPadding`, `modal`.

```tsx
import { Columns3 } from "lucide-react"
import { Button, Checkbox, Popover } from "@amfernandesinc/ui"

export function ColunasVisiveis({
  colunas,
  visiveis,
  alternar,
}: {
  colunas: { id: string; nome: string }[]
  visiveis: string[]
  alternar: (id: string, visivel: boolean) => void
}) {
  return (
    <Popover
      aria-label="Colunas visíveis"
      align="end"
      trigger={
        <Button variant="outline" size="sm">
          <Columns3 aria-hidden="true" />
          Colunas
        </Button>
      }
    >
      <div className="grid gap-2">
        {colunas.map((c) => (
          <Checkbox
            key={c.id}
            label={c.nome}
            checked={visiveis.includes(c.id)}
            onCheckedChange={(v) => alternar(c.id, v === true)}
          />
        ))}
      </div>
    </Popover>
  )
}
```

## DropdownMenu

`trigger` (um `Button` ou `IconButton`) e `items`. Tipos de item: ação (`{ label, onSelect, icon, shortcut, variant: "destructive", href, disabled, keepOpen }`), `{ type: "separator" }`, `{ type: "group", label, items }`, `{ type: "checkbox", label, checked, onCheckedChange }`, `{ type: "radio", label, value, onValueChange, options }`, `{ type: "submenu", label, items }`. `icon` dos itens é o componente. `side`/`align` (padrão abaixo, alinhado ao início), `modal` (use `false` em menus de linha de tabela).

```tsx
import { Copy, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import * as React from "react"
import { DropdownMenu, IconButton } from "@amfernandesinc/ui"

export function AcoesDoContrato({ editar, duplicar, excluir, pdfUrl }: {
  editar: () => void
  duplicar: () => void
  excluir: () => void
  pdfUrl: string
}) {
  const [densidade, setDensidade] = React.useState("confortavel")
  const [mostrarCancelados, setMostrarCancelados] = React.useState(false)
  return (
    <DropdownMenu
      trigger={<IconButton icon={<MoreHorizontal />} label="Ações do contrato" />}
      align="end"
      items={[
        { label: "Editar", icon: Pencil, shortcut: "E", onSelect: editar },
        { label: "Duplicar", icon: Copy, onSelect: duplicar },
        { label: "Baixar PDF", icon: Download, href: pdfUrl, target: "_blank" },
        { type: "separator" },
        {
          type: "group",
          label: "Exibição",
          items: [
            { type: "checkbox", label: "Mostrar cancelados", checked: mostrarCancelados, onCheckedChange: setMostrarCancelados },
            {
              type: "radio",
              label: "Densidade",
              value: densidade,
              onValueChange: setDensidade,
              options: [
                { value: "confortavel", label: "Confortável" },
                { value: "compacta", label: "Compacta" },
              ],
            },
          ],
        },
        { type: "separator" },
        { label: "Excluir", icon: Trash2, variant: "destructive", onSelect: excluir },
      ]}
    />
  )
}
```

Uma ação destrutiva no menu abre um `AlertDialog` controlado (`open` no estado), não executa direto.

## Tooltip

`content` + um filho que recebe ref (um `Button`, `IconButton`, link). Para o leitor de tela, o tooltip descreve o controle; ele **não** substitui o nome. Nunca ponha informação essencial só no tooltip (não existe no toque). Um botão `disabled` dentro de um `Tooltip` funciona: a lib o envolve num `span` focável para explicar por que está indisponível. `IconButton` já traz tooltip com o `label` (desligue com `tooltip={false}`).

```tsx
import { Button, Tooltip } from "@amfernandesinc/ui"

export function EnviarParaAprovacao({ podeEnviar }: { podeEnviar: boolean }) {
  return (
    <Tooltip content={podeEnviar ? "Envia para o gerente aprovar." : "Preencha o valor da entrada para enviar."}>
      <Button disabled={!podeEnviar}>Enviar para aprovação</Button>
    </Tooltip>
  )
}
```

## Toasts

`<Toaster />` montado uma vez na raiz. `toast` é o do Sonner, com uma diferença: erros (`toast.error` e o erro de `toast.promise`) ficam até serem fechados.

```tsx
import { toast } from "@amfernandesinc/ui"

export async function salvarComAviso(salvar: () => Promise<void>, desfazer: () => void) {
  toast.promise(salvar(), {
    loading: "Salvando…",
    success: "Alterações salvas.",
    error: "Não foi possível salvar. Verifique a conexão e tente de novo.",
  })
  toast.info("Contrato arquivado.", { action: { label: "Desfazer", onClick: desfazer } })
  toast.warning("O CPF já está em outro lead.")
}
```

- Mensagem curta, no passado, dizendo o que aconteceu ("Lead salvo."). Erro diz o que fazer.
- Não use toast para erro de campo (`error` no campo) nem para algo que precisa ficar na tela (`Alert`).
- Textos do próprio Toaster (fechar, região) em `labels`.

## Alert

`variant` (`default`, `info`, `success`, `warning`, `destructive`), `title`, `description`, `icon` (elemento; cada variante tem o seu), `action` (um botão).

```tsx
import { Alert, Button } from "@amfernandesinc/ui"

export function ErroAoCarregar({ tentarDeNovo }: { tentarDeNovo: () => void }) {
  return (
    <Alert
      variant="destructive"
      title="Não foi possível carregar as unidades"
      description="O servidor não respondeu. Seus filtros foram mantidos."
      action={
        <Button size="sm" variant="outline" onClick={tentarDeNovo}>
          Tentar de novo
        </Button>
      }
    />
  )
}
```

## Collapsible

Uma seção que abre e fecha: `title` (gatilho padrão) ou `trigger` (o seu), `children`, `defaultOpen`/`open`, `keepMounted` (mantém campos não controlados de uma seção fechada), `triggerSide`, `triggerLabel`.

```tsx
import { Collapsible, Input } from "@amfernandesinc/ui"

export function DadosDoConjuge() {
  return (
    <Collapsible title="Dados do cônjuge" keepMounted>
      <div className="grid gap-4 pt-3 sm:grid-cols-2">
        <Input label="Nome do cônjuge" name="conjugeNome" />
        <Input label="E-mail do cônjuge" name="conjugeEmail" type="email" />
      </div>
    </Collapsible>
  )
}
```

## Progress

`value` 0–100 (`max` muda a escala); `null` = indeterminado. Dê nome com `aria-label` (ou um rótulo visível ligado por `aria-labelledby`).

```tsx
import { Progress } from "@amfernandesinc/ui"

export function EnvioDeArquivos({ porcentagem }: { porcentagem: number | null }) {
  return (
    <div className="space-y-1">
      <p id="envio-rotulo" className="text-sm">
        Enviando documentos
      </p>
      <Progress aria-labelledby="envio-rotulo" value={porcentagem} />
    </div>
  )
}
```

## Tour

Tour de onboarding não modal: um passo por elemento, "Voltar/Próximo/Concluir", destaque opcional (`spotlight`) e progresso "2 de 5". `steps` (`target`: ref, seletor CSS ou função; `title`; `content`; `side`; `align`), `open`, `onClose(reason)` (guarde que o usuário já viu), `step`/`onStepChange` para controlar. Curto, e nada que o usuário precise saber só ali.

```tsx
import * as React from "react"
import { Tour } from "@amfernandesinc/ui"

export function TourDoPainel() {
  const [open, setOpen] = React.useState(() => localStorage.getItem("tour-painel") !== "visto")
  return (
    <Tour
      open={open}
      onClose={() => {
        localStorage.setItem("tour-painel", "visto")
        setOpen(false)
      }}
      steps={[
        { target: "#filtro-periodo", title: "Período", content: "Escolha o mês dos números do painel." },
        { target: "#botao-novo-lead", title: "Novo lead", content: "Cadastre um lead que chegou pelo plantão.", side: "left" },
      ]}
    />
  )
}
```
