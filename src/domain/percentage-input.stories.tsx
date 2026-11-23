import type { Meta, StoryObj } from "@storybook/react-vite"
import * as React from "react"
import { PercentageInput } from "./percentage-input"

const meta = {
  title: "Domain/PercentageInput",
  component: PercentageInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input para **percentuais**. Display em pt-BR com sufixo `%` (ex.: `33,33`) enquanto o valor é um **número decimal** (0–100 tipicamente), ex.: `33.33`.",
          "",
          "**Digitação e colagem.** Os dígitos digitados preenchem os centésimos primeiro (`1`, `2`, `5`, `0` mostra `0,01`, `0,12`, `1,25`, `12,50`). Um texto colado é lido como um número escrito por um brasileiro e substitui o valor: `12,5`, `12.5` e `12,50%` são 12,50.",
          "",
          "**Props principais:**",
          "- `value` — percentual (float), controlado. Internamente é convertido para centésimos inteiros para evitar erros de ponto flutuante.",
          "- `defaultValue` — valor inicial quando o campo não é controlado: sem `value`, ele guarda o próprio valor.",
          "- `onValueChange` — callback `(value: number) => void` disparado a cada edição com o novo decimal.",
          '- `emptyValue` — o que vale um campo vazio. `"zero"` (padrão): o campo sempre tem um número e limpar volta a `0,00`. `"null"`: o campo pode ficar vazio, `value` aceita `null`, `onValueChange` passa a receber `number | null`, o placeholder aparece e o `required` nativo funciona.',
          "- `max` — teto do percentual (padrão 100). A tecla (ou a colagem) que passaria dele é recusada: o campo fica com o que tinha.",
          "- `min` — piso do percentual, aplicado quando o campo perde o foco. Com `min` negativo o campo aceita percentual negativo.",
          "- `decimals` — casas decimais: `2` (padrão, `12,50`), `1` (`12,5`) ou `0` (`12`).",
          "- `label` — rótulo renderizado pelo próprio componente via `FieldShell`. Prefira esta prop em vez de um `<Label>` externo.",
          "- `name` — nome no formulário nativo. O form recebe o número (`12.5`), por um input oculto.",
          "- `size` — altura do campo: `sm` (32px), `md` (40px, padrão) ou `lg` (44px).",
          "- `readOnly` — somente leitura: o valor fica legível, recebe foco e é enviado, mas não é editável.",
          "- `disabled` — desabilita a edição.",
          "- Demais props do `<input>` nativo (exceto `value`, `onChange`, `type`) são repassadas (`id`, `aria-*`, `className`).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { PercentageInput } from "@amfernandesinc/ui"',
          "",
          "const [value, setValue] = useState(0)",
          "",
          "<PercentageInput",
          '  id="commission"',
          '  label="Comissão (%)"',
          "  value={value}",
          "  onValueChange={setValue}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    value: {
      control: "number",
      description: "Valor percentual atual como decimal (ex.: `33.33`). Display exibe `33,33 %`.",
      table: { type: { summary: "number" } },
    },
    label: {
      control: "text",
      description:
        "Rótulo renderizado pelo próprio componente via `FieldShell`. Use em vez de `<Label>` externo.",
      table: { type: { summary: "ReactNode" } },
    },
    onValueChange: {
      control: false,
      description: "Callback disparado a cada edição com o novo decimal.",
      table: {
        type: { summary: "(value: number) => void" },
        category: "Eventos",
      },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    placeholder: {
      control: "text",
      description: "Placeholder repassado ao `<input>` nativo.",
      table: { type: { summary: "string" } },
    },
  },
} satisfies Meta<typeof PercentageInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
    disabled: false,
    placeholder: "",
  },
  // `emptyValue` e `defaultValue` ficam de fora: esta story é a do campo
  // controlado que sempre tem um número.
  render: ({ value: initial, onValueChange, emptyValue, defaultValue, ...args }) => {
    const [value, setValue] = React.useState<number>(initial ?? 0)
    React.useEffect(() => {
      setValue(initial ?? 0)
    }, [initial])
    return (
      <div className="flex flex-col gap-2 w-80">
        <PercentageInput
          {...args}
          id="commission"
          label="Comissão (%)"
          value={value}
          onValueChange={(next) => {
            setValue(next)
            onValueChange?.(next)
          }}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {value}</p>
      </div>
    )
  },
}

export const Default: Story = {
  args: {
    value: 0,
    onValueChange: () => {},
  },
  render: () => {
    const [value, setValue] = React.useState<number>(0)
    return (
      <div className="w-80">
        <PercentageInput
          id="commission"
          label="Comissão (%)"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const ReadOnly: Story = {
  args: { value: 12.5, onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState<number>(12.5)
    return (
      <div className="flex w-80 flex-col gap-4">
        <PercentageInput
          id="taxa-editable"
          label="Comissão (editável)"
          value={value}
          onValueChange={setValue}
        />
        <PercentageInput
          id="taxa-readonly"
          label="Comissão (somente leitura)"
          value={value}
          onValueChange={setValue}
          readOnly
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`readOnly` é o estado de tela de consulta: fundo esmaecido, sem reação ao hover, com o valor legível, focável e enviado no formulário. `disabled` (50% de opacidade, fora do Tab e do envio) é para o campo que não se aplica.",
      },
    },
  },
}

export const Sizes: Story = {
  args: { value: 12.5, onValueChange: () => {} },
  render: () => {
    const [value, setValue] = React.useState<number>(12.5)
    return (
      <div className="flex w-80 flex-col gap-4">
        <PercentageInput
          id="taxa-sm"
          label="Taxa (sm)"
          size="sm"
          value={value}
          onValueChange={setValue}
        />
        <PercentageInput
          id="taxa-md"
          label="Taxa (md)"
          size="md"
          value={value}
          onValueChange={setValue}
        />
        <PercentageInput
          id="taxa-lg"
          label="Taxa (lg)"
          size="lg"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`size` define a altura da caixa inteira, borda incluída: 32, 40 e 44px. É o mesmo token de `Button` e dos demais controles, então campo e botão do mesmo tamanho ficam alinhados numa linha.",
      },
    },
  },
}

export const Empty: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState<number | null>(null)
    return (
      <div className="flex w-80 flex-col gap-2">
        <PercentageInput
          id="discount"
          label="Desconto (%)"
          description="Deixe em branco se não houver desconto."
          emptyValue="null"
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {String(value)}</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Com `emptyValue="null"` o campo sabe ficar vazio: `null` é "não informado", diferente de zero. Limpar o campo reporta `null`, o placeholder aparece e o `required` nativo passa a acusar.',
      },
    },
  },
}

export const MinMax: Story = {
  args: {},
  render: () => {
    const [value, setValue] = React.useState<number>(0)
    return (
      <div className="flex w-80 flex-col gap-2">
        <PercentageInput
          id="down-payment"
          label="Entrada (%)"
          description="Entre 10% e 50% do valor do imóvel."
          min={10}
          max={50}
          value={value}
          onValueChange={setValue}
        />
        <p className="text-xs text-muted-foreground">Valor interno: {value}</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`max` é um teto: a tecla que passaria dele é recusada e o campo fica com o que tinha, sem trocar o número digitado por outro. `min` vale quando o campo perde o foco, porque durante a digitação o valor passa por números menores no caminho.",
      },
    },
  },
}

export const Decimals: Story = {
  args: {},
  render: () => {
    const [two, setTwo] = React.useState<number>(12.5)
    const [one, setOne] = React.useState<number>(12.5)
    const [none, setNone] = React.useState<number>(12)
    return (
      <div className="flex w-80 flex-col gap-4">
        <PercentageInput id="rate-2" label="Duas casas" value={two} onValueChange={setTwo} />
        <PercentageInput
          id="rate-1"
          label="Uma casa"
          decimals={1}
          value={one}
          onValueChange={setOne}
        />
        <PercentageInput
          id="rate-0"
          label="Sem casas"
          decimals={0}
          value={none}
          onValueChange={setNone}
        />
        <p className="text-xs text-muted-foreground">
          Valores internos: {two} / {one} / {none}
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`decimals` define quantas casas o campo mostra e guarda. Os dígitos digitados preenchem a última casa primeiro: com uma casa, `1`, `2`, `5` mostra `0,1`, `1,2`, `12,5`.",
      },
    },
  },
}
