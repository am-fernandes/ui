import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, waitFor, within } from "@storybook/test"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Textarea } from "../primitives/textarea"
import { Sheet } from "./sheet"

const meta: Meta<typeof Sheet> = {
  title: "Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Painel deslizante ancorado a uma borda da viewport. Ideal para edição secundária, filtros, ou navegação mobile.",
          "",
          "**Props principais:**",
          "- `trigger?: ReactNode` — elemento que abre o sheet.",
          "- `title: ReactNode` — obrigatório (a11y).",
          "- `description?: ReactNode` — texto secundário.",
          "- `children?: ReactNode` — body.",
          "- `footer?: ReactNode` — rodapé (`mt-auto`, justify-end).",
          "- `side?: 'top' | 'right' | 'bottom' | 'left'` — borda de origem. Default `'right'`.",
          "- `closeLabel?: string` — `aria-label` do X. Default `'Close'`.",
          "- `hideCloseButton?: boolean` — esconde o X.",
          "- `open` / `onOpenChange` — controlled mode.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Sheet, Button } from "@amfernandesinc/ui"',
          "",
          "<Sheet",
          "  trigger={<Button>Abrir filtros</Button>}",
          '  title="Filtros"',
          '  side="right"',
          ">",
          "  {/* form fields */}",
          "</Sheet>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    closeLabel: { control: "text" },
    hideCloseButton: { control: "boolean" },
    open: { control: "boolean" },
  },
}
export default meta
type Story = StoryObj<typeof Sheet>

export const Right: Story = {
  args: {
    trigger: <Button>Abrir (right)</Button>,
    title: "Detalhes do item",
    description: "Painel padrão deslizando da direita.",
    side: "right",
    children: <p className="text-sm">Conteúdo do painel lateral.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Abrir (right)" })
    await userEvent.click(trigger)
    const body = within(document.body)
    await waitFor(() => expect(body.getByRole("dialog")).toBeInTheDocument())
    await expect(body.getByText("Detalhes do item")).toBeInTheDocument()
    await userEvent.keyboard("{Escape}")
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument())
  },
}

export const Left: Story = {
  args: {
    trigger: <Button>Abrir (left)</Button>,
    title: "Menu lateral",
    description: "Navegação principal.",
    side: "left",
    children: (
      <nav className="flex flex-col gap-2 text-sm">
        <a href="/" className="rounded-md px-2 py-1 hover:bg-muted">
          Home
        </a>
        <a href="/" className="rounded-md px-2 py-1 hover:bg-muted">
          Projetos
        </a>
        <a href="/" className="rounded-md px-2 py-1 hover:bg-muted">
          Configurações
        </a>
      </nav>
    ),
  },
}

export const Top: Story = {
  args: {
    trigger: <Button>Abrir (top)</Button>,
    title: "Notificações",
    description: "Painel deslizando do topo.",
    side: "top",
    children: (
      <ul className="flex flex-col gap-2 text-sm">
        <li>Nova mensagem de @joao</li>
        <li>Deploy concluído</li>
      </ul>
    ),
  },
}

export const Bottom: Story = {
  args: {
    trigger: <Button>Abrir (bottom)</Button>,
    title: "Quick actions",
    description: "Estilo bottom sheet mobile.",
    side: "bottom",
    children: (
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline">Compartilhar</Button>
        <Button variant="outline">Duplicar</Button>
        <Button variant="outline">Arquivar</Button>
      </div>
    ),
  },
}

export const WithFooter: Story = {
  args: {
    trigger: <Button>Abrir com footer</Button>,
    title: "Editar projeto",
    description: "Clique em Salvar para confirmar.",
    children: (
      <div className="flex flex-col gap-3">
        <Input label="Nome do projeto" placeholder="Meu app" />
        <Textarea label="Descrição" autoResize />
      </div>
    ),
    footer: (
      <>
        <Button variant="outline">Cancelar</Button>
        <Button>Salvar</Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "O rodapé fica no fim do painel, qualquer que seja a altura do conteúdo.",
      },
    },
  },
}

const leadFields = [
  "Nome completo",
  "CPF",
  "E-mail",
  "Telefone",
  "Origem",
  "Corretor",
  "Empreendimento",
  "Unidade",
  "Renda mensal",
  "Entrada",
  "Banco",
  "CEP",
  "Logradouro",
  "Número",
  "Complemento",
  "Bairro",
  "Cidade",
  "UF",
  "Observações",
]

export const LongForm: Story = {
  args: {
    trigger: <Button>Formulário longo</Button>,
    title: "Novo lead",
    description: "Dados de contato e de interesse.",
    children: (
      <form id="lead" className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
        {leadFields.map((label) => (
          <Input key={label} label={label} />
        ))}
      </form>
    ),
    footer: (
      <>
        <Button variant="outline">Cancelar</Button>
        <Button type="submit" form="lead">
          Salvar
        </Button>
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Conteúdo mais alto que a tela: título e descrição ficam no topo, o rodapé fica embaixo e só o corpo rola.",
      },
    },
  },
}

export const BottomLong: Story = {
  args: {
    trigger: <Button>Abrir (bottom, longo)</Button>,
    title: "Histórico do lead",
    description: "Do mais recente para o mais antigo.",
    side: "bottom",
    children: (
      <ul className="flex flex-col gap-2 text-sm">
        {Array.from({ length: 40 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static story content
          <li key={i}>Contato {40 - i}: ligação registrada pelo corretor.</li>
        ))}
      </ul>
    ),
    footer: <Button variant="outline">Fechar</Button>,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Painéis de cima e de baixo crescem com o conteúdo até a altura da tela (menos 2rem); daí em diante o corpo rola.",
      },
    },
  },
}

export const WithForm: Story = {
  render: () => (
    <Sheet
      trigger={<Button>Cadastrar contato</Button>}
      title="Novo contato"
      description="Preencha os dados para criar um contato."
      footer={
        <>
          <Button variant="outline">Cancelar</Button>
          <Button type="submit" form="contact-form">
            Salvar
          </Button>
        </>
      }
    >
      <form
        id="contact-form"
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          console.log("submitted")
        }}
      >
        <Input label="Nome" required placeholder="João da Silva" />
        <Input label="E-mail" type="email" required placeholder="joao@exemplo.com" />
        <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" />
        <Textarea label="Observações" autoResize />
      </form>
    </Sheet>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pattern: associe o `form` ID ao botão `submit` no `footer` para preservar comportamento nativo de submit.",
      },
    },
  },
}

export const HideClose: Story = {
  args: {
    trigger: <Button>Abrir sem X</Button>,
    title: "Sem botão X",
    description: "Escape e click fora seguem funcionando.",
    hideCloseButton: true,
    children: <p className="text-sm">Pressione Escape para fechar.</p>,
  },
}
