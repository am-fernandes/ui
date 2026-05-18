import type { Meta, StoryObj } from "@storybook/react-vite"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

const meta = {
  title: "Data/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Primitivo de tabela HTML semântica (`<table>`/`<thead>`/`<tbody>`/`<tfoot>`/`<tr>`/`<th>`/`<td>`/`<caption>`). Use quando precisar de controle total sobre a estrutura — para tabelas com filtro, ordenação e paginação prontos prefira `DataTable`.",
          "",
          "**Subcomponentes:**",
          '- `Table` — wrapper. Renderiza um `<div data-slot="table-container">` rolável seguido do `<table>`. Aceita `containerClassName` para customizar o wrapper.',
          "- `TableHeader` / `TableBody` / `TableFooter` — `<thead>`, `<tbody>`, `<tfoot>`.",
          "- `TableRow` — `<tr>` com estilos de hover e estado `data-[state=selected]`.",
          "- `TableHead` — `<th>` para cabeçalhos de coluna.",
          "- `TableCell` — `<td>` para células de dados.",
          "- `TableCaption` — `<caption>` para legenda acessível.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          "import {",
          "  Table,",
          "  TableBody,",
          "  TableCaption,",
          "  TableCell,",
          "  TableFooter,",
          "  TableHead,",
          "  TableHeader,",
          "  TableRow,",
          '} from "@am-fernandes/ui"',
          "",
          "<Table>",
          "  <TableCaption>Lista de contratos</TableCaption>",
          "  <TableHeader>",
          "    <TableRow>",
          "      <TableHead>Número</TableHead>",
          "      <TableHead>Cliente</TableHead>",
          "    </TableRow>",
          "  </TableHeader>",
          "  <TableBody>",
          "    <TableRow>",
          "      <TableCell>C-2026-001</TableCell>",
          "      <TableCell>Empresa A</TableCell>",
          "    </TableRow>",
          "  </TableBody>",
          "</Table>",
          "```",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>C-2026-001</TableCell>
          <TableCell>Empresa A</TableCell>
          <TableCell>Aprovado</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>C-2026-002</TableCell>
          <TableCell>Empresa B</TableCell>
          <TableCell>Pendente</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>C-2026-003</TableCell>
          <TableCell>Empresa C</TableCell>
          <TableCell>Vencido</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>Contratos vigentes em maio de 2026.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Cliente</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>C-2026-001</TableCell>
          <TableCell>Empresa A</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>C-2026-002</TableCell>
          <TableCell>Empresa B</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>C-2026-001</TableCell>
          <TableCell>Empresa A</TableCell>
          <TableCell className="text-right">R$ 12.000,00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>C-2026-002</TableCell>
          <TableCell>Empresa B</TableCell>
          <TableCell className="text-right">R$ 8.500,00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">R$ 20.500,00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}
