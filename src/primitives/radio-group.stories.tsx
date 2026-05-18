import type { Meta, StoryObj } from "@storybook/react-vite"
import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"

const meta = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Grupo de radios para escolha única. Use `RadioGroup` como wrapper e `RadioGroupItem` para cada opção.",
          "",
          "**Props principais:**",
          "- `value` / `onValueChange` — modo controlado.",
          "- `defaultValue` — valor inicial em modo não-controlado.",
          "- `orientation` — `'vertical'` (default, grid) ou `'horizontal'` (flex).",
          "- `disabled` — desabilita todos os items do grupo.",
          "- `name` — atributo `name` propagado para os inputs internos.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["vertical", "horizontal"],
      description: "Direção dos items.",
      table: {
        type: { summary: "'vertical' | 'horizontal'" },
        defaultValue: { summary: "'vertical'" },
      },
    },
    defaultValue: {
      control: "text",
      description: "Valor inicial selecionado (modo não-controlado).",
      table: { type: { summary: "string" } },
    },
    value: {
      control: "text",
      description: "Valor selecionado (modo controlado).",
      table: { type: { summary: "string" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita todos os items.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    name: {
      control: "text",
      description: "Atributo `name` para integração com forms nativos.",
      table: { type: { summary: "string" } },
    },
    className: {
      control: "text",
      description: "Classes Tailwind extras.",
      table: { type: { summary: "string" } },
    },
    onValueChange: {
      control: false,
      description: "Disparado quando o valor selecionado muda.",
      table: { category: "Eventos", type: { summary: "(value: string) => void" } },
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte"]

export const Playground: Story = {
  args: {
    orientation: "vertical",
    defaultValue: "São Paulo",
    disabled: false,
  },
  render: (args) => (
    <RadioGroup {...args}>
      {cities.map((city) => (
        <div key={city} className="flex items-center gap-2">
          <RadioGroupItem value={city} id={`pg-${city}`} />
          <Label htmlFor={`pg-${city}`}>{city}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="São Paulo">
      {cities.map((city) => (
        <div key={city} className="flex items-center gap-2">
          <RadioGroupItem value={city} id={city} />
          <Label htmlFor={city}>{city}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>Cidade</Label>
      <RadioGroup defaultValue="São Paulo">
        {cities.map((city) => (
          <div key={city} className="flex items-center gap-2">
            <RadioGroupItem value={city} id={`labeled-${city}`} />
            <Label htmlFor={`labeled-${city}`}>{city}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>Cidade</Label>
      <RadioGroup defaultValue="São Paulo" orientation="horizontal">
        {cities.map((city) => (
          <div key={city} className="flex items-center gap-2">
            <RadioGroupItem value={city} id={`horizontal-${city}`} />
            <Label htmlFor={`horizontal-${city}`}>{city}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="São Paulo" disabled>
      {cities.map((city) => (
        <div key={city} className="flex items-center gap-2">
          <RadioGroupItem value={city} id={`disabled-${city}`} />
          <Label htmlFor={`disabled-${city}`}>{city}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
}
