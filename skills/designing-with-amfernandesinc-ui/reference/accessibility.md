# Acessibilidade

A lib entrega componentes WCAG 2.1 AA: contraste nos dois temas, foco visível, teclado completo, ARIA correta, cores forçadas (alto contraste do Windows), movimento reduzido, alvos de toque de 24px ou mais, testados com axe em navegador. O que ela não sabe é o **conteúdo** da sua tela. Essa parte é sua.

## O que é seu

### Nomes

| Elemento | Dê o nome com |
|---|---|
| Campo | `label` (visível). Sem espaço para rótulo: `labelPosition="hidden"` ou `aria-label`. Placeholder não é nome. |
| Botão só com ícone | `IconButton label="Excluir proposta"` (nome e tooltip). Nunca `Button` só com ícone sem `aria-label`. |
| Ação repetida em linhas | Inclua o item no nome: `label={\`Excluir ${lead.nome}\`}`. Dez botões "Excluir" iguais não dizem nada. |
| `Tabs` | `aria-label` da lista ("Seções do lead"). |
| `Popover` sem gatilho com texto | `aria-label` ou `aria-labelledby`. |
| `DataTable` | `aria-label`, `aria-labelledby` ou `caption`. |
| `ScrollArea` com conteúdo importante | `aria-label` (vira região nomeada e focável). |
| `Image` | `alt` que diz o que importa ("Fachada do Residencial Bosque"), ou `decorative`. |
| `Video` | `aria-label`; legendas em `captions` quando há fala. |
| `Sparkline` | `label` com a tendência em palavras. |
| Gráficos | `title` que diz o que o gráfico mostra. |
| `Progress` | `aria-label` ou `aria-labelledby`. |

### Estrutura

- Um `h1` por página (`Typography variant="heading" as="h1"`). `Card`, `EmptyState`, `Accordion` e `Schedule` têm `headingLevel`: ajuste à hierarquia (um card sob o `h1` usa 2).
- O `AppShell` já cria o `<main id="conteudo">`, a navegação principal e o link "Pular para o conteúdo". Não aninhe outro `<main>`.
- Seções da página: `<section aria-labelledby>` com o título dela, quando ajudam a navegar.
- Ordem do DOM = ordem visual. Não reordene com `order-*` coisas que o teclado percorre.

### Interação

- Clicável é `Button`, `IconButton`, link ou `onRowClick` da `DataTable`. Nunca `div`/`span` com `onClick`.
- Link navega (`href`), botão age. Um "Ver detalhes" que abre outra página é link (`<Button asChild><a href…/></Button>` ou `renderLink`).
- Não tire o foco visível; num elemento clicável seu, `focus-visible:focus-outline`.
- Depois de uma ação, o foco vai para um lugar que faça sentido: os overlays já devolvem o foco ao gatilho; depois de excluir uma linha, foque a lista ou o próximo item.
- Atalhos de teclado (⌘K) são extras: tudo precisa funcionar sem eles.

### Informação

- Cor nunca sozinha: status com texto (`Badge`), erro com mensagem (`error`), gráfico com legenda e tabela.
- Tooltip só complementa: nada essencial só nele (não existe no toque nem para muitos leitores de tela).
- Mensagens de erro dizem o que fazer ("Informe um CPF com 11 dígitos."), não só "Inválido".
- Resultado de busca ou filtro vazio: `EmptyState announce` (anuncia uma vez).
- Conteúdo que muda sozinho e importa (um status de processamento): `toast` ou uma região `aria-live="polite"` sua, sem anunciar a cada segundo.

### Visual

- Use só tokens de cor: o contraste foi validado nos dois temas. Texto seu sobre `bg-muted` usa `text-foreground` ou `text-muted-foreground`, nada mais claro.
- Não diminua texto abaixo de `text-xs` (12px) nem alvos clicáveis abaixo de 24px.
- Funciona a 360px de largura e com zoom de 200%: sem rolagem horizontal da página (tabelas largas rolam dentro da `DataTable`).
- Animações suas: `motion-safe:`/`motion-reduce:`.

## Como testar

- **Teclado:** Tab percorre tudo na ordem da tela, Shift+Tab volta, Enter/Espaço acionam, Esc fecha overlays, setas dentro de menus, abas, listas, árvore e gráficos. O foco é sempre visível.
- **Leitor de tela:** NVDA (Windows) ou VoiceOver (macOS/iOS). Cada controle diz nome, papel e estado; erros são lidos.
- **axe automático:** nos testes de componente e de navegador.
- **Tema escuro, 360px, zoom 200%, alto contraste** (`forced-colors`): uma passada em cada antes de entregar.

```tsx
// fora da verificação: usa vitest, @testing-library/react e vitest-axe, que são do app
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe } from "vitest-axe"
import { expect, it } from "vitest"
import { LeadForm } from "./lead-form"

it("o formulário de lead não tem violações e mostra os erros pelo teclado", async () => {
  const { container } = render(<LeadForm onSave={async () => {}} />)
  expect(await axe(container)).toHaveNoViolations()
  await userEvent.tab()
  expect(screen.getByLabelText(/Nome completo/)).toHaveFocus()
  await userEvent.click(screen.getByRole("button", { name: "Salvar lead" }))
  expect(await screen.findByText("Informe o nome.")).toBeInTheDocument()
})
```

```ts
// fora da verificação: usa @playwright/test e @axe-core/playwright, que são do app
import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("listagem de leads sem violações, nos dois temas", async ({ page }) => {
  await page.goto("/leads")
  for (const tema of ["claro", "escuro"]) {
    if (tema === "escuro") await page.evaluate(() => document.documentElement.classList.add("dark"))
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
    expect(violations).toEqual([])
  }
})
```

Ao procurar elementos nos testes, prefira papel e nome (`getByRole("button", { name: "Salvar lead" })`), como o usuário de leitor de tela encontraria. Os componentes da lib têm `data-slot` estáveis (`data-slot="dialog-content"`) quando não há papel adequado.
