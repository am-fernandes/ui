import type { Meta, StoryObj } from "@storybook/react-vite"
import { AlertTriangle, CheckCircle, Eye, Info as InfoIcon, Star } from "lucide-react"
import { useState } from "react"

import { Toggle } from "./toggle"

const meta: Meta<typeof Toggle> = {
  title: "Primitives/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Button-like control whose value is binary (on/off). Separate from `Button` because the visual job is different:",
          "",
          "- `Button` communicates **action hierarchy** (primary, secondary, destructive). Semantic colours would muddy what's the page's main action.",
          "- `Toggle` communicates **state**. When pressed it picks up the variant's colour so on/off reads at a glance — the way GitHub's \"Watch\", Trello's \"Watching\", or Gmail's star do.",
          "",
          "Backed by `@radix-ui/react-toggle`, so the controlled API (`pressed` / `onPressedChange`) and ARIA (`aria-pressed`, `data-state`) come for free.",
          "",
          "**API**",
          "",
          "- `pressed` / `defaultPressed` — `boolean`.",
          "- `onPressedChange` — `(pressed: boolean) => void`.",
          "- `variant` — `default | info | success | warning | destructive`.",
          "- `size` — `sm | default | lg`.",
          "- `disabled` — standard.",
          "",
          "**Example**",
          "",
          "```tsx",
          'import { Toggle } from "@amfernandesinc/ui"',
          "",
          "<Toggle",
          '  variant="warning"',
          "  pressed={isFlagged}",
          "  onPressedChange={setFlagged}",
          ">",
          "  <AlertTriangle />",
          "  {isFlagged ? 'Remover atenção' : 'Marcar atenção'}",
          "</Toggle>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "info", "success", "warning", "destructive"],
      description: "Cor do estado pressionado (off é sempre outline neutro).",
      table: {
        type: { summary: "'default' | 'info' | 'success' | 'warning' | 'destructive'" },
        defaultValue: { summary: "'default'" },
      },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "default", "lg"],
      description: "Tamanho do controle (espelha o Button).",
      table: {
        type: { summary: "'sm' | 'default' | 'lg'" },
        defaultValue: { summary: "'default'" },
      },
    },
    pressed: {
      control: "boolean",
      description: "Estado controlado.",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    children: "Watch",
    variant: "default",
    size: "default",
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {}

export const PressedByDefault: Story = {
  args: { defaultPressed: true, children: "Watching" },
}

export const Info: Story = {
  args: {
    variant: "info",
    children: (
      <>
        <InfoIcon />
        Inscrever
      </>
    ),
    defaultPressed: true,
  },
}

export const Success: Story = {
  args: {
    variant: "success",
    children: (
      <>
        <CheckCircle />
        Concluído
      </>
    ),
    defaultPressed: true,
  },
}

export const Warning: Story = {
  args: {
    variant: "warning",
    children: (
      <>
        <AlertTriangle />
        Lista de atenção
      </>
    ),
    defaultPressed: true,
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Bloqueado",
    defaultPressed: true,
  },
}

export const Controlled: Story = {
  render: () => {
    const [pressed, setPressed] = useState(false)
    return (
      <Toggle variant="warning" pressed={pressed} onPressedChange={setPressed}>
        <AlertTriangle />
        {pressed ? "Remover da lista de atenção" : "Adicionar a lista de atenção"}
      </Toggle>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modo controlado típico: o label troca em função do estado, refletindo a ação inversa ao clique.",
      },
    },
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Toggle>
          <Eye />
          default off
        </Toggle>
        <Toggle defaultPressed>
          <Eye />
          default on
        </Toggle>
        <Toggle variant="info" defaultPressed>
          <InfoIcon />
          info on
        </Toggle>
        <Toggle variant="success" defaultPressed>
          <CheckCircle />
          success on
        </Toggle>
        <Toggle variant="warning" defaultPressed>
          <AlertTriangle />
          warning on
        </Toggle>
        <Toggle variant="destructive" defaultPressed>
          destructive on
        </Toggle>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Toggle size="sm">
          <Star />
          sm
        </Toggle>
        <Toggle size="default">
          <Star />
          default
        </Toggle>
        <Toggle size="lg">
          <Star />
          lg
        </Toggle>
      </div>
    </div>
  ),
  parameters: {
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: {
      description: {
        story: "Galeria com todas as variantes (pressed) + os 3 tamanhos.",
      },
    },
  },
}

export const Disabled: Story = {
  args: { disabled: true, children: "Disabled" },
}
