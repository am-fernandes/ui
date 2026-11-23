import type { Meta, StoryObj } from "@storybook/react-vite"
import { CrownIcon, UserIcon } from "lucide-react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS } from "@/lib/url"
import { Avatar } from "./avatar"

// A 100×200 portrait in three bands (green, blue, red), so a squashed or a
// cropped photo is told apart at a glance and in tests/e2e/primitives.spec.ts.
const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="200"><rect width="100" height="50" fill="#16a34a"/><rect y="50" width="100" height="100" fill="#2563eb"/><rect y="150" width="100" height="50" fill="#dc2626"/></svg>',
)}`

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

export const WithStatusDot: Story = {
  render: () => (
    <div className="relative inline-block">
      <Avatar
        src="https://github.com/shadcn.png"
        alt="Online user"
        fallback={<UserIcon className="size-5" />}
      />
      <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-success" />
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

export const PortraitPhoto: Story = {
  render: () => (
    <Avatar
      src={PORTRAIT}
      alt="Foto em retrato"
      fallback="FR"
      allowedProtocols={[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Uma foto que não é quadrada (100×200) é recortada no centro, sem deformar (`object-cover`). Para aceitar `data:` além de http e https, some à lista padrão: `[...DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, "data:"]`.',
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
