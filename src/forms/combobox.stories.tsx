import type { Meta, StoryObj } from "@storybook/react-vite"
import { Briefcase, Building2, GraduationCap, Scale, Users } from "lucide-react"
import { useState } from "react"

import { Combobox, type ComboboxOption } from "./combobox"

const sampleOptions: ComboboxOption[] = [
  { value: "advocacia", label: "Advocacia", icon: Scale },
  { value: "consultoria", label: "Consultoria", icon: Briefcase },
  { value: "academia", label: "Academia", icon: GraduationCap },
  { value: "corporativo", label: "Corporativo", icon: Building2 },
  { value: "rh", label: "Recursos Humanos", icon: Users },
]

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Select com **busca built-in** baseado em `cmdk`. A prop `multiple` alterna entre seleção única e múltipla (com badges removíveis).",
          "Suporta ícone por opção e modo `creatable` para permitir valores fora da lista.",
          "",
          "**Shape de `ComboboxOption`:**",
          "- `value: string` — chave única.",
          "- `label: string` — texto exibido.",
          "- `icon?: ComponentType<{ className?: string }>` — ícone leading (ex.: lucide-react).",
          "- `disabled?: boolean` — desabilita a opção individual.",
          "",
          "**Props principais:**",
          "- `options` — array de `ComboboxOption`.",
          "- `multiple` — quando `true`, `value` vira `string[]` e o trigger mostra badges.",
          "- `value` / `onValueChange` — controle externo (string ou string[] conforme `multiple`).",
          "- `placeholder`, `searchPlaceholder`, `emptyMessage` — textos da UI.",
          "- `creatable` — habilita criação de valores ad-hoc a partir da busca (apenas single).",
          "- `disabled` — desabilita o trigger.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Combobox } from "@am-fernandes/ui"',
          'import { useState } from "react"',
          "",
          "const options = [",
          '  { label: "Aprovado", value: "aprovado" },',
          '  { label: "Pendente", value: "pendente" },',
          "]",
          "",
          "const [value, setValue] = useState<string | undefined>()",
          "",
          "<Combobox options={options} value={value} onValueChange={setValue} />",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    options: {
      control: "object",
      description: "Lista de opções (`ComboboxOption[]`).",
      table: { type: { summary: "ComboboxOption[]" } },
    },
    multiple: {
      control: "boolean",
      description: "Habilita seleção múltipla com badges removíveis.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    placeholder: {
      control: "text",
      description: "Texto exibido quando nada está selecionado.",
      table: { type: { summary: "string" }, defaultValue: { summary: "'Selecione...'" } },
    },
    searchPlaceholder: {
      control: "text",
      description: "Placeholder do input de busca dentro do popover.",
      table: { type: { summary: "string" }, defaultValue: { summary: "'Buscar...'" } },
    },
    emptyMessage: {
      control: "text",
      description: "Mensagem exibida quando a busca não retorna opções.",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "'Nenhuma opção encontrada.'" },
      },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o combobox.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    options: sampleOptions,
    placeholder: "Selecione uma área",
    searchPlaceholder: "Buscar...",
    emptyMessage: "Nenhuma opção encontrada.",
    multiple: false,
    disabled: false,
  },
  render: (args) => {
    const [singleValue, setSingleValue] = useState<string | undefined>()
    const [multiValue, setMultiValue] = useState<string[]>([])
    if (args.multiple) {
      return (
        <div className="w-[320px]">
          <Combobox {...args} multiple value={multiValue} onValueChange={setMultiValue} />
        </div>
      )
    }
    return (
      <div className="w-[320px]">
        <Combobox {...args} multiple={false} value={singleValue} onValueChange={setSingleValue} />
      </div>
    )
  },
}

export const Default: Story = {
  args: { options: sampleOptions, placeholder: "Selecione uma área" },
  render: (args) => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={args.options}
          value={value}
          onValueChange={setValue}
          placeholder={args.placeholder}
        />
      </div>
    )
  },
}

export const Multiple: Story = {
  args: { multiple: true, options: sampleOptions, placeholder: "Selecione áreas" },
  render: (args) => {
    const [value, setValue] = useState<string[]>(["advocacia", "consultoria"])
    return (
      <div className="w-[320px]">
        <Combobox
          multiple
          options={args.options}
          value={value}
          onValueChange={setValue}
          placeholder={args.placeholder}
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { options: sampleOptions, disabled: true, placeholder: "Indisponível" },
  render: (args) => (
    <div className="w-[320px]">
      <Combobox options={args.options} disabled placeholder={args.placeholder} />
    </div>
  ),
}
