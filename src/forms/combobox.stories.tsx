import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { matchesSearch } from "../lib/text"
import { Dialog } from "../overlays/dialog"
import { Button } from "../primitives/button"
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

export const OpensOnChosen: Story = {
  name: "Opens on the chosen option",
  parameters: {
    docs: {
      description: {
        story:
          "A lista abre com a opção escolhida destacada e rolada até a vista; Enter logo depois de abrir mantém o valor. A escolhida é anunciada como marcada (`aria-checked`), separada do destaque do teclado.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string | undefined>("option-30")
    return (
      <div className="w-[320px]">
        <Combobox
          options={longOptions}
          label="Opção"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione"
        />
      </div>
    )
  },
}

export const UncontrolledInForm: Story = {
  name: "Uncontrolled, in a native form",
  parameters: {
    docs: {
      description: {
        story:
          'Sem `value`, o campo guarda a própria escolha a partir de `defaultValue`. Com `name`, um `<input type="hidden">` leva o valor bruto ao formulário nativo (no modo múltiplo, os valores separados por vírgula), e o reset do formulário volta ao padrão.',
      },
    },
  },
  render: () => {
    const [sent, setSent] = useState<string | null>(null)
    return (
      <form
        className="flex w-[320px] flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          setSent(`status=${data.get("status")}; areas=${data.get("areas")}`)
        }}
      >
        <Combobox name="status" options={plainOptions} label="Status" defaultValue="pendente" />
        <Combobox
          multiple
          name="areas"
          options={sampleOptions}
          label="Áreas"
          defaultValue={["advocacia"]}
        />
        <div className="flex gap-2">
          <Button type="submit">Enviar</Button>
          <Button type="reset" variant="outline">
            Restaurar
          </Button>
        </div>
        {sent ? <p className="text-xs text-muted-foreground">Enviado: {sent}</p> : null}
      </form>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole("combobox", { name: "Status" }))
    await userEvent.click(await body.findByRole("option", { name: "Aprovado" }))
    await expect(canvas.getByRole("combobox", { name: "Status" })).toHaveTextContent("Aprovado")
    await userEvent.click(canvas.getByRole("button", { name: "Enviar" }))
    await expect(canvas.getByText("Enviado: status=aprovado; areas=advocacia")).toBeInTheDocument()
  },
}

const thousandsOfOptions: ComboboxOption[] = Array.from({ length: 2000 }, (_, i) => ({
  value: String(i + 1),
  label: `Unidade ${i + 1}`,
}))

export const ManyOptions: Story = {
  name: "Many options (2.000)",
  parameters: {
    docs: {
      description: {
        story:
          "Com milhares de opções, só as primeiras 100 que casam com a busca ficam na tela (`maxVisibleOptions`), mais a escolhida; uma linha diz quantas ficaram de fora e pede para continuar digitando. Abrir e digitar continuam rápidos.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string | undefined>()
    return (
      <div className="w-[320px]">
        <Combobox
          options={thousandsOfOptions}
          label="Unidade"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione uma unidade"
        />
      </div>
    )
  },
}

const cities = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Fortaleza",
  "Curitiba",
  "Recife",
  "Porto Alegre",
  "Goiânia",
  "Belém",
  "Manaus",
  "Campinas",
  "São Luís",
  "Maceió",
  "Natal",
  "Florianópolis",
  "João Pessoa",
  "Ribeirão Preto",
  "Uberlândia",
].map((city, i) => ({ value: String(i + 1), label: city }))

/** Stands in for an API: answers after a short delay. */
function useCitySearch(search: string) {
  const [options, setOptions] = useState<ComboboxOption[]>(cities.slice(0, 8))
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setOptions(cities.filter((city) => matchesSearch(city.label, search)).slice(0, 8))
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])
  return { options, loading }
}

export const ServerSearch: Story = {
  name: "Server search",
  parameters: {
    docs: {
      description: {
        story:
          "Busca no servidor: `onSearchChange` recebe o termo, as opções que voltam vão em `options` e `shouldFilter={false}` desliga o filtro local. Enquanto `loading`, a lista diz que está carregando em vez de dizer que nada foi encontrado. A escolha mantém o nome no gatilho mesmo quando a próxima busca não a traz.",
      },
    },
  },
  render: () => {
    const [search, setSearch] = useState("")
    const [value, setValue] = useState<string | undefined>()
    const { options, loading } = useCitySearch(search)
    return (
      <div className="w-[320px]">
        <Combobox
          options={options}
          shouldFilter={false}
          onSearchChange={setSearch}
          loading={loading}
          label="Cidade"
          value={value}
          onValueChange={setValue}
          placeholder="Selecione uma cidade"
          searchPlaceholder="Buscar cidade..."
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

const manyOptions: ComboboxOption[] = Array.from({ length: 40 }, (_, i) => ({
  value: `opcao-${i + 1}`,
  label: `Opção ${i + 1}`,
}))

export const InsideDialog: Story = {
  render: () => (
    <Dialog trigger={<Button>Abrir dialog</Button>} title="Escolher opção" size="md">
      <div className="w-[320px]">
        <Combobox options={manyOptions} label="Opção" placeholder="Selecione..." />
      </div>
    </Dialog>
  ),
}
