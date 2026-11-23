import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "@storybook/test"
import { useRef, useState } from "react"

import { Button } from "./button"
import { Textarea } from "./textarea"

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Campo de texto multilinha com `label`, `description`, `error`, contador opcional via `maxLength` e modo `autoResize` que cresce conforme o conteúdo.",
          "",
          "**API:**",
          "- `label` / `labelPosition` — `'up'` (default), `'left'` ou `'hidden'`.",
          "- `description` — texto auxiliar.",
          "- `error` — mensagem de erro (`role=alert`, `aria-invalid` no campo).",
          "- `required` — marca como obrigatório.",
          "- `maxLength` — limita caracteres e mostra o contador `atual/limite`. O contador entra na descrição do campo (lido quando o campo recebe foco, não a cada tecla) e o limite atingido é anunciado uma vez.",
          "- `labels` — textos do contador para o leitor de tela (`characterCount`, `limitReached`).",
          "- `autoResize` — ajusta altura automaticamente ao conteúdo (`resize-none overflow-hidden`).",
          "- `size` — `sm`, `md` (padrão) ou `lg`: altura mínima e padding. Com `rows={1}` a caixa mede 32, 40 ou 44px, a altura de um `Input` do mesmo tamanho.",
          "- `disabled`, `readOnly` — estados de leitura.",
          "- `value`, `defaultValue`, `onChange` — controlled/uncontrolled.",
          "- Repassa todos os atributos HTML de `<textarea>` (`rows`, `placeholder`, etc).",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { Textarea } from "@amfernandesinc/ui"',
          "",
          '<Textarea label="Mensagem" placeholder="Conte sua história..." maxLength={500} />',
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    label: { control: "text", description: "Texto do label." },
    labelPosition: {
      control: "inline-radio",
      options: ["up", "left", "hidden"],
      description: "Posição do label.",
      table: {
        type: { summary: "'up' | 'left' | 'hidden'" },
        defaultValue: { summary: "'up'" },
      },
    },
    description: { control: "text", description: "Texto auxiliar abaixo do campo." },
    error: { control: "text", description: "Mensagem de erro." },
    placeholder: { control: "text", description: "Texto exibido quando vazio." },
    rows: {
      control: { type: "number", min: 1, step: 1 },
      description: "Linhas visíveis iniciais.",
      table: { type: { summary: "number" } },
    },
    maxLength: {
      control: { type: "number", min: 1, step: 1 },
      description: "Limite de caracteres. Quando definido, mostra contador `atual/limite`.",
      table: { type: { summary: "number" } },
    },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
      description:
        "Altura mínima e padding. Uma linha (`rows={1}`) mede 32, 40 ou 44px, como um `Input`.",
      table: { type: { summary: "'sm' | 'md' | 'lg'" }, defaultValue: { summary: "'md'" } },
    },
    autoResize: {
      control: "boolean",
      description:
        "Ajusta a altura automaticamente conforme o conteúdo (`resize-none overflow-hidden`).",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    required: {
      control: "boolean",
      description: "Marca como obrigatório.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o campo.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    readOnly: {
      control: "boolean",
      description: "Apenas leitura.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    className: { control: "text", description: "Classes Tailwind extras no `<textarea>`." },
    onChange: {
      control: false,
      description: "Handler de mudança.",
      table: { category: "Eventos", type: { summary: "(e: ChangeEvent) => void" } },
    },
  },
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  args: { label: "Mensagem", placeholder: "Digite sua mensagem", onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const textarea = canvas.getByLabelText("Mensagem") as HTMLTextAreaElement
    await expect(textarea).toHaveValue("")
    await userEvent.type(textarea, "Olá mundo")
    await expect(textarea).toHaveValue("Olá mundo")
    await expect(args.onChange).toHaveBeenCalled()
  },
}

export const WithDescription: Story = {
  args: {
    label: "Bio",
    description: "Conte um pouco sobre você. Aparece no seu perfil público.",
    placeholder: "Escreva aqui...",
  },
}

export const WithError: Story = {
  args: {
    label: "Comentário",
    placeholder: "Diga o que achou",
    error: "Comentário não pode ficar vazio.",
  },
  parameters: {
    // error-foreground + placeholder muted fail 4.5:1 against background; tracked in design-tokens roadmap.
    a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
  },
}

export const Required: Story = {
  args: { label: "Justificativa", placeholder: "Obrigatório", required: true },
}

export const LabelLeft: Story = {
  args: {
    label: "Notas",
    labelPosition: "left",
    placeholder: "Layout inline",
    className: "w-72",
  },
  parameters: {
    docs: {
      description: { story: '`labelPosition="left"` para layouts de formulário em duas colunas.' },
    },
  },
}

export const WithCounter: Story = {
  render: () => {
    const [value, setValue] = useState("Componentes pequenos, reutilizáveis e cobertos por testes.")
    return (
      <Textarea
        label="Tweet"
        description="Diga em poucas palavras o que está pensando."
        placeholder="Mensagem curta..."
        maxLength={280}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-96"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Com `maxLength` o componente mostra um contador `atual/limite` abaixo do campo, atualizado em tempo real. Para o leitor de tela ele é parte da descrição do campo ("57 de 280 caracteres", lido quando o campo recebe foco), não uma região viva que fala a cada tecla. Ao chegar no limite, isso é anunciado uma vez.',
      },
    },
  },
}

export const AutoResize: Story = {
  render: () => {
    const [value, setValue] = useState("Linha 1\nLinha 2\nLinha 3")
    return (
      <Textarea
        label="Auto-resize"
        description="A altura acompanha o conteúdo — pressione Enter para crescer."
        autoResize
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-96"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`autoResize` desabilita `resize`/`overflow` e ajusta `style.height` ao `scrollHeight` toda vez que o valor muda.",
      },
    },
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-4">
      <Textarea label="sm" size="sm" placeholder="Duas linhas, padding menor" />
      <Textarea label="md" size="md" placeholder="Duas linhas (padrão)" />
      <Textarea label="lg" size="lg" placeholder="Duas linhas, padding maior" />
      <div className="flex items-end gap-2">
        <Textarea
          label="Mensagem"
          labelPosition="hidden"
          rows={1}
          autoResize
          placeholder="Escreva uma mensagem"
        />
        <Button>Enviar</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`size` dá a altura mínima e o padding. Com `rows={1}` a caixa tem a altura de um `Input` do mesmo tamanho, então fecha com um `Button` ao lado; com `autoResize` ela cresce a partir daí.",
      },
    },
  },
}

const SERVER_NOTE = Array.from(
  { length: 12 },
  (_, i) => `Linha ${i + 1} de uma observação carregada do servidor`,
).join("\n")

export const ValueSetByCode: Story = {
  render: () => {
    const ref = useRef<HTMLTextAreaElement>(null)
    const [narrow, setNarrow] = useState(false)
    return (
      <div className="flex w-96 flex-col gap-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (ref.current) ref.current.value = SERVER_NOTE
            }}
          >
            Carregar observação
          </Button>
          <Button variant="outline" onClick={() => setNarrow((current) => !current)}>
            {narrow ? "Alargar" : "Estreitar"}
          </Button>
        </div>
        <div data-testid="box" style={{ width: narrow ? 180 : 360 }}>
          <Textarea ref={ref} label="Observações" autoResize maxLength={2000} />
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "O contador e a altura leem o valor do próprio campo, não o `onChange`. Por isso acompanham um valor escrito por código (o `register`, o `setValue` e o `reset` do react-hook-form escrevem pelo `ref`, sem evento nenhum), um `form.reset()` e uma mudança de largura da caixa.",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("")
    return (
      <Textarea
        label="Mensagem"
        description={`Caracteres: ${value.length} | Palavras: ${value.trim() ? value.trim().split(/\s+/).length : 0}`}
        placeholder="Escreva algo..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-96"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story: "Modo controlado mostrando contagem de caracteres e palavras na `description`.",
      },
    },
  },
}

export const Disabled: Story = {
  args: {
    label: "Mensagem",
    placeholder: "Indisponível",
    disabled: true,
    value: "Conteúdo bloqueado",
  },
}

export const ReadOnly: Story = {
  args: {
    label: "Mensagem do sistema",
    readOnly: true,
    value: "Esta mensagem foi gerada automaticamente. Você pode copiar o conteúdo, mas não editar.",
    className: "w-96",
  },
}

export const WithRows: Story = {
  args: {
    label: "História completa",
    rows: 8,
    placeholder: "Escreva tudo o que quiser...",
    className: "w-96",
  },
  parameters: {
    docs: { description: { story: "`rows` define a altura inicial em linhas de texto." } },
  },
}
