import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
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
          "Controle com cara de botão cujo valor é binário (ligado ou desligado). É separado do `Button` porque o trabalho visual é outro:",
          "",
          "- o `Button` comunica **hierarquia de ação** (primária, secundária, destrutiva). Cores semânticas ali confundiriam qual é a ação principal da página;",
          '- o `Toggle` comunica **estado**. Ligado, ele assume a cor da variante, para o ligado/desligado ser lido de relance, como o "Watch" do GitHub ou a estrela do Gmail.',
          "",
          "Usa `@radix-ui/react-toggle`: API controlada (`pressed` / `onPressedChange`) e ARIA (`aria-pressed`, `data-state`) já vêm prontos.",
          "",
          '**O rótulo não muda com o estado.** Quem diz "ligado" é o `aria-pressed`. Se o texto virar "Remover da lista" quando o botão está ligado, o leitor de tela anuncia "Remover da lista, pressionado", que é o contrário do que está na tela. Dê ao `Toggle` o nome do estado ("Lista de atenção", "Favorito", "Negrito") e deixe-o fixo.',
          "",
          "**API**",
          "",
          "- `pressed` / `defaultPressed` — `boolean`.",
          "- `onPressedChange` — `(pressed: boolean) => void`.",
          "- `variant` — `default | info | success | warning | destructive`.",
          '- `size` — `sm` (32px), `md` (40px, padrão) ou `lg` (44px): a altura da caixa inteira, a mesma de um `Button` ou `Input` do mesmo tamanho. `"default"` é o nome antigo de `md`, depreciado.',
          "- `disabled` — padrão.",
          "",
          "**Exemplo**",
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
          "  Lista de atenção",
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
      options: ["sm", "md", "lg"],
      description:
        'Altura da caixa, borda incluída: 32, 40 ou 44px, as mesmas do `Button`. `"default"` é o nome antigo de `md` e continua aceito.',
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: "'md'" },
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
    children: "Favorito",
    variant: "default",
    size: "md",
  },
}

export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {}

export const PressedByDefault: Story = {
  args: { defaultPressed: true, children: "Favorito" },
}

export const Info: Story = {
  args: {
    variant: "info",
    children: (
      <>
        <InfoIcon />
        Notificações
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
      <div className="flex flex-col items-center gap-2">
        <Toggle variant="warning" pressed={pressed} onPressedChange={setPressed}>
          <AlertTriangle />
          Lista de atenção
        </Toggle>
        <p className="text-xs text-muted-foreground">
          {pressed ? "Este cliente está na lista de atenção." : "Fora da lista de atenção."}
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modo controlado. O rótulo é o nome do estado e fica fixo: ligado, o leitor de tela anuncia "Lista de atenção, pressionado". Um texto que muda com o estado ("Remover da lista…") seria lido junto com "pressionado" e diria o contrário. Se a tela precisa explicar o estado, o texto vai fora do botão.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole("button", { name: "Lista de atenção" })
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
    await userEvent.click(toggle)
    // Same name, new state: the name never has to be re-read to know which.
    await expect(canvas.getByRole("button", { name: "Lista de atenção" })).toBe(toggle)
    await expect(toggle).toHaveAttribute("aria-pressed", "true")
    await expect(canvas.getByText("Este cliente está na lista de atenção.")).toBeInTheDocument()
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
        <Toggle size="md">
          <Star />
          md
        </Toggle>
        <Toggle size="lg">
          <Star />
          lg
        </Toggle>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Galeria com todas as variantes (pressed) + os 3 tamanhos.",
      },
    },
  },
}

export const Disabled: Story = {
  args: { disabled: true, children: "Favorito" },
}
