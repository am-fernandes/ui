import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { isValidCEP } from "@/lib/brazil"
import { CEPInput } from "./cep-input"

const meta = {
  title: "Domain/CEPInput",
  component: CEPInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input para **CEP** com máscara `00000-000`. O valor interno são apenas os **dígitos limpos** (string de até 8 dígitos), enquanto o display é mascarado em tempo real.",
          "",
          "**Props principais:**",
          '- `value` — CEP atual como string de dígitos limpos (ex.: `"01310100"`).',
          "- `onValueChange` — callback `(value: string) => void` que recebe os dígitos limpos a cada edição.",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`.",
          "- `disabled` — desabilita a edição.",
          "- `defaultValue` — valor inicial (sem máscara) quando o campo não é controlado: sem `value`, ele guarda o próprio valor.",
          "- `name` — nome no formulário nativo. O form recebe o valor **sem máscara**, por um input oculto.",
          "- `size` — altura do campo: `sm` (32px), `md` (40px, padrão) ou `lg` (44px), a mesma de botões e selects do mesmo tamanho.",
          "- `readOnly` — somente leitura: o valor fica legível, recebe foco e é enviado, mas não é editável. Use em tela de consulta, no lugar de `disabled`.",
          "- `onComplete` — chamado com os oito dígitos quando o CEP fica completo por uma edição (oitavo dígito digitado ou CEP colado). É o gancho da consulta de endereço.",
          "- `loading` — mostra um indicador dentro do campo enquanto a consulta roda; o campo continua editável.",
          "- `labels` — textos do componente (`defaultCEPInputLabels`).",
          "- Demais props do `<input>` (exceto `value`, `onChange`, `type`) são repassadas.",
          "",
          "**Validação:** o componente é apenas um formatador. Para validar o tamanho use `isValidCEP` de `@amfernandesinc/ui/lib/brazil`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { CEPInput, isValidCEP } from "@amfernandesinc/ui"',
          "",
          'const [cep, setCep] = useState("")',
          'const error = cep.length > 0 && !isValidCEP(cep) ? "CEP incompleto" : undefined',
          "",
          "<CEPInput",
          '  id="cep"',
          '  label="CEP"',
          "  value={cep}",
          "  onValueChange={setCep}",
          "  error={error}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "text",
      description: "Dígitos limpos do CEP (0–8 chars).",
      table: { type: { summary: "string" } },
    },
    onValueChange: {
      control: false,
      description: "Callback disparado a cada edição com os dígitos limpos.",
      table: { type: { summary: "(value: string) => void" }, category: "Eventos" },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    label: {
      control: "text",
      description: "Rótulo renderizado via `FieldShell`.",
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof CEPInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CEPInput id="cep" label="CEP" value={value} onValueChange={setValue} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText(/CEP/) as HTMLInputElement
    await userEvent.type(input, "01310100")
    await expect(input).toHaveValue("01310-100")
  },
}

export const Filled: Story = {
  args: { value: "01310100", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("01310100")
    return (
      <div className="w-80">
        <CEPInput id="cep" label="CEP" value={value} onValueChange={setValue} />
      </div>
    )
  },
}

export const ErrorState: Story = {
  args: { value: "0131", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("0131")
    return (
      <div className="w-80">
        <CEPInput
          id="cep"
          label="CEP"
          value={value}
          onValueChange={setValue}
          error="CEP incompleto"
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: { value: "01310100", onValueChange: () => {}, disabled: true },
  render: () => (
    <div className="w-80">
      <CEPInput id="cep" label="CEP" value="01310100" onValueChange={() => {}} disabled />
    </div>
  ),
}

export const Required: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CEPInput id="cep" label="CEP" value={value} onValueChange={setValue} required />
      </div>
    )
  },
}

export const Description: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    return (
      <div className="w-80">
        <CEPInput
          id="cep"
          label="CEP"
          description="Código de Endereçamento Postal — 8 dígitos."
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const WithValidationFeedback: Story = {
  args: { value: "", onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState("")
    const showError = value.length > 0 && value.length < 8 && !isValidCEP(value)
    return (
      <div className="w-80">
        <CEPInput
          id="cep"
          label="CEP"
          value={value}
          onValueChange={setValue}
          error={showError ? "CEP incompleto (precisa de 8 dígitos)" : undefined}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Dígitos: {value || "(vazio)"} — válido: {String(isValidCEP(value))}
        </p>
      </div>
    )
  },
}

export const AddressLookup: Story = {
  args: {},
  render: () => {
    const [cep, setCep] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [address, setAddress] = React.useState<string | null>(null)
    const timer = React.useRef<number | undefined>(undefined)
    React.useEffect(() => () => window.clearTimeout(timer.current), [])

    // Faz as vezes da chamada ao serviço de CEP.
    const lookup = (value: string) => {
      setLoading(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        setAddress(
          value === "01310100"
            ? "Avenida Paulista, Bela Vista, São Paulo - SP"
            : "CEP não encontrado",
        )
        setLoading(false)
      }, 1200)
    }

    return (
      <div className="flex w-80 flex-col gap-2">
        <CEPInput
          id="cep-lookup"
          label="CEP"
          description="Experimente 01310-100."
          value={cep}
          onValueChange={(value) => {
            setCep(value)
            setAddress(null)
          }}
          onComplete={lookup}
          loading={loading}
        />
        <p className="text-sm" data-testid="address">
          {address ?? "Endereço: (informe o CEP)"}
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`onComplete` dispara quando o oitavo dígito entra (ou um CEP inteiro é colado) e `loading` mostra o indicador dentro do campo durante a consulta. O campo continua editável: corrigir o CEP dispara uma nova consulta.",
      },
    },
  },
}

export const ReadOnly: Story = {
  args: {},
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <CEPInput id="cep-editable" label="CEP (editável)" defaultValue={"01310100"} />
      <CEPInput
        id="cep-readonly"
        label="CEP (somente leitura)"
        defaultValue={"01310100"}
        readOnly
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`readOnly` é o estado de tela de consulta: fundo esmaecido, sem reação ao hover, com o valor legível, focável e enviado no formulário. `disabled` (50% de opacidade, fora do Tab e do envio) é para o campo que não se aplica.",
      },
    },
  },
}

export const Sizes: Story = {
  args: {},
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <CEPInput id="cep-sm" label="CEP (sm)" size="sm" defaultValue={"01310100"} />
      <CEPInput id="cep-md" label="CEP (md)" size="md" defaultValue={"01310100"} />
      <CEPInput id="cep-lg" label="CEP (lg)" size="lg" defaultValue={"01310100"} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` define a altura da caixa inteira, borda incluída: 32, 40 e 44px. É o mesmo token de `Button` e dos demais controles, então campo e botão do mesmo tamanho ficam alinhados numa linha.",
      },
    },
  },
}
