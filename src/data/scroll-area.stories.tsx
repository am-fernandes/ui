import type { Meta, StoryObj } from "@storybook/react-vite"
import { ScrollArea } from "./scroll-area"

const meta = {
  title: "Data/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      // Radix ScrollArea's viewport is keyboard-scrollable but lacks a tabindex; axe flags it as
      // unreachable in Safari. Wrapping content with a focusable region is consumer responsibility
      // (e.g. role="region" + tabindex on the consumer-supplied content).
      config: { rules: [{ id: "scrollable-region-focusable", enabled: false }] },
    },
    docs: {
      description: {
        component: [
          "Container com scroll customizado e barras estilizadas. Wrapper sobre [`@radix-ui/react-scroll-area`](https://www.radix-ui.com/primitives/docs/components/scroll-area) — substitui a scrollbar nativa do browser por uma barra padronizada que respeita o tema.",
          "",
          "**Props principais (encaminhadas para `ScrollArea.Root` do Radix):**",
          "- `className` — classes Tailwind do wrapper externo. Defina **altura/largura fixas aqui** (ex.: `h-[200px] w-[260px]`); o scroll só aparece quando o conteúdo excede o container.",
          "- `type` — quando exibir a scrollbar: `'auto'` (default — só quando há overflow), `'always'`, `'scroll'` (durante interação) ou `'hover'`.",
          "- `scrollHideDelay` — tempo (ms) até esconder a barra após interação. Default `600`.",
          "- `dir` — direção de leitura (`'ltr'` / `'rtl'`).",
          "",
          'Para scroll horizontal, adicione `<ScrollBar orientation="horizontal" />` dentro do `ScrollArea`.',
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { ScrollArea } from "@am-fernandes/ui"',
          "",
          '<ScrollArea className="h-[200px] w-[260px] rounded-md border p-4">',
          '  <div className="flex flex-col gap-2">',
          "    {items.map((item) => (",
          '      <p key={item.id} className="text-sm">',
          "        {item.label}",
          "      </p>",
          "    ))}",
          "  </div>",
          "</ScrollArea>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Classes do wrapper externo. Use para definir altura/largura fixas.",
      table: { type: { summary: "string" } },
    },
    type: {
      control: "inline-radio",
      options: ["auto", "always", "scroll", "hover"],
      description: "Quando exibir a scrollbar.",
      table: {
        type: { summary: "'auto' | 'always' | 'scroll' | 'hover'" },
        defaultValue: { summary: "'hover'" },
      },
    },
    scrollHideDelay: {
      control: { type: "number", min: 0, step: 50 },
      description:
        "Delay (ms) para esconder a barra após interação (válido com `type='scroll'` ou `'hover'`).",
      table: { type: { summary: "number" }, defaultValue: { summary: "600" } },
    },
    dir: {
      control: "inline-radio",
      options: ["ltr", "rtl"],
      description: "Direção de leitura.",
      table: { type: { summary: "'ltr' | 'rtl'" } },
    },
  },
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[260px] rounded-md border p-4">
      <div className="flex flex-col gap-2">
        {Array.from({ length: 30 }, (_, i) => `item-${i + 1}`).map((id, i) => (
          <p key={id} className="text-sm">
            Item {i + 1} — linha de exemplo para rolagem.
          </p>
        ))}
      </div>
    </ScrollArea>
  ),
}
