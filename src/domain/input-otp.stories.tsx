import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./input-otp"

const meta = {
  title: "Domain/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input segmentado para **OTP/PIN**, baseado em [`input-otp`](https://input-otp.rodz.dev/). Cada `InputOTPSlot` representa uma posição; o foco navega automaticamente entre slots conforme o usuário digita.",
          "",
          "**Composição:**",
          "- `InputOTP` — wrapper controlado/uncontrolled com `maxLength`.",
          "- `InputOTPGroup` — agrupa slots visualmente (geralmente um por seção do código).",
          "- `InputOTPSlot` — slot individual, identificado por `index`.",
          "- `InputOTPSeparator` — ícone divisor (`-`) entre grupos.",
          "",
          "**Props principais (`InputOTP`):**",
          "- `maxLength` — quantidade total de caracteres do código.",
          "- `value` / `onChange` — controle externo do código digitado.",
          "- `disabled` — desabilita todos os slots.",
          "- Demais props da `OTPInput` (de `input-otp`) são repassadas (ex.: `pattern`, `containerClassName`).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { InputOTP, InputOTPGroup, InputOTPSlot } from "@am-fernandes/ui"',
          "",
          'const [codigo, setCodigo] = useState("")',
          "",
          "<InputOTP maxLength={6} value={codigo} onChange={setCodigo}>",
          "  <InputOTPGroup>",
          "    <InputOTPSlot index={0} />",
          "    <InputOTPSlot index={1} />",
          "    <InputOTPSlot index={2} />",
          "    <InputOTPSlot index={3} />",
          "    <InputOTPSlot index={4} />",
          "    <InputOTPSlot index={5} />",
          "  </InputOTPGroup>",
          "</InputOTP>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    maxLength: {
      control: { type: "number", min: 1, step: 1 },
      description: "Número total de caracteres aceitos pelo OTP.",
      table: { type: { summary: "number" } },
    },
    value: {
      control: "text",
      description: "Valor atual do código (modo controlado).",
      table: { type: { summary: "string" } },
    },
    onChange: {
      control: false,
      description: "Callback disparado a cada caractere digitado.",
      table: {
        type: { summary: "(value: string) => void" },
        category: "Eventos",
      },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita a edição em todos os slots.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof InputOTP>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    maxLength: 6,
    disabled: false,
    children: null,
  },
  render: (args) => {
    const [value, setValue] = React.useState("")
    const len = args.maxLength ?? 6
    const half = Math.ceil(len / 2)
    return (
      <InputOTP maxLength={len} value={value} onChange={setValue} disabled={args.disabled}>
        <InputOTPGroup>
          {Array.from({ length: half }, (_, i) => i).map((slotIndex) => (
            <InputOTPSlot key={`slot-${slotIndex}`} index={slotIndex} />
          ))}
        </InputOTPGroup>
        {len > half && <InputOTPSeparator />}
        {len > half && (
          <InputOTPGroup>
            {Array.from({ length: len - half }, (_, i) => half + i).map((slotIndex) => (
              <InputOTPSlot key={`slot-${slotIndex}`} index={slotIndex} />
            ))}
          </InputOTPGroup>
        )}
      </InputOTP>
    )
  },
}

export const Default: Story = {
  args: {
    maxLength: 6,
    children: null,
  },
  render: () => (
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  ),
}
