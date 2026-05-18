import type { Meta, StoryObj } from "@storybook/react-vite"
import { Textarea } from "./textarea"

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Campo de texto multilinha. Aceita `rows` e os atributos HTML nativos.",
          "",
          "**Props principais:**",
          "- `placeholder` — texto exibido quando vazio.",
          "- `rows` — quantidade de linhas visíveis.",
          "- `disabled` — desabilita o campo.",
          "- `required` — marca como obrigatório.",
          "- `readOnly` — apenas leitura.",
          "- `value` / `onChange` para modo controlado.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    placeholder: {
      control: "text",
      description: "Texto exibido quando vazio.",
      table: { type: { summary: "string" } },
    },
    rows: {
      control: { type: "number", min: 1, step: 1 },
      description: "Número de linhas visíveis.",
      table: { type: { summary: "number" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o textarea.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    readOnly: {
      control: "boolean",
      description: "Apenas leitura.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
    onChange: {
      control: false,
      description: "Handler de mudança.",
      table: { category: "Eventos", type: { summary: "(e: ChangeEvent) => void" } },
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    placeholder: "Digite sua mensagem",
    rows: 4,
    disabled: false,
    required: false,
    readOnly: false,
  },
}

export const Default: Story = {
  args: { placeholder: "Digite sua mensagem" },
}

export const Disabled: Story = {
  args: { placeholder: "Digite sua mensagem", disabled: true },
}

export const WithRows: Story = {
  args: { rows: 6, placeholder: "Mensagem longa..." },
}
