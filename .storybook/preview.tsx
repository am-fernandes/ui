import { withThemeByClassName } from "@storybook/addon-themes"
import type { Preview } from "@storybook/react-vite"

import "../src/styles/fonts.css"
import "../src/styles/tokens.css"

const preview: Preview = {
  parameters: {
    backgrounds: { default: "background" },
    options: {
      storySort: {
        order: [
          "Getting Started",
          "Foundations",
          ["Colors", "Typography", "Spacing", "Radius", "Iconography"],
        ],
      },
    },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "" },
      defaultTheme: "light",
    }),
    (Story) => (
      <div className="font-sans text-foreground bg-background p-6">
        <Story />
      </div>
    ),
  ],
}

export default preview
