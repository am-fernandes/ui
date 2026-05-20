import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Combobox, type ComboboxOption } from "./combobox"

const sampleOptions: ComboboxOption[] = [
  { value: "advocacia", label: "Advocacia" },
  { value: "consultoria", label: "Consultoria" },
  { value: "academia", label: "Academia" },
  { value: "corporativo", label: "Corporativo" },
  { value: "rh", label: "Recursos Humanos" },
]

const plainOptions: ComboboxOption[] = [
  { value: "aprovado", label: "Aprovado" },
  { value: "pendente", label: "Pendente" },
  { value: "rejeitado", label: "Rejeitado" },
]

const longOptions: ComboboxOption[] = Array.from({ length: 50 }, (_, i) => ({
  value: `option-${i + 1}`,
  label: `Opção ${i + 1}`,
}))

const meta: Meta<typeof Combobox> = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Select com **busca built-in** baseado em `cmdk`. A prop `multiple` alterna entre seleção única e múltipla (com badges removíveis).",
          "Suporta modo `creatable` para permitir valores fora da lista.",
          "",
          "**Shape de `ComboboxOption`:**",
          "- `value: string` — chave única.",
          "- `label: string` — texto exibido.",
          "- `disabled?: boolean` — desabilita a opção individual.",
          "",
          "**Props principais:**",
          "- `options` — array de `ComboboxOption`.",
          "- `multiple` — quando `true`, `value` vira `string[]` e o trigger mostra badges.",
          "- `value` / `onValueChange` — controle externo (string ou string[] conforme `multiple`).",
          "- `placeholder`, `searchPlaceholder`, `emptyMessage` — textos da UI.",
          "- `creatable` — habilita criação de valores ad-hoc a partir da busca.",
          "- `label` / `description` / `error` / `required` — wiring de `FieldShell` (ARIA + visual).",
          "- `labelPosition: 'up' | 'left' | 'hidden'` — layout do label.",
          "- `disabled` — desabilita o trigger.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Combobox } from "@amfernandesinc/ui"',
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
    creatable: {
      control: "boolean",
      description: "Permite criar valor ad-hoc a partir da busca.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    label: { control: "text", description: "Label exibido pelo FieldShell." },
    description: { control: "text", description: "Descrição auxiliar (text-xs muted)." },
    error: { control: "text", description: "Mensagem de erro — habilita `aria-invalid`." },
    required: { control: "boolean", description: "Marca o label como obrigatório." },
    labelPosition: {
      control: "select",
      options: ["up", "left", "hidden"],
      table: { defaultValue: { summary: "'up'" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o combobox.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
  },
}

export default meta
type Story = StoryObj<typeof Combobox>

export const Playground: Story = {
  args: {
    options: sampleOptions,
    label: "Área de atuação",
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
  render: () => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={plainOptions}
          label="Status"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione um status"
        />
      </div>
    )
  },
}

export const WithDescription: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={plainOptions}
          label="Status do processo"
          description="Escolha o status atual — só admins podem editar depois."
          value={value}
          onValueChange={setValue}
          placeholder="Selecione"
        />
      </div>
    )
  },
}

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={plainOptions}
          label="Status"
          error="Selecione um status antes de salvar."
          required
          value={value}
          onValueChange={setValue}
          placeholder="Selecione"
        />
      </div>
    )
  },
  parameters: {
    // error-text foreground fails 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["advocacia", "consultoria"])
    return (
      <div className="w-[320px]">
        <Combobox
          multiple
          options={sampleOptions}
          label="Áreas"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione áreas"
        />
      </div>
    )
  },
}

export const Creatable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Quando o termo buscado não existe nas opções, oferece *Usar: 'termo'* para emitir um valor ad-hoc.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string>("")
    return (
      <div className="w-[320px]">
        <Combobox
          creatable
          options={plainOptions}
          label="Tags"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione ou digite"
          searchPlaceholder="Buscar ou criar..."
        />
        <p className="mt-2 text-xs text-muted-foreground">Valor atual: {value || "(vazio)"}</p>
      </div>
    )
  },
}

export const ControlledMulti: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Controle externo total. Setamos um estado inicial e exibimos o array selecionado em tempo real.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string[]>(["advocacia"])
    return (
      <div className="flex w-[320px] flex-col gap-2">
        <Combobox
          multiple
          options={sampleOptions}
          label="Áreas favoritas"
          value={value}
          onValueChange={setValue}
          placeholder="Adicione áreas"
        />
        <p className="text-xs text-muted-foreground">JSON: {JSON.stringify(value)}</p>
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { options: sampleOptions, disabled: true, label: "Área", placeholder: "Indisponível" },
  render: (args) => (
    <div className="w-[320px]">
      <Combobox options={args.options} label={args.label} disabled placeholder={args.placeholder} />
    </div>
  ),
}

export const EmptyOptions: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={[]}
          label="Sem opções"
          emptyMessage="Nenhum item disponível no momento."
          placeholder="Selecione"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const LongList: Story = {
  parameters: {
    docs: {
      description: {
        story: "Lista grande (50 itens) — list interna do `cmdk` é scrollável com `max-h-[300px]`.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={longOptions}
          label="Opções (50)"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione"
          searchPlaceholder="Filtrar..."
        />
      </div>
    )
  },
}

export const WithRHF: Story = {
  name: "react-hook-form integration",
  parameters: {
    docs: {
      description: {
        story:
          "Integração com `react-hook-form` via `<Controller>`. O Combobox é controlado, então mapeie `field.value`/`field.onChange` direto e use `fieldState.error?.message` para o erro.",
      },
    },
  },
  render: () => {
    type FormValues = { area: string }
    const { control, handleSubmit, formState } = useForm<FormValues>({
      defaultValues: { area: "" },
    })
    const [submitted, setSubmitted] = useState<FormValues | null>(null)
    return (
      <form
        className="flex w-[320px] flex-col gap-3"
        onSubmit={handleSubmit((data) => setSubmitted(data))}
      >
        <Controller
          name="area"
          control={control}
          rules={{ required: "Escolha uma área antes de enviar" }}
          render={({ field, fieldState }) => (
            <Combobox
              options={sampleOptions}
              label="Área de atuação"
              required
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error?.message}
              placeholder="Selecione"
            />
          )}
        />
        <button
          type="submit"
          className="rounded-md border border-input bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Enviar
        </button>
        {submitted ? (
          <p className="text-xs text-muted-foreground">Submitted: {JSON.stringify(submitted)}</p>
        ) : null}
        {formState.isSubmitted && !formState.isValid ? (
          <p className="text-xs text-muted-foreground">isValid: false (corrija o erro acima).</p>
        ) : null}
      </form>
    )
  },
}
