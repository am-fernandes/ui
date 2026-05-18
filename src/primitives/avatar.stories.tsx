import type { Meta, StoryObj } from "@storybook/react-vite"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Avatar circular para representar usuário ou entidade. Use `AvatarImage` + `AvatarFallback`; o fallback aparece quando a imagem falha ou enquanto carrega.",
          "",
          "**Props principais:**",
          "- `AvatarImage` recebe `src` e `alt` como em qualquer `<img>`.",
          "- `AvatarFallback` mostra iniciais/ícone caso a imagem não carregue.",
          "- `className` permite ajustar tamanho (`h-12 w-12`) ou bordas.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    className: {
      control: "text",
      description: "Classes Tailwind extras para o root (ex.: `h-12 w-12` para mudar o tamanho).",
      table: { type: { summary: "string" } },
    },
    children: {
      control: false,
      description: "Conteúdo do avatar — normalmente `AvatarImage` + `AvatarFallback`.",
      table: { type: { summary: "ReactNode" } },
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

type PlaygroundArgs = {
  src: string
  alt: string
  fallback: string
  className?: string
}

export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    src: "https://github.com/shadcn.png",
    alt: "@shadcn",
    fallback: "SC",
    className: "",
  },
  argTypes: {
    src: {
      control: "text",
      description: "URL da imagem renderizada por `AvatarImage`.",
      table: { type: { summary: "string" } },
    },
    alt: {
      control: "text",
      description: "Texto alternativo da imagem.",
      table: { type: { summary: "string" } },
    },
    fallback: {
      control: "text",
      description: "Conteúdo do `AvatarFallback` (iniciais ou ícone).",
      table: { type: { summary: "string" } },
    },
    className: {
      control: "text",
      description: "Classes extras para o root.",
      table: { type: { summary: "string" } },
    },
  },
  render: (args) => (
    <Avatar className={args.className}>
      <AvatarImage src={args.src} alt={args.alt} />
      <AvatarFallback>{args.fallback}</AvatarFallback>
    </Avatar>
  ),
}

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>SC</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="" alt="" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
}
