import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "@storybook/test"

import { Component } from "./component"

/**
 * Template de stories que acompanha `component.tsx`.
 *
 * Variantes obrigatórias para qualquer field: Default, Error, Disabled, Required.
 * `Description` é recomendado quando o componente tem suporte a prop `description`.
 *
 * Renomeie `title` para refletir a categoria/pasta final
 * (ex.: `"Primitives/MyField"`, `"Forms/MyField"`, `"Domain/MyField"`).
 */
const meta: Meta<typeof Component> = {
  title: "Template/Component",
  component: Component,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Template de field para `@amfernandesinc/ui`.",
          "",
          "Demonstra `FieldShell` + `useFieldIds`, ARIA completo, estado de erro e ref forwarding.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    labelPosition: { control: "select", options: ["up", "left", "hidden"] },
    description: { control: "text" },
    error: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
}
export default meta
type Story = StoryObj<typeof Component>

export const Default: Story = {
  args: {
    label: "Campo",
    placeholder: "Digite algo",
    onChange: fn(),
  },
}

export const Description: Story = {
  args: {
    label: "Campo",
    description: "Texto auxiliar abaixo do controle.",
    placeholder: "Digite algo",
  },
}

export const Error: Story = {
  args: {
    label: "Campo",
    value: "valor inválido",
    error: "Valor não permitido.",
  },
}

export const Disabled: Story = {
  args: {
    label: "Campo",
    value: "Não editável",
    disabled: true,
  },
}

export const Required: Story = {
  args: {
    label: "Campo",
    required: true,
    placeholder: "Obrigatório",
  },
}
