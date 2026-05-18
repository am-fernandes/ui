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
        component:
          "Tree recursiva controlled/uncontrolled. Suporta single-select, ícones por nó e expansão lazy.",
      },
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
