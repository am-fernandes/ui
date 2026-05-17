import { defineMain } from "@storybook/react-vite/node"

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../src/docs/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-themes"],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: "react-docgen-typescript" },
})
