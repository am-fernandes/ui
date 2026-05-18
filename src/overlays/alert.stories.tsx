import type { Meta, StoryObj } from "@storybook/react-vite"
import { RocketIcon } from "lucide-react"

import { Button } from "../primitives/button"
import { Alert } from "./alert"

const meta: Meta<typeof Alert> = {
  title: "Overlays/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Bloco de aviso inline com 5 variantes semânticas (`default | info | success | warning | destructive`).",
          "",
          "**Props principais:**",
          "- `variant` — controla cor + ícone padrão.",
          "- `title?: ReactNode` — título em destaque.",
          "- `description?: ReactNode` — texto secundário (`text-sm opacity-90`).",
          "- `icon?: ReactNode` — sobrescreve o ícone padrão da variante.",
          "- `action?: ReactNode` — slot à direita (CTA tipo `Button`).",
          "- `children?: ReactNode` — body alternativo/extra (renderiza abaixo de `description`).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Alert } from "@am-fernandes/ui"',
          "",
          '<Alert variant="success" title="Salvo!" description="Suas alterações foram aplicadas." />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "info", "success", "warning", "destructive"],
      description: "Variante semântica (cor + ícone padrão).",
      table: {
        type: { summary: "'default' | 'info' | 'success' | 'warning' | 'destructive'" },
        defaultValue: { summary: "'default'" },
      },
    },
    title: { control: "text", description: "Título em destaque." },
    description: { control: "text", description: "Texto secundário." },
    icon: { control: false, description: "Sobrescreve o ícone padrão." },
    action: { control: false, description: "Slot à direita (CTA)." },
    children: {
      control: false,
      description: "Body alternativo, renderiza abaixo de `description`.",
    },
    className: { control: "text" },
  },
  decorators: [
    (Story) => (
      <div className="w-[28rem]">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Alert>

export const Default: Story = {
  args: {
    variant: "default",
    title: "Aviso",
    description: "Este é um aviso neutro, sem semântica especial.",
  },
}

export const Info: Story = {
  args: {
    variant: "info",
    title: "Atualização disponível",
    description: "Uma nova versão está pronta para ser instalada.",
  },
}

export const Success: Story = {
  args: {
    variant: "success",
    title: "Salvo com sucesso",
    description: "Suas alterações foram aplicadas.",
  },
}

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Espaço quase no limite",
    description: "Você usou 92% do plano. Considere fazer upgrade.",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "Erro ao salvar",
    description: "Tente novamente em alguns segundos.",
  },
}

export const WithAction: Story = {
  args: {
    variant: "info",
    title: "Verifique seu e-mail",
    description: "Enviamos um link de confirmação.",
    action: (
      <Button size="default" variant="outline">
        Reenviar
      </Button>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Use o slot `action` para CTAs alinhados à direita (`ml-auto`).",
      },
    },
  },
}

export const WithIcon: Story = {
  args: {
    variant: "info",
    title: "Decolando",
    description: "Ícone customizado via prop `icon`.",
    icon: <RocketIcon aria-hidden="true" />,
  },
  parameters: {
    docs: {
      description: {
        story: "A prop `icon` sobrescreve o ícone padrão da variante.",
      },
    },
  },
}

export const RichBody: Story = {
  args: {
    variant: "warning",
    title: "Migração pendente",
    description: "Alguns campos legados ainda existem no seu workspace.",
    children: (
      <ul className="mt-2 list-inside list-disc">
        <li>3 documentos sem categoria</li>
        <li>12 contatos sem telefone</li>
      </ul>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "`children` renderiza abaixo de `description`. Útil para listas, links, ou markdown rico.",
      },
    },
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Alert variant="default" title="default" description="Aviso neutro." />
      <Alert variant="info" title="info" description="Informação." />
      <Alert variant="success" title="success" description="Operação concluída." />
      <Alert variant="warning" title="warning" description="Atenção." />
      <Alert variant="destructive" title="destructive" description="Algo deu errado." />
    </div>
  ),
  parameters: {
    docs: { description: { story: "Todas as 5 variantes empilhadas." } },
  },
}
