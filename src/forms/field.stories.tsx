import type { Meta, StoryObj } from "@storybook/react-vite"

import { Input } from "../primitives/input"
import { Label } from "../primitives/label"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSet } from "./field"

const meta = {
  title: "Forms/Field",
  component: FieldSet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Wrapper **composicional** para campos de formulário — fornece spacing, agrupamento semântico e estados de erro de forma consistente sem amarrar a uma lib específica de forms.",
          "",
          "**Sub-componentes:**",
          "- `FieldSet` — `<fieldset>` com `flex flex-col gap-6`. Use para agrupar campos relacionados.",
          "- `FieldLegend` — `<legend>` do FieldSet (`variant: 'legend' | 'label'`).",
          "- `FieldGroup` — container `flex flex-col` com gap maior (`gap-7`) para encadear vários `Field`.",
          "- `Field` — wrapper individual de um campo (`role=\"group\"`). Suporta `orientation: 'vertical' | 'horizontal' | 'responsive'`.",
          "- `FieldLabel` — `<Label>` estilizado para Field (aceita filhos compostos como checkboxes em cards).",
          "- `FieldDescription` — texto auxiliar com cor `muted-foreground`.",
          "- `FieldError` — exibe mensagens de erro (filhos diretos ou `errors={[{ message }]}`).",
          '- `FieldSeparator` — divider opcional com label centralizado (ex.: "ou").',
          "- `FieldTitle`, `FieldContent` — primitivos auxiliares para layouts compostos.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Field, FieldDescription, FieldError, FieldLabel, Input } from "@am-fernandes/ui"',
          "",
          "<Field>",
          '  <FieldLabel htmlFor="rua">Rua</FieldLabel>',
          '  <Input id="rua" placeholder="Av. Paulista" aria-invalid="true" />',
          "  <FieldDescription>Logradouro completo.</FieldDescription>",
          "  <FieldError>Campo obrigatório.</FieldError>",
          "</Field>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Classes utilitárias adicionais.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof FieldSet>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { className: "w-[360px]" },
  render: (args) => (
    <FieldSet className={args.className}>
      <FieldLegend variant="legend">Endereço</FieldLegend>
      <FieldGroup>
        <Field>
          <Label htmlFor="rua">Rua</Label>
          <Input id="rua" placeholder="Av. Paulista" />
          <FieldDescription>Logradouro completo.</FieldDescription>
        </Field>
        <Field>
          <Label htmlFor="numero">Número</Label>
          <Input id="numero" placeholder="1000" aria-invalid="true" />
          <FieldError>Número obrigatório.</FieldError>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}

export const Default: Story = {
  render: () => (
    <FieldSet className="w-[360px]">
      <FieldLegend variant="legend">Endereço</FieldLegend>
      <FieldGroup>
        <Field>
          <Label htmlFor="rua-default">Rua</Label>
          <Input id="rua-default" placeholder="Av. Paulista" />
        </Field>
        <Field>
          <Label htmlFor="numero-default">Número</Label>
          <Input id="numero-default" placeholder="1000" />
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}
