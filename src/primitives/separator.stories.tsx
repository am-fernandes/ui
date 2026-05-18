import type { Meta, StoryObj } from "@storybook/react-vite"
import { Separator } from "./separator"

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          'Linha divisória horizontal ou vertical. Use `orientation="vertical"` em containers com altura definida.',
          "",
          "**Props principais:**",
          "- `orientation` — `'horizontal'` (default) ou `'vertical'`.",
          "- `decorative` — quando `true` (default), o separador é puramente visual; quando `false`, expõe role semântica para tecnologias assistivas.",
          "- `className` — para ajustar cor, espessura ou margens.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Separator } from "@am-fernandes/ui"',
          "",
          "<div>",
          '  <p className="text-sm">Acima</p>',
          '  <Separator className="my-4" />',
          '  <p className="text-sm">Abaixo</p>',
          "</div>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Direção da linha.",
      table: {
        type: { summary: "'horizontal' | 'vertical'" },
        defaultValue: { summary: "'horizontal'" },
      },
    },
    decorative: {
      control: "boolean",
      description: "Se `true`, o separador é apenas visual (sem role semântica).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "true" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras (cor, espessura, margens).",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    orientation: "horizontal",
    decorative: true,
    className: "my-4",
  },
  render: (args) => (
    <div className={args.orientation === "horizontal" ? "w-64" : "flex h-12 items-center gap-4"}>
      {args.orientation === "horizontal" ? (
        <>
          <p className="text-sm">Acima</p>
          <Separator {...args} />
          <p className="text-sm">Abaixo</p>
        </>
      ) : (
        <>
          <span className="text-sm">Esquerda</span>
          <Separator {...args} />
          <span className="text-sm">Direita</span>
        </>
      )}
    </div>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm">Acima</p>
      <Separator className="my-4" />
      <p className="text-sm">Abaixo</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-12 items-center gap-4">
      <span className="text-sm">Esquerda</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Direita</span>
    </div>
  ),
}
