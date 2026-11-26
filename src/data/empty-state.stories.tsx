import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ColumnDef } from "@tanstack/react-table"
import { FileText, Inbox, Plus, SearchX } from "lucide-react"
import * as React from "react"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { DataTable } from "./data-table"
import { EmptyState } from "./empty-state"

const meta = {
  title: "Data/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Placeholder para uma área sem dados: ícone, título, descrição e ações.",
          "",
          "- `title` diz **o que** está vazio; `description` diz **por quê** ou **o que fazer**.",
          "- `headingLevel` muda só a tag do título (h1–h6), para encaixar na hierarquia da página.",
          "- `compact` para cards, popovers e colunas estreitas (ações empilhadas).",
          "- `announce` lê o estado vazio no leitor de tela quando ele aparece por uma ação do usuário (busca, filtro). Não use em conteúdo que já carrega vazio.",
          '- Dentro do `emptyMessage` de uma DataTable: a região de status da tabela só lê mensagens de texto, então o EmptyState fica mudo sem `announce`. Ligue-o à busca ou ao filtro (`announce={busca !== ""}`) para não ler uma tabela que já carrega vazia; assim o anúncio sai uma vez só.',
        ].join("\n"),
      },
    },
  },
  args: {
    icon: <Inbox />,
    title: "Nenhuma proposta ainda",
    description: "As propostas criadas a partir dos leads aparecem aqui.",
    actions: (
      <Button>
        <Plus /> Nova proposta
      </Button>
    ),
  },
} satisfies Meta<typeof EmptyState>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TitleOnly: Story = {
  args: { icon: undefined, description: undefined, actions: undefined, title: "Sem anotações" },
}

export const Compact: Story = {
  args: {
    compact: true,
    icon: <FileText />,
    title: "Nenhum documento",
    description: "Envie o RG e o comprovante de renda.",
    actions: (
      <>
        <Button>Enviar documento</Button>
        <Button variant="outline">Pedir ao cliente</Button>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-72 rounded-md border">
        <Story />
      </div>
    ),
  ],
}

function SearchExample() {
  const leads = ["Ana Souza", "Bruno Lima", "Carla Dias"]
  const [query, setQuery] = React.useState("zz")
  const results = leads.filter((lead) => lead.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="flex w-[28rem] max-w-full flex-col gap-3">
      <Input
        label="Buscar lead"
        labelPosition="hidden"
        placeholder="Buscar lead"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {results.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {results.map((lead) => (
            <li key={lead} className="rounded-md border px-3 py-2 text-sm">
              {lead}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          announce
          icon={<SearchX />}
          title="Nenhum lead encontrado"
          description={`Nada corresponde a “${query}”.`}
          actions={
            <Button variant="outline" onClick={() => setQuery("")}>
              Limpar busca
            </Button>
          }
        />
      )}
    </div>
  )
}

export const SearchWithoutResults: Story = {
  render: () => <SearchExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Resultado de uma busca: com `announce`, o leitor de tela lê o título e a descrição quando o estado vazio aparece.",
      },
    },
  },
}

interface Lead {
  nome: string
  telefone: string
}

const columns: ColumnDef<Lead>[] = [
  { accessorKey: "nome", header: "Nome" },
  { accessorKey: "telefone", header: "Telefone" },
]

export const InsideDataTable: Story = {
  render: () => (
    <div className="w-[36rem] max-w-full">
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage={
          <EmptyState
            compact
            icon={<Inbox />}
            title="Nenhum lead"
            description="Os leads do site e das campanhas aparecem aqui."
          />
        }
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Passe o `EmptyState` para o `emptyMessage` da `DataTable`.",
      },
    },
  },
}
