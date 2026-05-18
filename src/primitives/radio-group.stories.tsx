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
        component:
          "Grupo de radios para escolha única. Use `RadioGroup` como wrapper e `RadioGroupItem` para cada opção.",
      },
    },
  },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte"]

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
