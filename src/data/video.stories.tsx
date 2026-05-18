import type { Meta, StoryObj } from "@storybook/react-vite"

import { Video } from "./video"

const meta = {
  title: "Data/Video",
  component: Video,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Video>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
const POSTER = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"

export const Default: Story = {
  args: { src: SAMPLE, "aria-label": "Vídeo de exemplo Big Buck Bunny" },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
}

export const WithPoster: Story = {
  args: {
    src: SAMPLE,
    "aria-label": "Vídeo de exemplo com poster",
    poster: POSTER,
  },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
}

export const AutoPlayMuted: Story = {
  args: {
    src: SAMPLE,
    "aria-label": "Vídeo com reprodução automática silenciada",
    autoPlay: true,
    loop: true,
    playsInline: true,
  },
  render: (args) => (
    <div className="w-[560px]">
      <Video {...args} />
    </div>
  ),
}
