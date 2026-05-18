import type { Meta, StoryObj } from "@storybook/react"

import { Button } from "../primitives/button"
import { Toaster, toast } from "./sonner"

type PlaygroundArgs = {
  position:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
  richColors: boolean
  closeButton: boolean
  message: string
  variant: "default" | "success" | "error" | "warning" | "info"
  description: string
}

const meta: Meta<typeof Toaster> = {
  title: "Overlays/Sonner",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Container global de toasts. Monte **um único** `<Toaster />` no root da app; dispare via `toast()`, `toast.success()`, `toast.error()`, `toast.warning()` ou `toast.info()` em qualquer lugar.",
          "",
          "**Props principais (`Toaster`):**",
          "- `position` — canto da viewport. Default `'bottom-right'`.",
          "- `richColors: boolean` — usa paleta saturada por variante.",
          "- `closeButton: boolean` — exibe botão de fechar em cada toast.",
          "- `expand: boolean` — expande toasts por padrão (sem hover).",
          "- `duration: number` — duração padrão em ms.",
          "- `theme: 'light' | 'dark' | 'system'` — força o tema do toast.",
          "",
          "**API imperativa (`toast`):**",
          "- `toast(message, options?)` — toast neutro.",
          "- `toast.success/error/warning/info/loading(message, options?)` — variantes semânticas.",
          "- `toast.promise(promise, { loading, success, error })` — atrela o toast a uma `Promise`.",
          "- `options.description`, `options.action`, `options.duration` etc. para refinar.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    position: {
      control: "inline-radio",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
      description: "Canto da viewport onde os toasts aparecem.",
      table: {
        type: {
          summary:
            "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'",
        },
        defaultValue: { summary: "'bottom-right'" },
      },
    },
    richColors: {
      control: "boolean",
      description: "Aplica cores saturadas por variante (`success`, `error` etc.).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    closeButton: {
      control: "boolean",
      description: "Mostra botão `X` em cada toast.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
  },
}

export default meta

type Story = StoryObj<PlaygroundArgs>

export const Playground: Story = {
  args: {
    position: "bottom-right",
    richColors: false,
    closeButton: false,
    message: "Salvo com sucesso!",
    variant: "success",
    description: "",
  },
  argTypes: {
    message: {
      control: "text",
      description: "Texto principal do toast.",
      table: { type: { summary: "string" } },
    },
    variant: {
      control: "inline-radio",
      options: ["default", "success", "error", "warning", "info"],
      description: "Função do `toast` a chamar.",
      table: {
        type: { summary: "'default' | 'success' | 'error' | 'warning' | 'info'" },
        defaultValue: { summary: "'default'" },
      },
    },
    description: {
      control: "text",
      description: "Texto secundário (passado em `options.description`). Vazio = sem descrição.",
      table: { type: { summary: "string" } },
    },
  },
  render: (args) => {
    const { position, richColors, closeButton, message, variant, description } = args
    function fire() {
      const opts = description ? { description } : undefined
      switch (variant) {
        case "success":
          toast.success(message, opts)
          break
        case "error":
          toast.error(message, opts)
          break
        case "warning":
          toast.warning(message, opts)
          break
        case "info":
          toast.info(message, opts)
          break
        default:
          toast(message, opts)
      }
    }
    return (
      <>
        <Toaster position={position} richColors={richColors} closeButton={closeButton} />
        <Button onClick={fire}>Disparar toast</Button>
      </>
    )
  },
}

export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <Button onClick={() => toast.success("Salvo com sucesso!")}>Disparar toast</Button>
    </>
  ),
}
