# Setup, tema e tokens

## Instalação

O pacote é publicado no npm público: não há registro nem token para configurar. Se o `.npmrc` do projeto (ou do CI) aponta o escopo `@amfernandesinc` para outro registro, apague essas linhas.

```bash
bun add @amfernandesinc/ui      # ou npm install / pnpm add
bun add lucide-react            # ícones nas suas telas
bun add react-hook-form         # se tiver formulários
bun add @tanstack/react-table   # se tipar colunas da DataTable (ColumnDef também sai da lib)
```

Peer deps: `react@^19`, `react-dom@^19`, `tailwindcss@^4.1`. A lib é ESM, com um subpath por componente.

## CSS de entrada

```css
/* src/index.css (Vite) ou app/globals.css (Next.js) */
@import "@amfernandesinc/ui/fonts";
@import "@amfernandesinc/ui/styles";

/* Só na 0.5.x (a 0.6 já traz isto dentro do styles): */
@source "../node_modules/@amfernandesinc/ui/dist";

/* Daqui para baixo, só o que é do app (sem redefinir tokens). */
```

### Por que o `@source`

O Tailwind v4 gera só as classes que encontra nos arquivos que ele lê, e por padrão **não lê `node_modules`**. As classes que existem só dentro da lib compilada (posição do Dialog, `rounded-container`, animações de entrada, cores de status, larguras de menus) não são geradas sem um `@source` que aponte para a `dist/` da lib. Medido num app novo: sem ele, o CSS sai com 30 KB e nenhuma classe da lib; com ele, 128 KB.

Na **0.6**, o próprio `tokens.css` publicado declara `@source "./"` (relativo a ele, dentro da `dist/`), e o app não precisa de nada. Na **0.5.x**, a linha é do app, e o resto desta seção vale para ela.

Sintomas de `@source` faltando ou com caminho errado:

- `Dialog`, `Sheet`, `Popover`, `Select` abrem sem fundo, sem borda, presos no fim da página.
- Botões sem altura certa, cantos retos, foco sem anel.
- `Badge`/`Alert` de status sem cor.

O caminho é **relativo ao arquivo CSS**. Exemplos:

| CSS de entrada | `@source` |
|---|---|
| `src/index.css` | `"../node_modules/@amfernandesinc/ui/dist"` |
| `app/globals.css` (Next.js) | `"../node_modules/@amfernandesinc/ui/dist"` |
| `src/app/globals.css` | `"../../node_modules/@amfernandesinc/ui/dist"` |
| `apps/web/src/index.css` em monorepo com hoisting | `"../../../node_modules/@amfernandesinc/ui/dist"` |

Para conferir: abra um `Dialog` no app. Se ele aparece centralizado, com fundo `bg-popover`, borda e cantos de 12px, o setup está certo.

### Ordem e duplicação

- `@amfernandesinc/ui/styles` já faz `@import "tailwindcss"` e `@import "tw-animate-css"`. Não importe de novo.
- Se o app tem o seu próprio `@theme`, use-o só para tokens **novos** do app (uma cor de marca de um produto específico, por exemplo), nunca para `--color-primary`, `--radius-*`, `--font-*`, `--z-*`, `--duration-*`.

## Vite

```tsx
// fora da verificação: arquivo de entrada do Vite (depende do index.html do app)
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "@amfernandesinc/ui"
import "./index.css"
import { App } from "./App"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
)
```

## Next.js (App Router)

Os componentes da lib já trazem `"use client"`, então dá para importá-los de Server Components. Eventos e estado ficam num componente seu marcado com `"use client"`.

```tsx
// fora da verificação: depende de next e next-themes
// app/layout.tsx
import { ThemeProvider } from "next-themes"
import { Toaster } from "@amfernandesinc/ui"
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

Os helpers de `@amfernandesinc/ui/lib/*` (datas, dinheiro, validadores) não têm `"use client"` e rodam no servidor.

## Tema escuro

- Ligue com a classe `dark` no `<html>` (ou num ancestral da parte que deve ficar escura). Os tokens trocam sozinhos e `color-scheme` acompanha, então barras de rolagem e campos nativos também escurecem.
- Não há provider da lib. Para seguir o sistema ou guardar a escolha, use `next-themes` (`attribute="class"`) ou alterne a classe você mesmo.
- Ajustes só do escuro: variante `dark:` do Tailwind (já configurada para a classe `dark`).
- Os gráficos têm cores próprias validadas para cada tema; não as troque.

```tsx
import { Moon, Sun } from "lucide-react"
import * as React from "react"
import { IconButton } from "@amfernandesinc/ui"

export function ThemeToggle() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  const toggle = () => {
    document.documentElement.classList.toggle("dark", !dark)
    setDark(!dark)
  }
  return (
    <IconButton
      icon={dark ? <Sun /> : <Moon />}
      label={dark ? "Usar tema claro" : "Usar tema escuro"}
      onClick={toggle}
    />
  )
}
```

## Tokens de cor (classes)

Use sempre os pares superfície + texto. Todas existem como `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `stroke-*`.

| Papel | Tokens |
|---|---|
| Página | `bg-background`, `text-foreground` |
| Superfície sobre a página (painel, barra de filtros, card) | `bg-card`, `text-card-foreground`, borda `border-border-strong` |
| Overlays | `bg-popover`, `text-popover-foreground` |
| Ação principal | `bg-primary`, `text-primary-foreground` (+ `primary-hover`, `primary-pressed`) |
| Ação secundária | `bg-secondary`, `text-secondary-foreground` |
| Fundo discreto | `bg-muted`; texto de apoio `text-muted-foreground`; mais leve `text-subtle-foreground` |
| Destaque leve | `bg-accent`, `text-accent-foreground` |
| Erro / perigo | `bg-destructive`, `text-destructive-foreground`; texto de erro sobre superfície: `text-destructive-text` |
| Status | `success`, `warning`, `info` (cada um com `-foreground`) |
| Linhas e campos | `border-border` (divisória), `border-border-strong` (contorno), `border-input` (campo), `text-placeholder`, `ring` (foco), `text-link` |
| Categorias (tags, agenda) | `category-{gray,red,orange,yellow,green,teal,blue,purple,pink}-{bg,text,solid}` |
| Menu lateral | `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-accent`, `sidebar-border`, `sidebar-ring` |
| Gráficos | `chart-1`…`chart-6` (séries), `chart-seq-1`…`5` (sequencial), `chart-div-1`…`7` (divergente) |
| Fundo de modal | `bg-scrim`, `bg-scrim-light` |

Regras:

- Texto de apoio é `text-muted-foreground`, não `text-gray-500`.
- Uma área que fica sobre a página é `bg-card` com `border border-border-strong rounded-container`, sem sombra.
- Status sempre com texto ou ícone, nunca só a cor.

## Raio

| Nível | Classe | Onde |
|---|---|---|
| `inner` 4px | `rounded-inner` (= `rounded-xs`, `rounded-sm`) | peças dentro de um controle: caixa do checkbox, chip dentro de campo, aba |
| `element` 8px | `rounded-element` (= `rounded-md`, `rounded`) | o controle: botão, campo, item de menu, linha clicável |
| `container` 12px | `rounded-container` (= `rounded-lg` e acima) | card, dialog, sheet, popover, painel, imagem em destaque |

O raio de dentro sai do de fora: um bloco com `p-1` dentro de um `rounded-container` usa `rounded-element`. `rounded-full` só para avatar, ponto de status, pílula.

## Altura de controle e densidade

| `size` | Altura | Classe para o que é seu |
|---|---|---|
| `sm` | 32px | `h-control-sm` / `min-h-control-sm` / `size-control-sm` |
| `md` (padrão) | 40px | `h-control-md` |
| `lg` | 44px | `h-control-lg` |

Campos, `Button`, `IconButton`, `Toggle`, `Select`, `SegmentedControl` do mesmo `size` têm a mesma altura e se alinham numa linha de filtros. Em toque, `lg` dá a área mínima confortável. A `DataTable` tem `density="default" | "compact"`.

## Utilitários da lib

| Utilitário | Para |
|---|---|
| `focus-visible:focus-outline` | o anel de foco do sistema em algo clicável seu |
| `focus-visible:focus-outline-inset` | o mesmo, para dentro (célula, linha, item de lista que cortaria o anel) |
| `state-layer` | hover e pressed de uma superfície clicável sua (camada da cor do texto, não aparece desabilitado) |
| `state-hover`, `state-pressed` | as mesmas camadas para estados que não são de ponteiro (`data-[highlighted]:state-hover`) |
| `field-states` (+ `field-error`) | aparência de campo num controle seu (borda, hover, foco) |

```tsx
import { ChevronRight } from "lucide-react"
import { cn } from "@amfernandesinc/ui"

export function LinhaClicavel({ titulo, onOpen }: { titulo: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-element px-3 py-2 text-left text-sm",
        "state-layer focus-visible:focus-outline",
      )}
    >
      {titulo}
      <ChevronRight aria-hidden="true" className="size-4 text-muted-foreground" />
    </button>
  )
}
```

## z-index e movimento

- Camadas: `z-(--z-overlay)` 40, `z-(--z-modal)` 50, `z-(--z-popover)` 60, `z-(--z-tooltip)` 70, `z-(--z-toast)` 80. Um cabeçalho fixo seu fica abaixo de 40.
- Durações: `--duration-fast` (175ms, menus e tooltips), `--duration-medium` (410ms, painéis), saída sempre `--duration-exit`; curva `--ease-standard`. Em CSS: `duration-(--duration-fast) ease-(--ease-standard)`.
- `prefers-reduced-motion` desliga as animações da lib; nas suas, use `motion-safe:` ou `motion-reduce:`.

## Tipografia

Fonte `font-sans` (Geist) e `font-mono` (Geist Mono, para códigos, IDs, valores alinhados). Corpo `text-sm`. Números em coluna: `tabular-nums`. Títulos e textos de página: `Typography` (`variant` `heading`, `title`, `subtitle`, `lead`, `body`, `caption`; `as` para a tag certa).

```tsx
import { Typography } from "@amfernandesinc/ui"

export function Cabecalho() {
  return (
    <header className="space-y-1">
      <Typography variant="heading" as="h1">
        Propostas
      </Typography>
      <Typography variant="body" className="text-muted-foreground">
        Acompanhe as propostas enviadas neste mês.
      </Typography>
    </header>
  )
}
```

## Ícones

`lucide-react`, tamanho padrão `size-4` (16px), `aria-hidden="true"` quando decorativos. Duas formas, conforme a prop:

| Pede o **elemento** (`<Trash2 />`) | Pede o **componente** (`Trash2`) |
|---|---|
| `IconButton icon`, `Input leadingIcon`/`trailingIcon`, `Alert icon`, `EmptyState icon` | `Token icon`, `icon` dos itens de `AppShell`, `DropdownMenu`, `CommandPalette`, dos nós da `Tree` e das opções de `RadioGroup` e `SegmentedControl` |

Os de componente recebem `className` da lib (tamanho e cor certos para o lugar). Na dúvida, o tipo está em `reference/api/`.

## Personalizar sem quebrar

- `className` passa pelo `cn` (tailwind-merge): serve para layout (largura, margem, posição no grid). Não troque cor, raio, altura ou sombra de um componente.
- Precisa de variação visual nova (uma cor de marca, outro tamanho)? É mudança na lib, não no app.
- Para um componente seu com a cara do sistema, use os tokens e utilitários acima; para classes de um componente da lib sem ele, há `buttonVariants`, `badgeVariants`, `alertVariants`, `toggleVariants`, `typographyVariants`, `tableStyles`.

```tsx
import { buttonVariants, cn } from "@amfernandesinc/ui"

export function LinkComoBotao({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={cn(buttonVariants({ variant: "outline" }))}>
      {children}
    </a>
  )
}
```

(Para links do roteador, prefira `<Button asChild><Link …/></Button>`.)
