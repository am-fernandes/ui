import type { Meta, StoryObj } from "@storybook/react"
import { type CSSProperties, useState } from "react"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Dialog } from "./dialog"
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
          "- `richColors: boolean` — pinta o toast com o fundo forte do status (sucesso, erro, alerta, informação). Sem ele, o toast é neutro e só o ícone leva a cor.",
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
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Toaster, toast, Button } from "@amfernandesinc/ui"',
          "",
          "// monte uma única vez no root da app",
          '<Toaster position="bottom-right" />',
          "",
          "// dispare de qualquer lugar",
          '<Button onClick={() => toast.success("Salvo com sucesso!")}>',
          "  Disparar toast",
          "</Button>",
          "```",
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
      description:
        "Fundo forte do status por variante (`success`, `error` etc.). Sem ele, só o ícone leva a cor.",
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

export const WithDescription: Story = {
  render: () => (
    <>
      <Toaster />
      <div className="flex gap-2">
        <Button
          onClick={() =>
            toast.success("Proposta salva", {
              description: "O comprador foi avisado por e-mail.",
            })
          }
        >
          Disparar sucesso
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Não foi possível salvar", {
              description: "Confira a conexão e tente de novo.",
            })
          }
        >
          Disparar erro
        </Button>
      </div>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`description` é o texto de apoio, na cor de `--muted-foreground` nos dois temas. Troque o tema na barra do Storybook para conferir.",
      },
    },
  },
}

export const WithAction: Story = {
  render: () => {
    const [undone, setUndone] = useState(0)
    return (
      <>
        <Toaster />
        <div className="flex flex-col items-start gap-3">
          <Button
            onClick={() =>
              toast("Proposta arquivada", {
                description: "Ela saiu da fila de atendimento.",
                action: { label: "Desfazer", onClick: () => setUndone((n) => n + 1) },
              })
            }
          >
            Arquivar proposta
          </Button>
          <p className="text-sm text-muted-foreground" data-testid="undo-count">
            Desfeitas: {undone}
          </p>
        </div>
      </>
    )
  },
}

export const CustomOptions: Story = {
  render: () => (
    <>
      <Toaster
        richColors
        position="top-center"
        toastOptions={{ duration: 8000, classNames: { description: "text-xs" } }}
        style={{ "--width": "420px" } as CSSProperties}
      />
      <Button
        onClick={() =>
          toast.success("Proposta aprovada", { description: "O comprador foi avisado." })
        }
      >
        Disparar sucesso
      </Button>
    </>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "As props do `Toaster` somam com os padrões da lib em vez de substituí-los: `toastOptions` (e cada chave de `classNames`), `style`, `icons` e `className`. Aqui o toast dura 8s, aparece no topo, é mais largo e tem a descrição menor, sem perder as cores nem o ícone.",
      },
    },
  },
}

export const OverDialog: Story = {
  render: () => {
    const [retries, setRetries] = useState(0)
    const fail = () =>
      toast.error("Não foi possível salvar", {
        description: "Confira a conexão e tente de novo.",
        action: { label: "Tentar de novo", onClick: () => setRetries((n) => n + 1) },
      })
    return (
      <>
        <Toaster />
        <div className="flex flex-col items-start gap-3">
          <Dialog
            trigger={<Button>Editar proposta</Button>}
            title="Editar proposta"
            description="O formulário continua aberto enquanto o aviso aparece."
            footer={<Button onClick={fail}>Salvar</Button>}
          >
            <Input label="Cliente" defaultValue="Ana Souza" />
          </Dialog>
          <p className="text-sm text-muted-foreground" data-testid="retry-count">
            Tentativas: {retries}
          </p>
        </div>
      </>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com um `Dialog` aberto o aviso continua usável: dá para clicar em “Tentar de novo”, fechar o aviso e chegar nele pelo teclado (Alt+T), e nada disso fecha o diálogo.",
      },
    },
  },
}
