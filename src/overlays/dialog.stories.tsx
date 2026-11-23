import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "../primitives/button"
import { IconButton } from "../primitives/icon-button"
import { Input } from "../primitives/input"
import { Dialog } from "./dialog"
import { DropdownMenu } from "./dropdown-menu"

const meta: Meta<typeof Dialog> = {
  title: "Overlays/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Modal centralizado para edição, formulários ou confirmações genéricas. Diferente do `AlertDialog`, o `Dialog` é dismissível por padrão (Escape, clique fora, botão X).",
          "",
          "**Props principais:**",
          "- `trigger?: ReactNode` — elemento que abre o modal.",
          "- `title: ReactNode` — obrigatório (a11y).",
          "- `description?: ReactNode` — texto secundário.",
          "- `children?: ReactNode` — body.",
          "- `footer?: ReactNode` — slot do rodapé (justify-end, gap-2).",
          "- `size?: 'sm' | 'md' | 'lg' | 'xl'` — largura máxima. Default `'md'`.",
          "- `dismissible?: boolean` — quando `false`, Escape/click fora não fecham e o X some. Default `true`.",
          "- `hideCloseButton?: boolean` — esconde o X mas mantém Escape/click fora.",
          "- `closeLabel?: string` — `aria-label` do X. Default `'Fechar'`.",
          "- `open` / `onOpenChange` — controlled mode.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Dialog, Button, Input } from "@amfernandesinc/ui"',
          "",
          "<Dialog",
          "  trigger={<Button>Editar perfil</Button>}",
          '  title="Editar perfil"',
          '  description="Atualize seu nome e e-mail."',
          "  footer={({ close }) => (",
          '    <><Button variant="outline" onClick={close}>Cancelar</Button><Button>Salvar</Button></>',
          "  )}",
          ">",
          '  <Input label="Nome" />',
          "</Dialog>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    dismissible: { control: "boolean" },
    hideCloseButton: { control: "boolean" },
    closeLabel: { control: "text" },
    open: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  args: {
    trigger: <Button>Abrir dialog</Button>,
    title: "Editar perfil",
    description: "Atualize suas informações pessoais.",
    children: (
      <div className="flex flex-col gap-3 py-2">
        <Input label="Nome" placeholder="João da Silva" />
        <Input label="E-mail" type="email" placeholder="joao@exemplo.com" />
      </div>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Abrir dialog" })
    await userEvent.click(trigger)
    // Dialog renders in a portal, query the whole document
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole("dialog")).toBeInTheDocument())
    await expect(body.getByText("Editar perfil")).toBeInTheDocument()
    // Escape closes
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument())
  },
}

export const WithFooter: Story = {
  args: {
    trigger: <Button>Editar com footer</Button>,
    title: "Editar perfil",
    description: "Clique em Salvar para confirmar.",
    children: (
      <div className="flex flex-col gap-3 py-2">
        <Input label="Nome" placeholder="João da Silva" />
      </div>
    ),
    footer: ({ close }) => (
      <>
        <Button variant="outline" onClick={close}>
          Cancelar
        </Button>
        <Button>Salvar</Button>
      </>
    ),
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-2">
      <Dialog
        trigger={<Button variant="outline">sm</Button>}
        title="Small"
        description="max-w-sm"
        size="sm"
      >
        <p className="text-sm">Modal pequeno.</p>
      </Dialog>
      <Dialog
        trigger={<Button variant="outline">md</Button>}
        title="Medium (default)"
        description="max-w-lg"
        size="md"
      >
        <p className="text-sm">Modal médio.</p>
      </Dialog>
      <Dialog
        trigger={<Button variant="outline">lg</Button>}
        title="Large"
        description="max-w-2xl"
        size="lg"
      >
        <p className="text-sm">Modal grande.</p>
      </Dialog>
      <Dialog
        trigger={<Button variant="outline">xl</Button>}
        title="Extra Large"
        description="max-w-4xl"
        size="xl"
      >
        <p className="text-sm">Modal extra grande.</p>
      </Dialog>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tamanhos: `sm` (`max-w-sm`), `md` (`max-w-lg`), `lg` (`max-w-2xl`), `xl` (`max-w-4xl`).",
      },
    },
  },
}

export const LongTitle: Story = {
  args: {
    trigger: <Button>Transferir proposta</Button>,
    size: "sm",
    title: "Transferir a proposta #1042 do Residencial Jardim das Acácias para outro corretor?",
    description: "O novo corretor recebe o histórico e os anexos.",
    children: <Input label="Corretor" placeholder="Nome ou CRECI" />,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Título que quebra em duas linhas: as linhas têm a entrelinha do texto (acentos não encostam) e o X fica alinhado à primeira.",
      },
    },
  },
}

export const HideClose: Story = {
  args: {
    trigger: <Button>Abrir sem X</Button>,
    title: "Sem botão X",
    description: "Escape e clique fora ainda fecham — só o botão visual está oculto.",
    hideCloseButton: true,
    children: <p className="text-sm">Pressione Escape para fechar.</p>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `hideCloseButton`, apenas o ícone X é removido — Escape e click fora seguem funcionando.",
      },
    },
  },
}

export const NonDismissible: Story = {
  args: {
    trigger: <Button>Abrir não-dismissível</Button>,
    title: "Confirmação obrigatória",
    description: "Escape e clique fora foram bloqueados. Use os botões do footer para concluir.",
    dismissible: false,
    children: (
      <p className="text-sm">
        Modal forçado — útil para fluxos que exigem decisão explícita (aceite de termos, primeiro
        setup, sessão expirada). O X também some automaticamente.
      </p>
    ),
    footer: <Button>Entendi</Button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "`dismissible={false}` bloqueia Escape, clique no overlay e remove o botão X. O modal só fecha via lógica explícita (botão no footer + `open`/`onOpenChange`).",
      },
    },
  },
}

export const CustomCloseLabel: Story = {
  args: {
    trigger: <Button>Nome do X</Button>,
    title: "Nome do botão de fechar",
    description: "O `aria-label` do X (por padrão “Fechar”) foi trocado para “Fechar sem salvar”.",
    closeLabel: "Fechar sem salvar",
    children: <p className="text-sm">Inspecione o botão de fechar.</p>,
  },
}

export const ControlledOpen: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col gap-3">
        <Button onClick={() => setOpen(true)}>Abrir programaticamente</Button>
        <p className="text-sm text-muted-foreground">open = {String(open)}</p>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Dialog controlado"
          description="Estado gerenciado externamente."
          footer={<Button onClick={() => setOpen(false)}>Fechar</Button>}
        >
          <p className="text-sm">Você pode integrar com router, store global, etc.</p>
        </Dialog>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modo controlled via `open` + `onOpenChange`. Sem `trigger`, ao fechar o foco volta para o elemento que o tinha quando o diálogo abriu (aqui, o botão).",
      },
    },
  },
}

export const OpenedFromMenu: Story = {
  render: () => {
    const [editing, setEditing] = useState(false)
    return (
      <div className="flex w-96 max-w-full items-center justify-between gap-3 rounded-md border px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Proposta #1042</p>
          <p className="truncate text-xs text-muted-foreground">Ana Souza · R$ 412.000,00</p>
        </div>
        <DropdownMenu
          trigger={<IconButton icon={<MoreHorizontal />} label="Ações da proposta" size="sm" />}
          align="end"
          items={[
            { label: "Editar", icon: Pencil, onSelect: () => setEditing(true) },
            { label: "Excluir", icon: Trash2, variant: "destructive" },
          ]}
        />
        <Dialog
          open={editing}
          onOpenChange={setEditing}
          title="Editar proposta #1042"
          description="Altere os dados e salve."
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setEditing(false)}>Salvar</Button>
            </>
          }
        >
          <Input label="Cliente" defaultValue="Ana Souza" />
        </Dialog>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "O “…” de uma linha de tabela: o item do menu abre o diálogo por estado (`open`). O item some com o menu, então, ao fechar, o foco volta para o gatilho do menu.",
      },
    },
  },
}

export const LongContent: Story = {
  args: {
    trigger: <Button>Conteúdo longo</Button>,
    title: "Termos de uso",
    description: "Role para baixo para ver mais.",
    size: "lg",
    children: (
      <div className="text-sm leading-relaxed">
        {Array.from({ length: 12 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static story content
          <p key={i} className="mb-3 last:mb-0">
            <strong>Cláusula {i + 1}.</strong> Lorem ipsum dolor sit amet, consectetur adipiscing
            elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
            minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat.
          </p>
        ))}
      </div>
    ),
    footer: ({ close }) => (
      <>
        <Button variant="outline" onClick={close}>
          Cancelar
        </Button>
        <Button>Aceitar</Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "O diálogo nunca passa da altura da tela: título e descrição ficam no topo, o rodapé fica embaixo e só o corpo rola. Não é preciso `max-h-*` nem `overflow-y-auto` no `children`.",
      },
    },
  },
}

const proposalFields = [
  "Nome completo",
  "CPF",
  "RG",
  "Data de nascimento",
  "Estado civil",
  "Profissão",
  "Renda mensal",
  "E-mail",
  "Telefone",
  "CEP",
  "Logradouro",
  "Número",
  "Complemento",
  "Bairro",
  "Cidade",
  "UF",
  "Empreendimento",
  "Unidade",
  "Valor da proposta",
  "Entrada",
  "Parcelas",
  "Banco",
  "Corretor",
  "Observações",
]

export const LongForm: Story = {
  args: {
    trigger: <Button>Formulário longo</Button>,
    title: "Nova proposta",
    description: "Preencha os dados do comprador e da unidade.",
    children: (
      <form id="proposta" className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        {proposalFields.map((label) => (
          <Input key={label} label={label} />
        ))}
        <Button type="button" variant="outline" className="self-start">
          Adicionar comprador
        </Button>
      </form>
    ),
    footer: ({ close }) => (
      <>
        <Button variant="outline" onClick={close}>
          Cancelar
        </Button>
        <Button type="submit" form="proposta">
          Salvar
        </Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Formulário com 24 campos: num notebook ou num celular o corpo rola e “Salvar” continua à vista. O `form` fica no corpo e o botão do rodapé o envia por `form="id"`.',
      },
    },
  },
}
