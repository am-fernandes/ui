import type { Meta, StoryObj } from "@storybook/react-vite"
import { CrownIcon, UserIcon } from "lucide-react"

import { Avatar } from "./avatar"

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Avatar redondo com imagem ou fallback (iniciais/ícone).",
          "",
          "**API:**",
          "- `src` — URL da imagem. Quando ausente ou inválida, renderiza `fallback`.",
          "- `alt` — obrigatório para a11y.",
          "- `fallback` — `string` (iniciais) ou `ReactNode` (ícone, qualquer JSX).",
          "- `className` — `size-*` para mudar tamanho, `rounded-*` para mudar formato.",
          "",
          "**Exemplo:**",
          "```tsx",
          'import { Avatar } from "@amfernandesinc/ui"',
          "",
          '<Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN" />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    src: { control: "text", description: "URL da imagem do avatar." },
    alt: { control: "text", description: "Texto alternativo (obrigatório)." },
    fallback: { control: "text", description: "Conteúdo exibido quando src ausente/erro." },
    className: { control: "text", description: "Classes Tailwind." },
  },
}
export default meta
type Story = StoryObj<typeof Avatar>

export const Default: Story = {
  args: { src: "https://github.com/shadcn.png", alt: "@shadcn", fallback: "CN" },
}

export const Fallback: Story = {
  args: { alt: "John Doe", fallback: "JD" },
}

export const FallbackIcon: Story = {
  args: { alt: "Anônimo", fallback: <UserIcon className="size-5" /> },
}

export const InvalidSrc: Story = {
  args: { src: "https://invalid.example/missing.png", alt: "Quebrado", fallback: "??" },
  parameters: {
    docs: {
      description: { story: "Quando o `src` falha, Radix mostra o `fallback` automaticamente." },
    },
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar alt="XS" fallback="XS" className="size-6 text-xs" />
      <Avatar alt="SM" fallback="SM" className="size-8 text-sm" />
      <Avatar alt="MD" fallback="MD" />
      <Avatar alt="LG" fallback="LG" className="size-14 text-lg" />
      <Avatar alt="XL" fallback="XL" className="size-20 text-2xl" />
    </div>
  ),
}

export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar alt="Round" fallback="R" />
      <Avatar alt="Square" fallback="S" className="rounded-md" />
      <Avatar alt="None" fallback="N" className="rounded-none" />
    </div>
  ),
}

export const WithStatusDot: Story = {
  render: () => (
    <div className="relative inline-block">
      <Avatar
        src="https://github.com/shadcn.png"
        alt="Online user"
        fallback={<UserIcon className="size-5" />}
      />
      <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-status-success-text" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pattern para indicar status online: envolver o `Avatar` em `relative` e posicionar um `span` absoluto.",
      },
    },
  },
}

export const IconFallbacks: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar alt="User" fallback={<UserIcon className="size-5" />} />
      <Avatar alt="Premium" fallback={<CrownIcon className="size-5 text-amber-500" />} />
    </div>
  ),
}
