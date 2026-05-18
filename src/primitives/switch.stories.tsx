import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { useState } from "react"

import { Switch } from "./switch"

const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Toggle on/off para preferências binárias. Baseado em Radix Switch com `label`, `description` e `error` embutidos.",
          "",
          "**API:**",
          "- `label` — texto ou JSX exibido junto ao switch.",
          "- `labelPosition` — `'right'` (default) ou `'left'`.",
          "- `description` — texto auxiliar abaixo do label.",
          '- `error` — mensagem de erro com `role="alert"`.',
          "- `checked` / `defaultChecked` — `boolean`.",
          "- `onCheckedChange` — `(checked: boolean) => void`.",
          "- `disabled`, `required` — comportamentos padrão.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Switch } from "@am-fernandes/ui"',
          "",
          '<Switch label="Notificações por e-mail" defaultChecked />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Texto do label." },
    description: { control: "text", description: "Texto auxiliar abaixo do label." },
    error: { control: "text", description: "Mensagem de erro." },
    labelPosition: {
      control: "inline-radio",
      options: ["right", "left"],
      description: "Posição do label em relação ao switch.",
      table: {
        type: { summary: "'left' | 'right'" },
        defaultValue: { summary: "'right'" },
      },
    },
    checked: {
      control: "boolean",
      description: "Estado controlado.",
      table: { type: { summary: "boolean" } },
    },
    defaultChecked: {
      control: "boolean",
      description: "Estado inicial em modo não-controlado.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o switch.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    id: { control: "text", description: "ID HTML (auto-gerado se omitido)." },
    name: { control: "text", description: "Atributo `name` para forms nativos." },
    className: { control: "text", description: "Classes Tailwind extras." },
    onCheckedChange: {
      control: false,
      description: "Disparado quando o estado muda.",
      table: { category: "Eventos", type: { summary: "(checked: boolean) => void" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
  args: { label: "Modo escuro", onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const switchEl = canvas.getByRole("switch", { name: "Modo escuro" })
    await expect(switchEl).toHaveAttribute("aria-checked", "false")
    await userEvent.click(switchEl)
    await expect(args.onCheckedChange).toHaveBeenCalledWith(true)
    await expect(switchEl).toHaveAttribute("aria-checked", "true")
  },
}

export const WithDescription: Story = {
  args: {
    label: "Notificações por e-mail",
    description: "Receba um resumo diário no seu inbox.",
  },
}

export const WithError: Story = {
  args: {
    label: "Aceitar contrato",
    error: "Você precisa aceitar para continuar.",
    required: true,
  },
  parameters: {
    // error-foreground fails 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const LabelLeft: Story = {
  args: { label: "Ativo", labelPosition: "left" },
  parameters: {
    docs: {
      description: {
        story:
          'Com `labelPosition="left"` o label aparece antes do controle — útil em listas de configurações alinhadas à direita.',
      },
    },
  },
}

export const Disabled: Story = {
  args: { label: "Indisponível", disabled: true },
}

export const DisabledChecked: Story = {
  args: { label: "Bloqueado (ativo)", disabled: true, defaultChecked: true },
}

export const Required: Story = {
  args: { label: "Aceitar termos", required: true },
}

export const Controlled: Story = {
  render: () => {
    const [on, setOn] = useState(false)
    return (
      <div className="flex flex-col gap-3">
        <Switch
          label="Receber e-mails"
          description="Atualizações de produto e novidades."
          checked={on}
          onCheckedChange={setOn}
        />
        <p className="text-xs text-muted-foreground">
          Estado atual: <strong>{on ? "ativado" : "desativado"}</strong>
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: { story: "Switch em modo controlado refletindo o estado em texto vivo." },
    },
  },
}

interface SettingsState {
  notifications: boolean
  newsletter: boolean
  marketing: boolean
}

export const SettingsList: Story = {
  render: () => {
    const [settings, setSettings] = useState<SettingsState>({
      notifications: true,
      newsletter: false,
      marketing: false,
    })

    const update = (key: keyof SettingsState) => (next: boolean) =>
      setSettings((prev) => ({ ...prev, [key]: next }))

    return (
      <div className="flex w-96 flex-col gap-4 rounded-lg border p-5">
        <header>
          <h3 className="font-semibold text-base">Notificações</h3>
          <p className="text-xs text-muted-foreground">Escolha quais alertas você quer receber.</p>
        </header>
        <div className="flex flex-col gap-4">
          <Switch
            label="Notificações no app"
            description="Alertas em tempo real dentro do produto."
            labelPosition="left"
            checked={settings.notifications}
            onCheckedChange={update("notifications")}
          />
          <Switch
            label="Newsletter semanal"
            description="Resumo das principais novidades toda segunda."
            labelPosition="left"
            checked={settings.newsletter}
            onCheckedChange={update("newsletter")}
          />
          <Switch
            label="Comunicações de marketing"
            description="Promoções, descontos e lançamentos."
            labelPosition="left"
            checked={settings.marketing}
            onCheckedChange={update("marketing")}
          />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pattern de configurações com 3 switches, label à esquerda, controle alinhado à direita.",
      },
    },
  },
}
