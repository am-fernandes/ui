import type { Meta, StoryObj } from "@storybook/react-vite"
import { ScrollArea } from "./scroll-area"

const meta = {
  title: "Data/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Container com scroll customizado e barras estilizadas. Use para listas longas em alturas fixas.",
      },
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
