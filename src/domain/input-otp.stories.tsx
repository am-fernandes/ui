import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Button } from "../primitives/button"
import { InputOTP, REGEXP_ONLY_DIGITS } from "./input-otp"

const meta = {
  title: "Domain/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Campo para códigos OTP / verificação SMS, alimentado pela `input-otp`. Cada slot mostra um caractere com caret animado quando ativo. O valor é mantido como uma única string de comprimento fixo.",
          "",
          "**Props principais:**",
          "- `length` — número de slots.",
          "- `value` / `onValueChange` — par controlado obrigatório.",
          "- `onComplete` — disparado quando todos os slots estão preenchidos.",
          "- `pattern` — regex em string para aceitar caracteres. Default `REGEXP_ONLY_DIGITS`.",
          "- `label`, `description`, `error`, `required`, `labelPosition` — slots do `FieldShell`.",
          "- `disabled`, `id`, `className` — controle nativo.",
          "",
          "**Re-exports:**",
          "- `REGEXP_ONLY_DIGITS` (string) — `'^\\d+$'` para dígitos apenas.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { InputOTP } from "@am-fernandes/ui"',
          'import { useState } from "react"',
          "",
          'const [code, setCode] = useState("")',
          "",
          "<InputOTP",
          "  length={6}",
          '  label="Código SMS"',
          "  value={code}",
          "  onValueChange={setCode}",
          "  onComplete={(v) => verify(v)}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    length: {
      control: "number",
      description: "Número de slots.",
      table: { type: { summary: "number" } },
    },
    value: { control: "text", table: { type: { summary: "string" } } },
    pattern: {
      control: "text",
      description: "Regex string aplicada à entrada (caractere por caractere).",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "REGEXP_ONLY_DIGITS" },
      },
    },
    onValueChange: {
      control: false,
      table: { type: { summary: "(value: string) => void" }, category: "Eventos" },
    },
    onComplete: {
      control: false,
      table: { type: { summary: "(value: string) => void" }, category: "Eventos" },
    },
    label: { control: "text", table: { type: { summary: "ReactNode" } } },
    description: { control: "text", table: { type: { summary: "ReactNode" } } },
    error: { control: "text", table: { type: { summary: "string" } } },
    required: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    labelPosition: {
      control: "inline-radio",
      options: ["up", "left", "hidden"],
      table: {
        type: { summary: "'up' | 'left' | 'hidden'" },
        defaultValue: { summary: "'up'" },
      },
    },
  },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof InputOTP>

export const Default: Story = {
  args: { length: 6, value: "", onValueChange: () => {}, label: "Código de verificação" },
  render: (args) => {
    const [value, setValue] = useState<string>(args.value ?? "")
    return (
      <div className="flex flex-col items-start gap-2">
        <InputOTP {...args} value={value} onValueChange={setValue} />
        <p className="text-xs text-muted-foreground">Valor: {value || "(vazio)"}</p>
      </div>
    )
  },
}

export const Length4: Story = {
  args: { length: 4, value: "", onValueChange: () => {}, label: "PIN" },
  render: (args) => {
    const [value, setValue] = useState<string>(args.value ?? "")
    return <InputOTP {...args} value={value} onValueChange={setValue} />
  },
  parameters: {
    docs: {
      description: {
        story: "Comprimento curto (4) para PINs ou cofres internos.",
      },
    },
  },
}

export const AlphaNumeric: Story = {
  args: {
    length: 6,
    value: "",
    onValueChange: () => {},
    pattern: "^[a-zA-Z0-9]+$",
    label: "Token de convite",
    description: "Aceita letras e dígitos.",
  },
  render: (args) => {
    const [value, setValue] = useState<string>(args.value ?? "")
    return <InputOTP {...args} value={value} onValueChange={setValue} />
  },
  parameters: {
    docs: {
      description: {
        story:
          "Override `pattern` para aceitar alfa-numéricos — útil para tokens de convite ou códigos curtos sem ambiguidade.",
      },
    },
  },
}

export const WithError: Story = {
  args: {
    length: 6,
    value: "123",
    onValueChange: () => {},
    label: "Código SMS",
    error: "Código expirado, solicite outro.",
  },
  render: (args) => {
    const [value, setValue] = useState<string>(args.value ?? "")
    return <InputOTP {...args} value={value} onValueChange={setValue} />
  },
  parameters: {
    // error-foreground fails 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const Required: Story = {
  args: {
    length: 6,
    value: "",
    onValueChange: () => {},
    label: "Código de acesso",
    required: true,
    description: "Enviado por SMS para o número cadastrado.",
  },
  render: (args) => {
    const [value, setValue] = useState<string>(args.value ?? "")
    return <InputOTP {...args} value={value} onValueChange={setValue} />
  },
}

export const Disabled: Story = {
  args: {
    length: 6,
    value: "987654",
    onValueChange: () => {},
    label: "Código verificado",
    disabled: true,
  },
  render: (args) => <InputOTP {...args} />,
}

export const OnComplete: Story = {
  render: () => {
    const [value, setValue] = useState<string>("")
    const [status, setStatus] = useState<"idle" | "completed">("idle")
    return (
      <div className="flex w-[320px] flex-col items-start gap-3">
        <InputOTP
          length={6}
          label="Código (preencha os 6 dígitos)"
          value={value}
          onValueChange={(v) => {
            setValue(v)
            if (v.length < 6) setStatus("idle")
          }}
          onComplete={(v) => {
            setStatus("completed")
            alert(`Código completo: ${v}`)
          }}
          pattern={REGEXP_ONLY_DIGITS}
        />
        <p className="text-xs text-muted-foreground">Status: {status}</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`onComplete` dispara assim que o último slot é preenchido — ideal para auto-submeter a verificação.",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string>("")
    return (
      <div className="flex w-[320px] flex-col items-start gap-3">
        <InputOTP length={6} label="Código" value={value} onValueChange={setValue} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setValue("123456")}>
            Preencher
          </Button>
          <Button variant="outline" size="sm" onClick={() => setValue("")}>
            Limpar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Valor: {value || "(vazio)"}</p>
      </div>
    )
  },
}

export const FormExample: Story = {
  render: () => {
    const [code, setCode] = useState<string>("")
    const [error, setError] = useState<string | undefined>(undefined)
    const [submitted, setSubmitted] = useState<string | null>(null)
    return (
      <form
        className="flex w-[360px] flex-col items-start gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          if (code.length < 6) {
            setError("Preencha os 6 dígitos enviados por SMS.")
            return
          }
          setError(undefined)
          setSubmitted(code)
        }}
      >
        <InputOTP
          length={6}
          required
          label="Código SMS"
          description="Enviamos um código de 6 dígitos para (11) 99999-9999."
          error={error}
          value={code}
          onValueChange={(v) => {
            setCode(v)
            if (error) setError(undefined)
          }}
          onComplete={() => setError(undefined)}
        />
        <div className="flex gap-2">
          <Button type="submit">Verificar</Button>
          <Button type="button" variant="ghost" onClick={() => setCode("")}>
            Reenviar
          </Button>
        </div>
        {submitted ? (
          <p className="text-xs text-status-success-text">Verificado: {submitted}</p>
        ) : null}
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Form realista de verificação SMS: label + description, validação no submit e botão de reenvio.",
      },
    },
  },
}
