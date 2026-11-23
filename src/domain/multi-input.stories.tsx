import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { Toaster, toast } from "../overlays/sonner"
import { Button } from "../primitives/button"
import { MultiInput, type MultiInputProps } from "./multi-input"

const meta = {
  title: "Domain/MultiInput",
  component: MultiInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Input de múltiplos tokens (chips/tags) com modo `string` (texto livre) ou `number` (inteiros positivos). Cada token vira um `Badge` removível.",
          "",
          "**Como inserir tokens:**",
          "- Digite + `Enter`.",
          "- Cole texto separado por vírgula, ponto-e-vírgula ou nova linha.",
          "- `Backspace` em campo vazio remove o último token.",
          "- Blur com texto pendente commita o conteúdo.",
          "",
          "**Variantes via prop `type`:**",
          "- `type='string'` (default) — preserva ordem de inserção, dedupe automático.",
          "- `type='number'` — só aceita inteiros positivos, ordenados crescente. Cada pedaço precisa ser um inteiro por inteiro: `10.000`, `3,5` e `12x` são recusados com `onReject('invalid')`, nunca lidos pela metade. Separe por espaço, ponto-e-vírgula, barra ou vírgula; uma vírgula sozinha entre dois números (`3,5`) é lida como decimal.",
          "",
          "**Props principais:**",
          "- `value` / `onValueChange` — par controlado (`string[]` ou `number[]` conforme `type`).",
          "- `prefix` / `suffix` — strings concatenadas ao redor do valor dentro do Badge (ex.: `R$`, ` dias`).",
          "- `maxItems` — teto de tokens. Os itens que já estão na lista ficam; os novos entram enquanto há espaço e os demais são recusados com `onReject('max-items')`.",
          "- `onReject` — chamado com `'max-items'` ou `'invalid'` (number-mode com token não numérico).",
          "- `size` — `'sm'`, `'md'` (padrão) ou `'lg'`: altura mínima de 32, 40 ou 44px, a mesma dos outros controles.",
          "- `label`, `description`, `error`, `required`, `labelPosition`, `placeholder`, `disabled`, `id` — padrão do `FieldShell`.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { MultiInput } from "@amfernandesinc/ui"',
          'import { useState } from "react"',
          "",
          "const [tags, setTags] = useState<string[]>([])",
          "",
          "<MultiInput",
          '  label="Tags"',
          "  value={tags}",
          "  onValueChange={setTags}",
          '  placeholder="Adicione e pressione Enter"',
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["string", "number"],
      table: {
        type: { summary: "'string' | 'number'" },
        defaultValue: { summary: "'string'" },
      },
    },
    placeholder: { control: "text", table: { type: { summary: "string" } } },
    prefix: { control: "text", table: { type: { summary: "string" } } },
    suffix: { control: "text", table: { type: { summary: "string" } } },
    maxItems: { control: "number", table: { type: { summary: "number" } } },
    error: { control: "text", table: { type: { summary: "string" } } },
    required: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    label: { control: "text", table: { type: { summary: "ReactNode" } } },
    description: { control: "text", table: { type: { summary: "ReactNode" } } },
    labelPosition: {
      control: "inline-radio",
      options: ["up", "left", "hidden"],
      table: {
        type: { summary: "'up' | 'left' | 'hidden'" },
        defaultValue: { summary: "'up'" },
      },
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
    onReject: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof MultiInput>

export default meta
type Story = StoryObj<typeof MultiInput>

export const StringTags: Story = {
  args: {
    label: "Tags do processo",
    description: "Digite e pressione Enter. Vírgulas/quebras de linha também separam.",
    placeholder: "Ex.: urgente, fiscal",
  },
  render: (args) => {
    const [value, setValue] = useState<string[]>(["urgente", "fiscal"])
    return (
      <div className="w-[420px]">
        <MultiInput
          {...(args as MultiInputProps)}
          type="string"
          value={value}
          onValueChange={setValue}
        />
      </div>
    )
  },
}

export const NumberList: Story = {
  args: {
    type: "number",
    label: "Páginas relevantes",
    description: "Apenas inteiros positivos, separados por espaço ou vírgula. A lista é ordenada.",
    placeholder: "Ex.: 10, 22, 35",
  },
  render: (args) => {
    const [value, setValue] = useState<number[]>([35, 10, 22])
    return (
      <div className="w-[420px]">
        <MultiInput {...args} type="number" value={value} onValueChange={setValue} />
        <p className="mt-2 text-xs text-muted-foreground">Array: [{value.join(", ")}]</p>
      </div>
    )
  },
}

export const WithPrefixSuffix: Story = {
  render: () => {
    const [tags, setTags] = useState<string[]>(["urgente", "vip"])
    const [prazos, setPrazos] = useState<number[]>([30, 60, 90])
    return (
      <div className="flex w-[420px] flex-col gap-4">
        <MultiInput
          label="Hashtags"
          prefix="#"
          value={tags}
          onValueChange={setTags}
          placeholder="Adicione uma tag"
        />
        <MultiInput
          type="number"
          label="Prazos"
          suffix=" dias"
          value={prazos}
          onValueChange={setPrazos}
          placeholder="Em dias"
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`prefix` e `suffix` decoram cada Badge sem afetar o `value` armazenado — útil para `R$`, `#`, ` %`, ` dias` etc.",
      },
    },
  },
}

export const MaxItems3: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["um", "dois"])
    return (
      <div className="w-[420px]">
        <Toaster position="top-right" />
        <MultiInput
          label="Top 3 prioridades"
          description="Limite de 3 itens. Excedentes são recusados."
          maxItems={3}
          value={value}
          onValueChange={setValue}
          onReject={(reason) => {
            if (reason === "max-items") {
              toast.warning("Limite de 3 itens atingido.")
            }
          }}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Com a lista cheia, o item novo é recusado, os antigos ficam e o texto continua no campo. `onReject('max-items')` avisa: combine com `toast` para dar o motivo.",
      },
    },
  },
}

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([])
    const error = value.length === 0 ? "Adicione ao menos um responsável." : undefined
    return (
      <div className="w-[420px]">
        <MultiInput
          label="Responsáveis"
          required
          value={value}
          onValueChange={setValue}
          error={error}
          placeholder="E-mail dos responsáveis"
        />
      </div>
    )
  },
}

export const Disabled: Story = {
  args: {
    label: "Áreas de atuação",
    disabled: true,
    placeholder: "Indisponível",
  },
  render: (args) => (
    <div className="w-[420px]">
      <MultiInput
        {...(args as MultiInputProps)}
        type="string"
        value={["civil", "trabalhista", "tributário"]}
        onValueChange={() => {}}
      />
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([])
    return (
      <div className="flex w-[420px] flex-col gap-3">
        <MultiInput
          label="Convidados"
          value={value}
          onValueChange={setValue}
          placeholder="email@exemplo.com"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setValue([...value, `user-${value.length + 1}@example.com`])}
          >
            Adicionar exemplo
          </Button>
          <Button variant="outline" onClick={() => setValue([])}>
            Limpar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Total: {value.length}</p>
      </div>
    )
  },
}

export const PasteCSV: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([])
    return (
      <div className="flex w-[420px] flex-col gap-2">
        <MultiInput
          label="Cole uma lista CSV"
          description='Tente colar "a,b,c" ou "a; b; c" — vira 3 tokens.'
          value={value}
          onValueChange={setValue}
          placeholder="Cole valores separados por vírgula"
        />
        <p className="text-xs text-muted-foreground">{value.length} token(s) inseridos.</p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Ao colar texto contendo `\\n`, `,` ou `;`, o componente quebra automaticamente em múltiplos tokens.",
      },
    },
  },
}

export const DedupExample: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["fiscal"])
    return (
      <div className="w-[420px]">
        <MultiInput
          label="Tags (sem duplicatas)"
          description='Tente digitar "fiscal" novamente — é ignorado.'
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
          "Tokens duplicados são silenciosamente descartados — o componente usa um `Set` para garantir unicidade.",
      },
    },
  },
}

export const Sizes: Story = {
  render: () => {
    const [sm, setSm] = useState<string[]>(["urgente"])
    const [md, setMd] = useState<string[]>(["urgente"])
    const [lg, setLg] = useState<string[]>(["urgente"])
    return (
      <div className="flex w-80 flex-col gap-4">
        <MultiInput label="Tags (sm)" size="sm" value={sm} onValueChange={setSm} />
        <MultiInput label="Tags (md)" size="md" value={md} onValueChange={setMd} />
        <MultiInput label="Tags (lg)" size="lg" value={lg} onValueChange={setLg} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`size` dá a altura mínima da caixa, borda incluída: 32, 40 e 44px, a mesma de um `Button` ou campo do mesmo tamanho. Com mais itens do que cabem numa linha, a caixa cresce.",
      },
    },
  },
}
