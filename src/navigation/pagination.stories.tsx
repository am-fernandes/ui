import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, userEvent, within } from "@storybook/test"
import * as React from "react"

import { Pagination, type PaginationProps } from "./pagination"

function Controlled(props: Partial<PaginationProps> & { initialPage?: number }) {
  const { initialPage = 1, ...rest } = props
  const [page, setPage] = React.useState(initialPage)
  return <Pagination totalPages={10} {...rest} page={page} onPageChange={setPage} />
}

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Paginação independente, para listas, cards e tabelas paginadas no servidor.",
          "",
          "- **Total conhecido** — `totalItems` (+ `pageSize`) ou `totalPages`. Com `totalItems`, aparece o resumo “11–20 de 243”.",
          "- **Cursor** — sem total, use `hasMore`: só anterior/próxima.",
          '- `variant="pages"` (padrão) mostra números com reticências, sempre com o mesmo número de posições (o controle não muda de largura ao paginar). `variant="compact"` mostra “Página 3 de 10”.',
          "- `pageSizeOptions` + `onPageSizeChange` mostram o seletor de itens por página (o mesmo da `DataTable`); trocar o tamanho volta para a página 1.",
          "- `getPageHref` gera links de verdade (`?page=3`), que dá para abrir em nova aba; `onPageChange` continua sendo chamado.",
          "",
          "A página é 1-based e controlada: guarde-a no estado (ou na URL) e atualize em `onPageChange`.",
        ].join("\n"),
      },
    },
  },
  args: { page: 1, totalPages: 10, onPageChange: () => {} },
} satisfies Meta<typeof Pagination>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Controlled />,
}

export const ManyPages: Story = {
  render: () => <Controlled totalPages={50} initialPage={25} showFirstLast />,
  parameters: {
    docs: {
      description: {
        story:
          "Com muitas páginas, as reticências substituem as que ficam longe da atual. `showFirstLast` adiciona os atalhos para a primeira e a última.",
      },
    },
  },
}

function WithTotalsDemo() {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  return (
    <Pagination
      page={page}
      onPageChange={setPage}
      totalItems={243}
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 50]}
      onPageSizeChange={setPageSize}
    />
  )
}

export const WithTotals: Story = {
  render: () => <WithTotalsDemo />,
  parameters: {
    docs: {
      description: {
        story: "`totalItems` mostra o resumo do intervalo; `pageSizeOptions` mostra o seletor.",
      },
    },
  },
}

export const Compact: Story = {
  render: () => <Controlled variant="compact" totalPages={12} initialPage={3} />,
}

function CursorDemo() {
  const [page, setPage] = React.useState(1)
  return <Pagination page={page} onPageChange={setPage} hasMore={page < 4} />
}

export const Cursor: Story = {
  render: () => <CursorDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "APIs com cursor não sabem o total: passe `hasMore` e a próxima fica habilitada enquanto houver mais.",
      },
    },
  },
}

export const Links: Story = {
  render: () => <Controlled totalPages={8} getPageHref={(page) => `#pagina-${page}`} />,
  parameters: {
    docs: {
      description: {
        story:
          "Com `getPageHref`, cada página é um `<a>`: dá para abrir em nova aba e o buscador segue os links.",
      },
    },
  },
}

export const Small: Story = {
  render: () => <Controlled size="sm" totalPages={20} initialPage={10} />,
}

export const Disabled: Story = {
  args: { page: 3, totalPages: 10, disabled: true },
}

export const Interaction: Story = {
  render: () => <Controlled />,
  parameters: {
    docs: {
      description: {
        story: "Teste de interação: próxima página e clique num número movem a página atual.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Próxima página" }))
    await expect(canvas.getByRole("button", { name: "Página 2" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await userEvent.click(canvas.getByRole("button", { name: "Página 10" }))
    await expect(canvas.getByRole("button", { name: "Página 10" })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await expect(canvas.getByRole("button", { name: "Próxima página" })).toHaveAttribute(
      "aria-disabled",
      "true",
    )
  },
}
