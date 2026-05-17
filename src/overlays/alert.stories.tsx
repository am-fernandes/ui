import type { Meta, StoryObj } from "@storybook/react-vite"
import { Alert, AlertDescription, AlertTitle } from "./alert"

const meta = {
  title: "Overlays/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className="max-w-md">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>This is a default alert.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>Destructive</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    </div>
  ),
}
