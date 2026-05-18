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
        component:
          "Avatar circular para representar usuário ou entidade. Use `AvatarImage` + `AvatarFallback`; o fallback aparece quando a imagem falha ou enquanto carrega.",
      },
    },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

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
