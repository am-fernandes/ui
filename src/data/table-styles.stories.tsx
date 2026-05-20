import type { Meta, StoryObj } from "@storybook/react-vite"

import { tableStyles } from "./table-styles"

interface Item {
  item: string
  quantidade: number
  preco: number
}

const itens: Item[] = [
  { item: "Caderno universitário", quantidade: 3, preco: 24.9 },
  { item: "Caneta esferográfica azul", quantidade: 12, preco: 2.5 },
  { item: "Marca-texto amarelo", quantidade: 5, preco: 6.8 },
  { item: "Pasta arquivo A4", quantidade: 2, preco: 18.0 },
]

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

const meta = {
  title: "Data/Table",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Escape hatch leve para quando o `DataTable` é exagero — não existe um componente React `Table` exportado; o que a lib oferece é o helper `tableStyles()`, que devolve um objeto de classes Tailwind para você aplicar diretamente em uma `<table>` HTML.",
          "",
          "Use este padrão para tabelas estáticas, resumos curtos ou conteúdos sem interação. Quando precisar de ordenação, busca global ou paginação, vá direto para o `DataTable` — ele já encapsula `@tanstack/react-table` e a marcação acessível completa.",
          "",
          "**Slots disponíveis no retorno de `tableStyles()`:**",
          "- `table` — classes para a `<table>` raiz.",
          "- `header` — classes para o `<thead>`.",
          "- `body` — classes para o `<tbody>`.",
          "- `footer` — classes para o `<tfoot>`.",
          "- `row` — classes para cada `<tr>` (inclui `hover` e estado `selected`).",
          "- `head` — classes para cada `<th>`.",
          "- `cell` — classes para cada `<td>`.",
          "- `caption` — classes para o `<caption>`.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { tableStyles } from "@amfernandesinc/ui"',
          "",
          "const t = tableStyles()",
          "",
          "<table className={t.table}>",
          "  <thead className={t.header}>",
          "    <tr><th className={t.head}>Item</th></tr>",
          "  </thead>",
          "  <tbody className={t.body}>",
          "    <tr className={t.row}><td className={t.cell}>Caderno</td></tr>",
          "  </tbody>",
          "</table>",
          "```",
        ].join("\n"),
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => {
    const t = tableStyles()
    return (
      <div className="p-6 max-w-2xl">
        <table className={t.table}>
          <thead className={t.header}>
            <tr>
              <th className={t.head}>Item</th>
              <th className={t.head}>Quantidade</th>
              <th className={t.head}>Preço</th>
            </tr>
          </thead>
          <tbody className={t.body}>
            {itens.map((i) => (
              <tr key={i.item} className={t.row}>
                <td className={t.cell}>{i.item}</td>
                <td className={t.cell}>{i.quantidade}</td>
                <td className={t.cell}>{brl.format(i.preco)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tabela mínima usando o helper `tableStyles()` — cabeçalho, corpo e linhas com hover automático. Valores em BRL formatados via `Intl.NumberFormat`.",
      },
    },
  },
}

export const WithCaption: Story = {
  render: () => {
    const t = tableStyles()
    return (
      <div className="p-6 max-w-2xl">
        <table className={t.table}>
          <caption className={t.caption}>
            Materiais de escritório — pedido #2026-019, entrega prevista 27/05/2026.
          </caption>
          <thead className={t.header}>
            <tr>
              <th className={t.head}>Item</th>
              <th className={t.head}>Quantidade</th>
              <th className={t.head}>Preço</th>
            </tr>
          </thead>
          <tbody className={t.body}>
            {itens.map((i) => (
              <tr key={i.item} className={t.row}>
                <td className={t.cell}>{i.item}</td>
                <td className={t.cell}>{i.quantidade}</td>
                <td className={t.cell}>{brl.format(i.preco)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Usa `<caption className={t.caption}>` para anexar um resumo abaixo da tabela — bom para contextualizar o conteúdo sem poluir o cabeçalho.",
      },
    },
  },
}

export const WithFooter: Story = {
  render: () => {
    const t = tableStyles()
    const total = itens.reduce((acc, i) => acc + i.quantidade * i.preco, 0)
    return (
      <div className="p-6 max-w-2xl">
        <table className={t.table}>
          <thead className={t.header}>
            <tr>
              <th className={t.head}>Item</th>
              <th className={t.head}>Quantidade</th>
              <th className={t.head}>Preço</th>
            </tr>
          </thead>
          <tbody className={t.body}>
            {itens.map((i) => (
              <tr key={i.item} className={t.row}>
                <td className={t.cell}>{i.item}</td>
                <td className={t.cell}>{i.quantidade}</td>
                <td className={t.cell}>{brl.format(i.preco)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className={t.footer}>
            <tr>
              <td className={t.cell} colSpan={2}>
                Total
              </td>
              <td className={t.cell}>{brl.format(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`<tfoot className={t.footer}>` para uma linha de total — o estilo aplica fundo suave e separa visualmente do corpo.",
      },
    },
  },
}
