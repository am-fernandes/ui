import type { Preview } from "@storybook/react-vite"

import "../src/styles/fonts.css"
import "../src/styles/tokens.css"

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Getting Started",
          "Quality",
          "Hooks",
          "Foundations",
          ["Colors", "Typography", "Iconography", "Spacing"],
          "Primitives",
          "Overlays",
          "Navigation",
          "Forms",
          "Domain",
          "Data",
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="font-sans text-foreground bg-background p-6">
        <Story />
      </div>
    ),
  ],
}

export default preview
