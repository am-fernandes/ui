# Contribuindo com `@amfernandesinc/ui`

Guia oficial para adicionar, evoluir e revisar componentes do design system da AM Fernandes.
Toda a documentação aqui é a regra prática — se algo diverge do que está no código, **o código vence** e o guia precisa ser atualizado.

---

## 1. Visão geral

`@amfernandesinc/ui` é o design system interno da **AM Fernandes & Associados** (incorporadora). Empacota componentes React/TypeScript prontos para uso em todas as apps internas (ex.: `requerimento-contratos-pf`, `assistencia-tecnica`) e substitui as cópias locais de shadcn/ui por uma fonte única versionada.

- **Stack**: React 19, TypeScript, Tailwind CSS v4 (`@theme inline`), Radix UI, Storybook 10, Vitest, Playwright, Biome.
- **Runtime**: Bun (ver `CLAUDE.md`).
- **Distribuição**: registro privado (`@amfernandesinc` no GitHub Packages). Cada componente tem um subpath export em `package.json`.
- **Mantenedores**: equipe de engenharia AM Fernandes. PRs externos só após convite.
- **Cultura**: pt-BR first (strings de UI em pt-BR, código e identificadores em inglês).

---

## 2. Setup local

Pré-requisitos: **Bun ≥ 1.1** e **Node ≥ 20** (apenas para alguns binários que precisam de `node`).

```bash
bun install
bun run storybook    # http://localhost:6006
```

Comandos do dia a dia:

```bash
bun run typecheck         # tsc --noEmit
bun run lint              # biome check .
bun run test              # vitest run
bun run test:watch        # vitest em watch mode
bun run test:coverage     # cobertura (V8)
bun run build             # tsup -> dist/
bun run test:e2e          # playwright (precisa do storybook ou build)
bun run sync:coverage     # atualiza badges de cobertura
```

Antes de qualquer push: `bun run typecheck && bun run test && bun run build`.

---

## 3. Filosofia do design system

Estas decisões são deliberadas. Não as questione num PR sem antes abrir issue separada.

- **Light only.** Sem dark mode, sem theme switching. Apps internas, contexto controlado.
- **Flat.** Sem shadows, sem elevation tokens. Hierarquia é dada por borda, espaço e tipografia.
- **Radius uniforme.** `--radius: 0.25rem` (4px) para *todas* as escalas (`rounded-sm` até `rounded-4xl` apontam para o mesmo valor — ver `src/styles/tokens.css`).
- **Densidade enterprise.**
  - Body: `text-sm`.
  - Inputs: `py-3` vertical, `px-3` horizontal (altura sai do padding, sem `h-*` fixo).
  - Linhas de tabela: `py-2.5 px-3`.
  - Menus / tabs / sidebar / tree: `py-1.5`.
- **Cursor pointer em tudo clicável.** Botões, triggers de Radix, ícones interativos.
- **Foco em 2 tiers.**
  - **Tier 1 (fields)** — `focus-within:border-primary focus-within:ring-1 focus-within:ring-ring` (sem offset, ring colado na borda). Estado de erro substitui o ring por `ring-destructive`.
  - **Tier 2 (controles ativos: buttons, checkbox, switch, links)** — `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.
- **Disabled.** `opacity-50` no shell + `cursor-not-allowed` no controle. Não duplique opacidade dentro do `FieldShell` (ver commit `944211f`).
- **Motion tokens.** `--motion-fast` (100ms), `--motion-default` (150ms), `--motion-slow` (200ms), `--motion-slowest` (300ms). Use o token apropriado para a categoria do componente.
- **Z-index tokens.** `--z-overlay` (40), `--z-modal` (50), `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80). Nunca use `z-[999...]`.
- **WCAG AA** é o mínimo. Contraste verificado via `scripts/oklch-contrast.ts` e Storybook `addon-a11y`.
- **pt-BR nas strings.** Mensagens default ("obrigatório", "Carregando dados…", etc.) em pt-BR. A médio prazo serão extraídas via prop `labels`.

---

## 4. Convenções de código

### Conventional commits

Tipos em uso (verificado em `git log --oneline`): `feat`, `fix`, `style`, `refactor`, `build`, `chore`, `docs`, `test`, `release`.

Formato: `tipo(escopo): assunto em minúsculas no imperativo`.

Exemplos reais do repositório:
- `feat(tokens): z-index scale + motion durations + prefers-reduced-motion`
- `fix(a11y): close screen-reader gaps across overlays and fields`
- `style(motion): tighten transition primitives and smooth row hovers`
- `build(packaging): per-component subpath exports + tsup splitting`

**Breaking changes** usam `!`: `refactor(typography)!: rework variant scale (...)` ou `feat(data-table)!: drop controlled sorting; ...`. Adicione um parágrafo explicando a migração no corpo.

### Um commit por mudança lógica

A história do repositório é linear e granular de propósito. Não bata vários refactors num único commit "WIP". Se a mudança tem dois efeitos independentes (ex.: ajuste de spacing + correção de bug), são dois commits.

### Co-author trailer

Trabalho assistido por agente inclui o trailer no final da mensagem (uma linha em branco antes):

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

### Lint / format

Biome cuida de tudo (`bun run lint`). Configuração em `biome.json`:
- Aspas duplas, sem ponto-e-vírgula, indent 2 espaços, line width 100.
- `organizeImports` ligado.
- `noNonNullAssertion` desligado (use com parcimônia).
- `noExplicitAny` é `warn` — prefira tipar.

---

## 5. Como adicionar um componente novo

### Passo 1. Escolher a pasta

| Pasta | O quê | Exemplos |
|---|---|---|
| `src/primitives/` | Átomos visuais. | `button`, `input`, `checkbox`, `badge`, `typography`. |
| `src/forms/` | Widgets compostos de formulário (calendário, combobox, pickers). | `combobox`, `date-input`, `time-picker`. |
| `src/overlays/` | Componentes que portalizam via Radix. | `dialog`, `popover`, `tooltip`, `sheet`. |
| `src/navigation/` | Estrutura de navegação. | `sidebar`, `tabs`, `breadcrumb`, `command-palette`. |
| `src/data/` | Exibição de dados. | `data-table`, `tree`, `card`, `image`. |
| `src/domain/` | Coisas específicas do Brasil ou do negócio. | `currency-input` (BRL), `cpf-input`, `percentage-input`. |

Se houver dúvida entre `primitives` e `forms`, vá em `primitives` se for um átomo controlado por um único valor; vá em `forms` se compõe múltiplas peças (ex.: trigger + calendário + popover).

### Passo 2. Copiar o template

```bash
cp docs/component-template/component.tsx        src/<pasta>/<seu-nome>.tsx
cp docs/component-template/component.stories.tsx src/<pasta>/<seu-nome>.stories.tsx
cp docs/component-template/component.test.tsx   src/<pasta>/<seu-nome>.test.tsx
```

Renomeie `Component`/`ComponentProps` para o nome real (`MyField`/`MyFieldProps`).

### Passo 3. Adotar `FieldShell` + `useFieldIds`

Se for um **field** (label, description, error, required), embrulhe em `FieldShell` e gere ids via `useFieldIds`. Referências exemplares:
- `src/primitives/input.tsx` — o caso canônico.
- `src/domain/currency-input.tsx` — input formatado com adornments.
- `src/primitives/checkbox.tsx` — controle sem `FieldShell` que ainda usa `useFieldIds`.

### Passo 4. ARIA mínimo

- `aria-invalid` quando `error` está presente.
- `aria-describedby` apontando para `descriptionId` + `errorId` (via `ids.describedBy({ description, error })`).
- `aria-required` no controle quando `required`.
- `role="alert"` no parágrafo de erro (o `FieldShell` já faz isso).
- Para Radix-baseados: respeite os `role` que o primitivo já provê — só sobrescreva com razão.

### Passo 5. Story

Variantes obrigatórias: `Default`, `WithError` (ou `Error`), `Disabled`, `Required`. Para fields, inclua também `WithDescription`. Use `play` functions quando faz sentido validar interações.

### Passo 6. Teste

Cobertura mínima:
1. Renderiza com label.
2. Renderiza com description (e aria-describedby aponta para ela).
3. Renderiza com error (`aria-invalid="true"` + `role="alert"`).
4. `disabled` desabilita interação.
5. `required` mostra o asterisco (ou `aria-required`).
6. Keyboard (Tab/Enter/Space conforme aplicável).
7. `ref` é encaminhado para o elemento DOM correto.

### Passo 7. Expor no barrel + subpath

Adicione em `src/index.ts`:

```ts
export { MyField, type MyFieldProps } from "./<pasta>/my-field"
```

Adicione em `package.json` `exports`:

```jsonc
"./my-field": {
  "types": "./dist/<pasta>/my-field.d.ts",
  "import": "./dist/<pasta>/my-field.js"
}
```

### Passo 8. Validar

```bash
bun run typecheck && bun run test && bun run build
```

Build deve sair sem warnings. Se aparecer warning de tsup, investigue antes de commitar.

---

## 6. Checklist do PR

Cole no corpo do PR e marque conforme avança:

- [ ] Componente implementado seguindo `docs/component-template/`
- [ ] `FieldShell` + `useFieldIds` usados (se for um field)
- [ ] ARIA: `aria-invalid`, `aria-describedby`, `aria-required`, `role` correto
- [ ] `displayName` setado
- [ ] Story com variantes `Default`, `Error`, `Disabled`, `Required` (`Description` quando aplicável)
- [ ] Teste cobrindo smoke + state + keyboard + ARIA wiring
- [ ] Cobertura local ≥95% (`bun run sync:coverage`)
- [ ] `bun run typecheck` limpo
- [ ] `bun run test` 100% pass
- [ ] `bun run build` sem warnings
- [ ] Strings em pt-BR (futuro: extrair via prop `labels`)
- [ ] Sem shadow, sem dark mode (filosofia)
- [ ] Subpath export adicionado em `package.json` `exports`
- [ ] Adicionado em `src/index.ts` (barrel)
- [ ] Commits no padrão Conventional (`feat:`, `fix:`, etc.) — um por mudança lógica
- [ ] Trailer `Co-Authored-By:` quando trabalho foi assistido por agente

---

## 7. Tokens de design

Definidos em `src/styles/tokens.css` dentro de `@theme inline`. Os mais usados:

| Token | Valor | Quando usar |
|---|---|---|
| `--radius` | `0.25rem` (4px) | Cantos. Use sempre via `rounded-md` (ou qualquer alias — todos apontam para o mesmo valor). |
| `--motion-fast` | 100ms | Tooltip. |
| `--motion-default` | 150ms | Popover, dropdown, transições padrão. |
| `--motion-slow` | 200ms | Dialog, AlertDialog, backdrops. |
| `--motion-slowest` | 300ms | Sheet (entrada e saída simétricas). |
| `--z-overlay` | 40 | Backdrop de modal. |
| `--z-modal` | 50 | Dialog, AlertDialog, Sheet, CommandPalette. |
| `--z-popover` | 60 | Popover, Combobox, DateInput, DateRangePicker. |
| `--z-tooltip` | 70 | Tooltip. |
| `--z-toast` | 80 | Toaster (Sonner). |
| `--color-primary` | preto | CTA primário. |
| `--color-destructive` | vermelho ≥4.5:1 | Erros, ações destrutivas. |
| `--color-success` / `--color-warning` / `--color-info` | WCAG AA | Estados não-erro. |
| `--color-muted-foreground` | — | Texto secundário (description, captions). |
| `--color-input` / `--color-border` | — | Borda e placeholder de fields. |
| `--font-sans` | Geist | Texto. |
| `--font-mono` | Geist Mono | Campos numéricos, código, IDs (`tabular-nums`). |

Auditoria de contraste: `bun scripts/oklch-contrast.ts` (utilitário OKLCH → WCAG, ver commit `19281a9`).

---

## 8. Onde achar referências dentro do código

| Padrão | Arquivo exemplar |
|---|---|
| `FieldShell` (interno) | `src/primitives/_internal/field-shell.tsx` |
| `useFieldIds` (interno) | `src/primitives/_internal/use-field-ids.ts` |
| Field "simples" usando FieldShell | `src/primitives/input.tsx` |
| Field formatado com adornment (R$ / %) | `src/domain/currency-input.tsx` |
| Field sem `FieldShell` (controle inline) | `src/primitives/checkbox.tsx` |
| Wrapper de Radix Primitive | `src/overlays/dialog.tsx` |
| Componente puramente visual com `cva` | `src/primitives/button.tsx` |
| Tokens de motion compartilhados entre overlays | `src/overlays/_internal/animations.ts` |
| Helper de classes (`cn`) | `src/lib/utils.ts` |
| Tokens / cores / motion / z-index | `src/styles/tokens.css` |
| Barrel público | `src/index.ts` |
| Subpath exports | `package.json` (`exports`) |
| Configuração de build | `tsup.config.ts` |
| Lint / format | `biome.json` |
| Testes setup | `vitest.config.ts`, `vitest.setup.ts` |

---

## 9. Fluxo de release

A versionagem e o `CHANGELOG.md` são gerenciados via [changesets](https://github.com/changesets/changesets). O fluxo é simples e roda 100% local enquanto a CI não existe.

1. **Em cada PR funcional**, rode `bun run changeset`. O CLI faz três perguntas: qual pacote mudou (só temos `@amfernandesinc/ui`), qual o tipo de bump (`patch` para correções, `minor` para novidades, `major` para breaking — em pre-1.0 vale `minor` para breaking também) e uma frase descrevendo a mudança do ponto de vista do consumidor.
2. O arquivo gerado em `.changeset/*.md` (nome kebab-case aleatório) **vai commitado junto com o PR**. Ele substitui a necessidade de editar `CHANGELOG.md` manualmente. Se o PR não tem impacto visível pra consumidor (refactor interno, ajuste de teste, doc), pule esta etapa.
3. **Na hora do release**, rode `bun run changeset:version`. O CLI consome todos os arquivos em `.changeset/`, agrupa por tipo de bump, atualiza `package.json` (bump da versão) e prepende as entradas no `CHANGELOG.md`. Os arquivos `.changeset/*.md` consumidos são apagados — commite tudo num único commit `release: vX.Y.Z`.
4. **Publicação**: `bun run changeset:publish` empurra para o registro privado. Por enquanto manual; futuramente a CI cuida disso.

`bun x changeset status` mostra a qualquer momento quais changesets estão pendentes para o próximo release.

---

Dúvidas, sugestões ou propostas de mudança estrutural: abra issue antes do PR.
