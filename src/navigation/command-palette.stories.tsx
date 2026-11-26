import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  FileIcon,
  HomeIcon,
  LogOutIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "../primitives/button"
import { CommandPalette, type CommandPaletteGroup } from "./command-palette"

const meta: Meta<typeof CommandPalette> = {
  title: "Navigation/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Paleta de comandos no padrão `⌘K` — modal full-screen com input de busca, grupos de itens e atalhos.",
          "Construído sobre `cmdk` (mesma engine do `Combobox`), com `Dialog` da lib como wrapper de overlay.",
          "",
          "**API:**",
          "- `open` / `onOpenChange` — controle do estado de abertura (controlado).",
          "- `groups` — array de `CommandPaletteGroup`, cada um com `heading` opcional e `items[]`.",
          "- `placeholder` — placeholder do input de busca (override pontual).",
          "- `emptyMessage` — mensagem quando a busca não retorna resultado.",
          "- `loading` — renderiza um estado de carregando dentro da lista.",
          "- `title` / `description` — strings exclusivamente para screen-readers (`sr-only`).",
          "- `search` / `onSearchChange` — o termo digitado no campo (controlado ou não). Com `shouldFilter={false}` a paleta não filtra: mostra o que vier em `groups`, para busca no servidor.",
          "- `value` / `onValueChange` — o item destacado (o que o Enter escolheria), não o termo buscado.",
          "- `labels` — `Partial<CommandPaletteLabels>` para tradução / customização de copy. Veja [Foundations/i18n](?path=/docs/foundations-i18n--docs).",
          "",
          "**Shape de `CommandPaletteItem`:**",
          "- `label?` — texto exibido.",
          "- `icon?` — componente lucide-react (ou qualquer `ComponentType<{ className }>`).",
          "- `shortcut?` — string renderizada alinhada à direita (ex.: `⌘K`).",
          "- `onSelect` — callback ao selecionar.",
          "- `disabled?`, `keywords?`, `render?` — overrides avançados.",
          "",
          "**Exemplo:**",
          "",
          "```tsx",
          'import { CommandPalette } from "@amfernandesinc/ui"',
          'import { useState } from "react"',
          "",
          "const [open, setOpen] = useState(false)",
          "",
          "<CommandPalette",
          "  open={open}",
          "  onOpenChange={setOpen}",
          '  title="Comandos"',
          "  groups={[",
          "    {",
          '      heading: "Navegação",',
          '      items: [{ label: "Dashboard", onSelect: () => navigate("/") }],',
          "    },",
          "  ]}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof CommandPalette>

const navigationGroup: CommandPaletteGroup = {
  heading: "Navegação",
  items: [
    { label: "Dashboard", onSelect: () => {} },
    { label: "Clientes", onSelect: () => {} },
    { label: "Documentos", onSelect: () => {} },
  ],
}

const actionsGroup: CommandPaletteGroup = {
  heading: "Ações",
  items: [
    { label: "Novo processo", onSelect: () => {} },
    { label: "Convidar usuário", onSelect: () => {} },
    { label: "Configurações", onSelect: () => {} },
  ],
}

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <p className="text-xs text-muted-foreground">Dois grupos, sem ícones, sem atalhos.</p>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Comandos"
          description="Busque por uma ação ou navegue rapidamente."
          groups={[navigationGroup, actionsGroup]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pattern básico — controle `open`/`onOpenChange` externo e grupos com headings para organizar visualmente.",
      },
    },
  },
}

export const WithIcons: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Comandos"
          groups={[
            {
              heading: "Navegação",
              items: [
                { label: "Início", icon: HomeIcon, onSelect: () => {} },
                { label: "Perfil", icon: UserIcon, onSelect: () => {} },
                { label: "Documentos", icon: FileIcon, onSelect: () => {} },
              ],
            },
            {
              heading: "Conta",
              items: [
                { label: "Configurações", icon: SettingsIcon, onSelect: () => {} },
                { label: "Sair", icon: LogOutIcon, onSelect: () => {} },
              ],
            },
          ]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Cada item pode declarar um `icon` (recomendamos `lucide-react`) — renderizado à esquerda do label com tamanho fixo `size-4`.",
      },
    },
  },
}

export const WithShortcuts: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <p className="text-xs text-muted-foreground">
          Use `shortcut` para sinalizar atalhos de teclado.
        </p>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Comandos"
          groups={[
            {
              heading: "Ações rápidas",
              items: [
                { label: "Novo documento", icon: PlusIcon, shortcut: "⌘N", onSelect: () => {} },
                { label: "Buscar", icon: SearchIcon, shortcut: "⌘P", onSelect: () => {} },
                { label: "Configurações", icon: SettingsIcon, shortcut: "⌘,", onSelect: () => {} },
                { label: "Paleta", shortcut: "⌘K", onSelect: () => {} },
              ],
            },
          ]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "A prop `shortcut` é puramente visual — você ainda precisa registrar o listener de teclado externamente (geralmente um `useEffect` global). Veja a próxima story (`WithKeyboardTrigger`) para o pattern completo.",
      },
    },
  },
}

export const WithKeyboardTrigger: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((v) => !v)
        }
      }
      window.addEventListener("keydown", onKeyDown)
      return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <p className="text-xs text-muted-foreground">
          Pressione <kbd className="rounded border bg-muted px-1.5 text-xs">⌘K</kbd> /{" "}
          <kbd className="rounded border bg-muted px-1.5 text-xs">Ctrl+K</kbd> para abrir.
        </p>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Comandos"
          groups={[
            {
              heading: "Navegação",
              items: [
                {
                  label: "Início",
                  icon: HomeIcon,
                  shortcut: "G H",
                  onSelect: () => {},
                },
                {
                  label: "Perfil",
                  icon: UserIcon,
                  shortcut: "G P",
                  onSelect: () => {},
                },
              ],
            },
          ]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pattern completo com toggle por `⌘K` / `Ctrl+K`. Registre o listener no `useEffect` da página de mais alto nível para que a paleta esteja acessível de qualquer rota.",
      },
    },
  },
}

export const Loading: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <CommandPalette open={open} onOpenChange={setOpen} loading title="Comandos" groups={[]} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Estado de loading — use enquanto resultados estão sendo carregados de uma API. Pareie com `search`/`onSearchChange` e `shouldFilter={false}` para implementar busca assíncrona (veja `ServerSearch`).",
      },
    },
  },
}

const leads = [
  { id: "lead-1", nome: "João da Silva", cpf: "123.456.789-09" },
  { id: "lead-2", nome: "Maria Conceição", cpf: "987.654.321-00" },
  { id: "lead-3", nome: "José Antônio Souza", cpf: "111.444.777-35" },
]

function ServerSearchDemo() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [results, setResults] = useState(leads)
  const [loading, setLoading] = useState(false)

  // Stands in for a request to the server: the palette does not filter.
  useEffect(() => {
    setLoading(true)
    const digits = search.replace(/\D/g, "")
    const timer = window.setTimeout(() => {
      setResults(
        leads.filter((lead) => (digits ? lead.cpf.replace(/\D/g, "").includes(digits) : true)),
      )
      setLoading(false)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [search])

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={() => setOpen(true)}>Buscar lead por CPF</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        title="Buscar lead"
        placeholder="Digite o CPF"
        search={search}
        onSearchChange={setSearch}
        shouldFilter={false}
        loading={loading}
        groups={[
          {
            heading: "Leads",
            items: results.map((lead) => ({
              id: lead.id,
              label: `${lead.nome} · ${lead.cpf}`,
              onSelect: () => {},
            })),
          },
        ]}
      />
    </div>
  )
}

export const ServerSearch: Story = {
  render: () => <ServerSearchDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Busca no servidor: `search`/`onSearchChange` dão o termo digitado, `loading` cobre a espera e `shouldFilter={false}` mostra os resultados como vieram (aqui, um lead pelo CPF).",
      },
    },
  },
}

export const Empty: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Abrir paleta</Button>
        <p className="text-xs text-muted-foreground">
          Abra e digite "xyz" para ver o estado vazio.
        </p>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Comandos"
          emptyMessage="Nenhum comando corresponde à sua busca."
          groups={[
            {
              heading: "Disponíveis",
              items: [
                { label: "Dashboard", onSelect: () => {} },
                { label: "Configurações", onSelect: () => {} },
              ],
            },
          ]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Quando a busca não retorna nenhum item, a mensagem da prop `emptyMessage` (ou o default de `labels.emptyMessage`) é exibida. Aceita `ReactNode`, então você pode incluir JSX (ex.: um CTA para criar item novo).",
      },
    },
  },
}

export const English: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div className="flex flex-col items-center gap-3">
        <Button onClick={() => setOpen(true)}>Open palette</Button>
        <p className="text-xs text-muted-foreground">Type "xyz" to trigger the empty state.</p>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          title="Commands"
          description="Search for an action or navigate quickly."
          labels={{
            placeholder: "Type a command or search...",
            emptyMessage: "No results found.",
            loading: "Loading…",
            list: "Results",
          }}
          groups={[
            {
              heading: "Navigation",
              items: [
                { label: "Home", icon: HomeIcon, onSelect: () => {} },
                { label: "Profile", icon: UserIcon, onSelect: () => {} },
              ],
            },
            {
              heading: "Actions",
              items: [
                { label: "New document", icon: PlusIcon, shortcut: "⌘N", onSelect: () => {} },
                { label: "Settings", icon: SettingsIcon, shortcut: "⌘,", onSelect: () => {} },
              ],
            },
          ]}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full en-US override via the `labels` prop. Defaults are pt-BR; pass `labels={{ ... }}` to translate the placeholder, empty message and loading state per instance. See [Foundations/i18n](?path=/docs/foundations-i18n--docs) for the full pattern.",
      },
    },
  },
}
