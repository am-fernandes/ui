import type { Meta, StoryObj } from "@storybook/react-vite"
import { Input } from "./input"

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input de texto base. Aceita todos os atributos HTML nativos (`type`, `placeholder`, `disabled`, etc.). Pareie com `Label` para acessibilidade.",
          "",
          "**Props principais:**",
          "- `type` — `text`, `email`, `number`, `password`, `search`, `tel`, `url`, `file`, etc.",
          "- `placeholder` — texto exibido quando vazio.",
          "- `disabled` — desabilita o campo.",
          "- `required` — marca como obrigatório.",
          "- `value` / `onChange` para modo controlado.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "number", "password", "search", "tel", "url", "file"],
      description: "Tipo do input HTML.",
      table: { type: { summary: "string" }, defaultValue: { summary: "'text'" } },
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando o campo está vazio.",
      table: { type: { summary: "string" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o input.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório no form nativo.",
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
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    type: "text",
    placeholder: "Digite aqui",
    disabled: false,
    required: false,
    readOnly: false,
  },
}

export const Default: Story = {
  args: { placeholder: "Digite aqui" },
}

export const Disabled: Story = {
  args: { placeholder: "Digite aqui", disabled: true },
}

export const WithPlaceholder: Story = {
  args: { placeholder: "seu.email@exemplo.com", type: "email" },
}

export const Types: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Input type="text" placeholder="text" />
      <Input type="email" placeholder="email" />
      <Input type="number" placeholder="number" />
      <Input type="password" placeholder="password" />
    </div>
  ),
}
