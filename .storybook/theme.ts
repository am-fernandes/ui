import { create } from "storybook/theming"

// The Storybook chrome wears the group palette (light theme): Grafite for the
// neutrals, marinho-950 for text and the functional blue for what is selected.
export default create({
  base: "light",
  brandTitle: "AM Fernandes UI",
  brandTarget: "_self",
  colorPrimary: "#031120",
  colorSecondary: "#346b9e",
  appBg: "#f8fafb",
  appContentBg: "#ffffff",
  appPreviewBg: "#f8fafb",
  appBorderColor: "#d2d4d7",
  appBorderRadius: 8,
  fontBase: '"Geist", ui-sans-serif, system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", monospace',
  textColor: "#031120",
  textInverseColor: "#ffffff",
  textMutedColor: "#565c61",
  barTextColor: "#565c61",
  barSelectedColor: "#346b9e",
  barHoverColor: "#346b9e",
  barBg: "#ffffff",
  inputBg: "#ffffff",
  inputBorder: "#848a90",
  inputTextColor: "#031120",
  inputBorderRadius: 8,
})
