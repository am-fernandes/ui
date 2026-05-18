import type { Meta, StoryObj } from "@storybook/react-vite"
import { File, Folder, Settings } from "lucide-react"
import { useState } from "react"

import { Tree, type TreeNodeData } from "./tree"

const meta = {
  title: "Data/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          'Árvore hierárquica recursiva (`role="tree"` com `role="treeitem"`/`role="group"`). Suporta single-select, ícones por nó e modo controlled ou uncontrolled para expansão.',
          "",
          "**Props:**",
          "- `data: TreeNodeData[]` — nós raiz. Cada nó pode ter `children` (recursivo).",
          "- `defaultExpanded?: string[]` — ids inicialmente expandidos (uncontrolled).",
          "- `expanded?: Set<string>` — set controlado de ids expandidos. Quando passado, ativa modo controlled.",
          "- `onExpandedChange?: (next: Set<string>) => void` — callback do modo controlled.",
          "- `selected?: string` — id do nó selecionado (single-select).",
          "- `onSelectedChange?: (id: string) => void` — disparado ao clicar em um nó (folha ou pasta).",
          "",
          "**Shape do nó (`TreeNodeData`):**",
          "```ts",
          "interface TreeNodeData {",
          "  id: string                                            // único na árvore",
          "  label: React.ReactNode                                 // texto/JSX renderizado",
          "  icon?: React.ComponentType<{ className?: string }>     // ex.: ícones do lucide-react",
          "  children?: TreeNodeData[]                              // ausente => nó folha",
          "}",
          "```",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { Tree, type TreeNodeData } from "@am-fernandes/ui"',
          'import { File, Folder } from "lucide-react"',
          "",
          "const data: TreeNodeData[] = [",
          "  {",
          '    id: "src",',
          '    label: "src",',
          "    icon: Folder,",
          '    children: [{ id: "index.ts", label: "index.ts", icon: File }],',
          "  },",
          "]",
          "",
          '<Tree data={data} defaultExpanded={["src"]} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    data: {
      control: "object",
      description: "Árvore de nós. Estrutura recursiva (`children` aninhados).",
      table: { type: { summary: "TreeNodeData[]" } },
    },
    defaultExpanded: {
      control: "object",
      description: "Ids inicialmente expandidos (uncontrolled).",
      table: { type: { summary: "string[]" } },
    },
    expanded: {
      control: false,
      description: "Set controlado de ids expandidos. Use junto com `onExpandedChange`.",
      table: { type: { summary: "Set<string>" } },
    },
    selected: {
      control: "text",
      description: "Id do nó selecionado (single-select).",
      table: { type: { summary: "string" } },
    },
    onSelectedChange: {
      control: false,
      description: "Disparado ao clicar em um nó.",
      table: { type: { summary: "(id: string) => void" }, category: "Eventos" },
    },
    onExpandedChange: {
      control: false,
      description: "Disparado ao expandir/colapsar um nó (modo controlled).",
      table: { type: { summary: "(next: Set<string>) => void" }, category: "Eventos" },
    },
  },
} satisfies Meta<typeof Tree>

export default meta
type Story = StoryObj<typeof meta>

const fsTree: TreeNodeData[] = [
  {
    id: "src",
    label: "src",
    icon: Folder,
    children: [
      {
        id: "components",
        label: "components",
        icon: Folder,
        children: [
          { id: "button.tsx", label: "button.tsx", icon: File },
          { id: "input.tsx", label: "input.tsx", icon: File },
        ],
      },
      { id: "index.ts", label: "index.ts", icon: File },
    ],
  },
  {
    id: "config",
    label: "config",
    icon: Folder,
    children: [{ id: "tsconfig.json", label: "tsconfig.json", icon: Settings }],
  },
  { id: "readme", label: "README.md", icon: File },
]

export const Default: Story = {
  args: { data: fsTree, defaultExpanded: ["src", "components"] },
  render: (args) => (
    <div className="w-[320px] rounded-md border p-2">
      <Tree {...args} />
    </div>
  ),
}

export const Controlled: Story = {
  args: { data: fsTree },
  render: () => {
    const [expanded, setExpanded] = useState(new Set<string>(["src"]))
    const [selected, setSelected] = useState<string | undefined>("button.tsx")
    return (
      <div className="w-[320px] rounded-md border p-2">
        <Tree
          data={fsTree}
          expanded={expanded}
          onExpandedChange={setExpanded}
          selected={selected}
          onSelectedChange={setSelected}
        />
      </div>
    )
  },
}
