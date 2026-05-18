import type { Meta, StoryObj } from "@storybook/react-vite"

import { Typography } from "./typography"

const meta = {
  title: "Primitives/Typography",
  component: Typography,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

const COPY = "AM Fernandes Incorporadora."

export const AllVariants: Story = {
  render: () => (
    <div className="flex w-[480px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">display</span>
        <Typography variant="display">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">title</span>
        <Typography variant="title">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">subtitle</span>
        <Typography variant="subtitle">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">body</span>
        <Typography variant="body">{COPY}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">caption</span>
        <Typography variant="caption">{COPY}</Typography>
      </div>
    </div>
  ),
}

export const Display: Story = {
  args: { variant: "display", children: COPY },
}

export const Title: Story = {
  args: { variant: "title", children: COPY },
}

export const Subtitle: Story = {
  args: { variant: "subtitle", children: COPY },
}

export const Body: Story = {
  args: { variant: "body", children: COPY },
}

export const Caption: Story = {
  args: { variant: "caption", children: COPY },
}
