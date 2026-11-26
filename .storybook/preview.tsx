import { withThemeByClassName } from "@storybook/addon-themes"
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
          ["Colors", "Color Vision", "Typography", "Iconography", "Spacing", "Radius", "Tokens"],
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
    // Toolbar switch: puts `dark` on <html>, the same way an app turns it on.
    withThemeByClassName({
      themes: { Claro: "", Escuro: "dark" },
      defaultTheme: "Claro",
    }),
    (Story) => (
      <div className="font-sans text-foreground bg-background p-6">
        <Story />
      </div>
    ),
  ],
}

export default preview
