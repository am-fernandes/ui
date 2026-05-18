import path from "node:path"
import { fileURLToPath } from "node:url"

import { defineMain } from "@storybook/react-vite/node"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import remarkGfm from "remark-gfm"
import { mergeConfig } from "vite"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

export default defineMain({
  framework: "@storybook/react-vite",
  stories: ["../src/docs/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
  ],
  docs: { autodocs: "tag" },
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: async (config) =>
    mergeConfig(config, {
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          "@": path.resolve(projectRoot, "../src"),
        },
      },
    }),
})
