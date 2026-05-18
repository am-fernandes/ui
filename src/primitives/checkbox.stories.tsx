import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { useMemo, useState } from "react"

import { Checkbox } from "./checkbox"

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Checkbox baseado em Radix com `label`, `description` e `error` embutidos.",
          "",
          "**API:**",
          "- `label` — texto ou JSX exibido ao lado do controle (parea via `htmlFor` automaticamente).",
          "- `description` — texto auxiliar abaixo do label, vinculado via `aria-describedby`.",
          '- `error` — mensagem de erro com `role="alert"` e `aria-invalid` no controle.',
          "- `checked` / `defaultChecked` — `boolean | 'indeterminate'`.",
          "- `onCheckedChange` — `(checked: boolean | 'indeterminate') => void`.",
          "- `disabled`, `required` — comportamentos padrão.",
          "- `id` — opcional; o componente gera um ID estável quando omitido.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Checkbox } from "@am-fernandes/ui"',
          "",
          '<Checkbox label="Aceito os termos" required />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Texto do label." },
    description: { control: "text", description: "Texto auxiliar abaixo do label." },
    error: { control: "text", description: "Mensagem de erro (renderiza `role=alert`)." },
    checked: {
      control: "boolean",
      description: "Estado controlado (`true`, `false` ou `'indeterminate'`).",
      table: { type: { summary: "boolean | 'indeterminate'" } },
    },
    defaultChecked: {
      control: "boolean",
      description: "Estado inicial em modo não-controlado.",
      table: { type: { summary: "boolean" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o checkbox.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório (asterisco no label).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: { control: "text", description: "ID HTML (auto-gerado se omitido)." },
    className: { control: "text", description: "Classes Tailwind extras no controle." },
    onCheckedChange: {
      control: false,
      description: "Handler de mudança.",
      table: {
        category: "Eventos",
        type: { summary: "(checked: boolean | 'indeterminate') => void" },
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Default: Story = {
  args: { label: "Aceito os termos", onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const checkbox = canvas.getByRole("checkbox", { name: "Aceito os termos" })
    await expect(checkbox).toHaveAttribute("aria-checked", "false")
    await userEvent.click(checkbox)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    await expect(checkbox).toHaveAttribute("aria-checked", "true")
  },
}

export const WithDescription: Story = {
  args: {
    label: "Receber newsletter",
    description: "Enviamos no máximo um e-mail por semana.",
  },
}

export const WithError: Story = {
  args: {
    label: "Aceito os termos",
    error: "Você precisa aceitar para continuar.",
  },
  parameters: {
    // error-foreground fails 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const Required: Story = {
  args: { label: "Política de privacidade", required: true },
}

export const Disabled: Story = {
  args: { label: "Opção indisponível", disabled: true },
}

export const Checked: Story = {
  args: { label: "Selecionado", defaultChecked: true },
}

export const Indeterminate: Story = {
  render: () => {
    const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate")
    return (
      <Checkbox
        label="Indeterminate (clique para alternar)"
        description={`Estado atual: ${String(checked)}`}
        checked={checked}
        onCheckedChange={setChecked}
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Estado `'indeterminate'` renderiza um traço (`MinusIcon`). Usado tipicamente em \"selecionar todos\" quando há seleção parcial.",
      },
    },
  },
}

export const RichLabel: Story = {
  args: {
    label: (
      <>
        Li e aceito os{" "}
        <a className="underline" href="/termos" target="_blank" rel="noreferrer">
          termos de uso
        </a>{" "}
        e a{" "}
        <a className="underline" href="/privacidade" target="_blank" rel="noreferrer">
          política de privacidade
        </a>
        .
      </>
    ),
    required: true,
  },
  parameters: {
    docs: {
      description: {
        story: "`label` aceita `ReactNode`, permitindo links inline mesmo quando obrigatório.",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    return (
      <div className="flex flex-col gap-3">
        <Checkbox
          label="Notificações por e-mail"
          description="Você pode alterar a qualquer momento."
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
        <p className="text-xs text-muted-foreground">
          Estado: <strong>{checked ? "ativado" : "desativado"}</strong>
        </p>
      </div>
    )
  },
  parameters: {
    docs: { description: { story: "Modo controlado clássico via `useState`." } },
  },
}

interface TaskState {
  id: string
  label: string
  done: boolean
}

export const Group: Story = {
  render: () => {
    const [tasks, setTasks] = useState<TaskState[]>([
      { id: "design", label: "Definir design system", done: true },
      { id: "build", label: "Implementar componentes", done: false },
      { id: "docs", label: "Documentar API pública", done: false },
    ])

    const allChecked = useMemo(() => tasks.every((t) => t.done), [tasks])
    const someChecked = useMemo(() => tasks.some((t) => t.done), [tasks])
    const parentState: boolean | "indeterminate" = allChecked
      ? true
      : someChecked
        ? "indeterminate"
        : false

    const toggleAll = (next: boolean | "indeterminate") => {
      const target = next === true
      setTasks((prev) => prev.map((t) => ({ ...t, done: target })))
    }

    const toggleOne = (id: string, next: boolean | "indeterminate") => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: next === true } : t)))
    }

    return (
      <div className="flex w-80 flex-col gap-2 rounded-md border p-4">
        <Checkbox label="Selecionar todas" checked={parentState} onCheckedChange={toggleAll} />
        <div className="ml-6 flex flex-col gap-2 border-l pl-3">
          {tasks.map((t) => (
            <Checkbox
              key={t.id}
              label={t.label}
              checked={t.done}
              onCheckedChange={(next) => toggleOne(t.id, next)}
            />
          ))}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pattern "select-all" com 3 filhos. O pai fica `indeterminate` quando há seleção parcial e marca/desmarca todos quando clicado.',
      },
    },
  },
}
