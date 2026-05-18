import type { Meta, StoryObj } from "@storybook/react-vite"

import { Image } from "./image"

const meta = {
  title: "Data/Image",
  component: Image,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Image>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
const AVATAR = "https://github.com/shadcn.png"
const BROKEN = "https://example.com/does-not-exist.png"

export const Default: Story = {
  args: { src: SAMPLE, alt: "Workspace com laptop e caderno" },
  render: (args) => (
    <div className="w-[320px]">
      <Image {...args} />
    </div>
  ),
}

export const WithAspectRatio: Story = {
  args: { src: SAMPLE, alt: "Workspace com laptop e caderno", aspectRatio: 16 / 9 },
  render: (args) => (
    <div className="w-[480px]">
      <Image {...args} />
    </div>
  ),
}

export const Rounded: Story = {
  args: { src: AVATAR, alt: "Avatar do usuário", rounded: "full" },
  render: () => (
    <div className="flex items-center gap-4">
      <Image src={AVATAR} alt="Avatar do usuário" rounded="full" className="size-20" />
      <div className="w-[200px]">
        <Image src={SAMPLE} alt="Workspace" aspectRatio={1} rounded="lg" />
      </div>
    </div>
  ),
}

export const Skeleton: Story = {
  args: {
    src: SAMPLE,
    alt: "Workspace com laptop e caderno",
    aspectRatio: 4 / 3,
    placeholder: "skeleton",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Image {...args} />
    </div>
  ),
}

export const Blur: Story = {
  args: {
    src: SAMPLE,
    alt: "Workspace com laptop e caderno",
    aspectRatio: 4 / 3,
    placeholder: "blur",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Image {...args} />
    </div>
  ),
}

export const ErrorState: Story = {
  args: { src: BROKEN, alt: "Imagem inválida", aspectRatio: 4 / 3 },
  render: (args) => (
    <div className="w-[400px]">
      <Image {...args} />
    </div>
  ),
}
