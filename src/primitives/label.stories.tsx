import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, within } from "@storybook/test"

import { Checkbox } from "./checkbox"
import { Input } from "./input"
import { Label } from "./label"

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Label semântico, baseado em `@radix-ui/react-label`. Associa-se a um controle via `htmlFor`.",
          "",
          "**API:**",
          "- `htmlFor` — `id` do controle associado (recomendado para acessibilidade).",
          "- `asChild` — renderiza o filho como elemento raiz (mantém estilos via Radix Slot).",
          "- Repassa todos os atributos HTML de `<label>` (`onClick`, `aria-*`, etc).",
          "",
          "**Estilo:**",
          "- `text-sm font-medium leading-none` por padrão.",
          "- Inclui `peer-disabled:cursor-not-allowed peer-disabled:opacity-50` — quando o controle adjacente tem a classe `peer` e está `disabled`, o label automaticamente fica acinzentado.",
          "",
          "**Quando usar:**",
          "- Para `Checkbox`, `Switch`, `RadioGroup` itens, ou qualquer controle que você esteja montando manualmente.",
          "- **Não use** com `Input`, `Combobox`, `DateInput`, `Textarea` etc. — eles já têm prop `label` própria que wraps `Label` internamente com IDs e ARIA corretos.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Label, Checkbox } from "@amfernandesinc/ui"',
          "",
          '<div className="flex items-center gap-2">',
          '  <Checkbox id="terms" />',
          '  <Label htmlFor="terms">Aceito os termos</Label>',
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    asChild: {
      control: "boolean",
      description:
        "Renderiza o filho como elemento raiz (mantém estilos via Radix Slot). Útil para envolver `<span>`, `<a>` ou um componente custom.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    htmlFor: {
      control: "text",
      description: "`id` do controle associado.",
      table: { type: { summary: "string" } },
    },
    children: {
      control: "text",
      description: "Conteúdo do label (texto ou JSX).",
      table: { type: { summary: "ReactNode" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="voce@empresa.com" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText("Email")
    await expect(label).toBeInTheDocument()
    await expect(label).toHaveAttribute("for", "email")
  },
  parameters: {
    docs: {
      description: {
        story: "Pattern básico — `htmlFor` aponta para o `id` do controle abaixo.",
      },
    },
  },
}

export const WithRequired: Story = {
  render: () => (
    <div className="flex w-[280px] flex-col gap-1.5">
      <Label htmlFor="email-required">
        Email
        <span aria-label="obrigatório" className="ml-0.5 text-destructive">
          *
        </span>
      </Label>
      <Input id="email-required" type="email" placeholder="voce@empresa.com" required />
    </div>
  ),
  parameters: {
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
    docs: {
      description: {
        story: [
          "O `Label` público **não tem** prop `required` — para marcar campo obrigatório com asterisco vermelho, componha manualmente como acima.",
          "",
          "Se você estiver usando `Input`, `Combobox`, `Textarea` ou outro form control da lib, prefira a prop `required` nativa do componente (que delega para o `FieldShell` interno e adiciona o asterisco automaticamente).",
        ].join("\n"),
      },
    },
  },
}

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms-disabled" className="peer" disabled />
      <Label htmlFor="terms-disabled">Aceito os termos</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando o controle adjacente carrega a classe `peer` e está `disabled`, o `Label` aplica automaticamente `peer-disabled:opacity-50` + `peer-disabled:cursor-not-allowed`. O `Checkbox` da lib já vem com `peer` por padrão.",
      },
    },
  },
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="newsletter" />
      <Label htmlFor="newsletter">Quero receber a newsletter</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Caso de uso mais comum do `Label`: pareado com `Checkbox` ou `Switch`. Clicar no texto do label alterna o controle (comportamento nativo do `<label htmlFor>`).",
      },
    },
  },
}

export const AsChild: Story = {
  render: () => (
    <Label asChild>
      <span>Custom span</span>
    </Label>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`asChild` delega o elemento renderizado para o filho — útil quando você precisa que o label seja um `<span>`, `<div>` ou outro elemento sem perder os estilos de tipografia da lib.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const node = canvas.getByText("Custom span")
    await expect(node.tagName).toBe("SPAN")
    await expect(node).toHaveAttribute("data-slot", "label")
  },
}

export const Polymorphic: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label asChild>
        <a href="#docs" className="underline-offset-4 hover:underline">
          Ir para a documentação
        </a>
      </Label>
      <Label asChild>
        <button type="button" className="cursor-pointer text-left">
          Trigger custom (button)
        </button>
      </Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Combinando `asChild` com elementos polimórficos (`<a>`, `<button>`, ou componentes de routing como Next.js `Link`). O Radix Slot preserva os estilos do `Label` e repassa todas as props para o filho.",
      },
    },
  },
}
