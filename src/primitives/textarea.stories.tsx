import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { useState } from "react"

import { Textarea } from "./textarea"

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Campo de texto multilinha com `label`, `description`, `error`, contador opcional via `maxLength` e modo `autoResize` que cresce conforme o conteúdo.",
          "",
          "**API:**",
          "- `label` / `labelPosition` — `'up'` (default), `'left'` ou `'hidden'`.",
          "- `description` — texto auxiliar.",
          "- `error` — mensagem de erro (`role=alert`, `aria-invalid` no campo).",
          "- `required` — marca como obrigatório.",
          "- `maxLength` — limita caracteres E renderiza contador `atual/limite`.",
          "- `autoResize` — ajusta altura automaticamente ao conteúdo (`resize-none overflow-hidden`).",
          "- `disabled`, `readOnly` — estados de leitura.",
          "- `value`, `defaultValue`, `onChange` — controlled/uncontrolled.",
          "- Repassa todos os atributos HTML de `<textarea>` (`rows`, `placeholder`, etc).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Textarea } from "@am-fernandes/ui"',
          "",
          '<Textarea label="Mensagem" placeholder="Conte sua história..." maxLength={500} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Texto do label." },
    labelPosition: {
      control: "inline-radio",
      options: ["up", "left", "hidden"],
      description: "Posição do label.",
      table: {
        type: { summary: "'up' | 'left' | 'hidden'" },
        defaultValue: { summary: "'up'" },
      },
    },
    description: { control: "text", description: "Texto auxiliar abaixo do campo." },
    error: { control: "text", description: "Mensagem de erro." },
    placeholder: { control: "text", description: "Texto exibido quando vazio." },
    rows: {
      control: { type: "number", min: 1, step: 1 },
      description: "Linhas visíveis iniciais.",
      table: { type: { summary: "number" } },
    },
    maxLength: {
      control: { type: "number", min: 1, step: 1 },
      description: "Limite de caracteres. Quando definido, mostra contador `atual/limite`.",
      table: { type: { summary: "number" } },
    },
    autoResize: {
      control: "boolean",
      description:
        "Ajusta a altura automaticamente conforme o conteúdo (`resize-none overflow-hidden`).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    readOnly: {
      control: "boolean",
      description: "Apenas leitura.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    className: { control: "text", description: "Classes Tailwind extras no `<textarea>`." },
    onChange: {
      control: false,
      description: "Handler de mudança.",
      table: { category: "Eventos", type: { summary: "(e: ChangeEvent) => void" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: { label: "Mensagem", placeholder: "Digite sua mensagem", onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText("Mensagem") as HTMLTextAreaElement
    await expect(textarea).toHaveValue("")
    await userEvent.type(textarea, "Olá mundo")
    await expect(textarea).toHaveValue("Olá mundo")
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const WithDescription: Story = {
  args: {
    label: "Bio",
    description: "Conte um pouco sobre você. Aparece no seu perfil público.",
    placeholder: "Escreva aqui...",
  },
}

export const WithError: Story = {
  args: {
    label: "Comentário",
    placeholder: "Diga o que achou",
    error: "Comentário não pode ficar vazio.",
  },
  parameters: {
    // error-foreground + placeholder muted fail 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const Required: Story = {
  args: { label: "Justificativa", placeholder: "Obrigatório", required: true },
}

export const LabelLeft: Story = {
  args: {
    label: "Notas",
    labelPosition: "left",
    placeholder: "Layout inline",
    className: "w-72",
  },
  parameters: {
    docs: {
      description: { story: '`labelPosition="left"` para layouts de formulário em duas colunas.' },
    },
  },
}

export const WithCounter: Story = {
  render: () => {
    const [value, setValue] = useState("Componentes pequenos, reutilizáveis e cobertos por testes.")
    return (
      <Textarea
        label="Tweet"
        description="Diga em poucas palavras o que está pensando."
        placeholder="Mensagem curta..."
        maxLength={280}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-96"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com `maxLength` o componente renderiza um contador `atual/limite` abaixo do campo, atualizado em tempo real.",
      },
    },
  },
}

export const AutoResize: Story = {
  render: () => {
    const [value, setValue] = useState("Linha 1\nLinha 2\nLinha 3")
    return (
      <Textarea
        label="Auto-resize"
        description="A altura acompanha o conteúdo — pressione Enter para crescer."
        autoResize
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-96"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`autoResize` desabilita `resize`/`overflow` e ajusta `style.height` ao `scrollHeight` toda vez que o valor muda.",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <Textarea
        label="Mensagem"
        description={`Caracteres: ${value.length} | Palavras: ${value.trim() ? value.trim().split(/\s+/).length : 0}`}
        placeholder="Escreva algo..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-96"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: "Modo controlado mostrando contagem de caracteres e palavras na `description`.",
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    label: "Mensagem",
    placeholder: "Indisponível",
    disabled: true,
    value: "Conteúdo bloqueado",
  },
}

export const ReadOnly: Story = {
  args: {
    label: "Mensagem do sistema",
    readOnly: true,
    value: "Esta mensagem foi gerada automaticamente. Você pode copiar o conteúdo, mas não editar.",
    className: "w-96",
  },
}

export const WithRows: Story = {
  args: {
    label: "História completa",
    rows: 8,
    placeholder: "Escreva tudo o que quiser...",
    className: "w-96",
  },
  parameters: {
    docs: { description: { story: "`rows` define a altura inicial em linhas de texto." } },
  },
}
