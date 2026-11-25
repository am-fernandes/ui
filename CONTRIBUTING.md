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

- **Claro e escuro.** Os dois temas usam os mesmos papéis de cor; o escuro liga com a classe `dark` no `<html>` (ou num ancestral). Componentes não usam `dark:`: quem muda são os tokens de `src/styles/tokens.css` (`:root` e `.dark`). Toda cor nova entra nos dois blocos e passa em `bun run audit:contrast`.
- **Flat.** Sem shadows, sem elevation tokens. Hierarquia é dada por borda, espaço e tipografia. A borda tem dois níveis da cor primária, translúcidos: `--border` (10%) para divisores e `--border-strong` (18%) para molduras; a dos campos (`--input`) é sólida, a 3:1 ou mais.
- **Raio por papel, três níveis.** `inner` 4px (peças dentro de um controle e peças baixas, como Badge e Token), `element` 8px (o controle), `container` 12px (superfícies que agrupam ou flutuam). Use `rounded-inner`, `rounded-element` e `rounded-container`; a escala do Tailwind cai nos três. Peça dentro de peça segue a conta do concêntrico (raio de dentro = raio de fora − espaço). `rounded-full` só para círculo. Detalhes e a lista por componente em Foundations/Radius.
- **Densidade enterprise.**
  - Body: `text-sm`.
  - Controles (botões, campos, gatilhos): altura fixa pelo `size` — `sm` 32px, `md` 40px (padrão), `lg` 44px, borda incluída — com `controlHeight`/`controlPaddingX` de `src/primitives/_internal/control-size.ts` (`h-control-*`). A altura não sai do padding: um campo e um botão do mesmo tamanho se alinham.
  - Linhas de tabela: `py-2.5 px-3`.
  - Menus / tabs / tree: `py-1.5`.
- **Cursor pointer em tudo clicável.** Botões, triggers de Radix, ícones interativos.
- **Foco (do Astryx).** Controles: um anel só, contorno de 2px na cor `--ring`, 3px afastado, em `:focus-visible` (`focus-visible:focus-outline`; `focus-visible:focus-outline-inset` onde um contêiner cortaria o anel). Campos: visual de campo (`field-states` no elemento que desenha a borda): borda `--primary` + anel interno de 2px da primária a 20% em qualquer foco, anel interno da borda a 30% no hover. Erro: `border-destructive field-error`. Nada de `ring-*` para foco.
- **Estados (do Astryx).** Hover e pressed são `state-layer`: uma camada da cor do texto do controle (5% e 10%) por cima do fundo, em qualquer variante. Estados que não são o ponteiro usam `state-hover` com a variante certa (`focus:state-hover` em item de menu). Pressed encolhe para 98% só com mouse e sem movimento reduzido: `motion-safe:pointer-fine:active:scale-[0.98]`. Não use `hover:bg-*/90` nem `hover:bg-accent` para hover.
- **Disabled.** `opacity-50` no shell + `cursor-default` no controle, sem reação a hover ou clique. Não duplique opacidade dentro do `FieldShell` (ver commit `944211f`).
- **Motion tokens (do Astryx).** `--duration-fast` (175ms), `--duration-medium-min/medium/medium-max` (310/410/550ms) e `--duration-exit` para toda saída, com `--ease-standard` na entrada e `--ease-exit` na saída. Overlays usam as combinações de `src/overlays/_internal/animations.ts`.
- **Z-index tokens.** `--z-overlay` (40), `--z-modal` (50), `--z-popover` (60), `--z-tooltip` (70), `--z-toast` (80). Nunca use `z-[999...]`.
- **WCAG AA** é o mínimo, nos dois temas. Contraste dos tokens em `bun run audit:contrast` (`scripts/contrast-audit.ts`); o test-runner do Storybook roda o axe em cada story no claro e no escuro.
- **pt-BR nas strings, trocáveis.** Todo texto visível ou lido pelo leitor de tela sai de `labels` (com `defaultXLabels` exportado) ou de uma prop de texto, com padrão pt-BR. Nada de texto fixo no JSX. Ver Foundations/i18n.

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
| `src/navigation/` | Estrutura de navegação. | `app-shell`, `tabs`, `breadcrumb`, `command-palette`. |
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

Variantes obrigatórias: `Default`, `WithError` (ou `Error`), `Disabled`, `Required`. Para fields, inclua também `WithDescription` e `ReadOnly`. Use `play` functions quando faz sentido validar interações — mas os testes de navegador (Passo 6) não abrem stories com `play`: crie uma story sem `play` para eles.

### Passo 6. Teste

Cobertura mínima:
1. Renderiza com label.
2. Renderiza com description (e aria-describedby aponta para ela).
3. Renderiza com error (`aria-invalid="true"` + `role="alert"`).
4. `disabled` desabilita interação.
5. `required` mostra o asterisco (ou `aria-required`).
6. Keyboard (Tab/Enter/Space conforme aplicável).
7. `ref` é encaminhado para o elemento DOM correto.
8. `readOnly` (fields): mostra o valor, recebe foco, não muda e vai no formulário.

E um teste de navegador em `tests/e2e/<nome>.spec.ts` (Playwright, contra o Storybook em `localhost:6006`): teclado de verdade, axe (WCAG 2.1 AA) nas stories, 360px de largura sem rolagem lateral, e cores forçadas quando uma cor carrega informação. O que só o navegador vê — altura medida, foco, `FormData`, contraste calculado — fica aqui, não no jsdom. Rode com `bun run test:e2e`.

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
bun run test:e2e   # com o Storybook rodando
```

Build deve sair sem warnings. Se aparecer warning de tsup, investigue antes de commitar.

### Passo 9. Atualizar a skill de agentes

A skill `skills/designing-with-amfernandesinc-ui/` ensina agentes (Claude Code e outros) a usar a lib nos apps. Ela tem duas partes:

- `reference/api/`: **gerada** dos tipos e do JSDoc de `src/`. Depois de mudar props, JSDoc, `labels` ou exports, rode `bun run skill:api` e commite o resultado. O teste `scripts/lib/skill-api.test.ts` falha enquanto ela estiver velha.
- `SKILL.md` e os demais guias de `reference/`: escritos à mão. Componente novo entra no mapa de componentes do `SKILL.md` e no guia da sua família. Todo bloco ` ```tsx ` dos guias é compilado contra a lib (`scripts/lib/skill-examples.test.ts`): um exemplo que não compila reprova o teste. Blocos que mostram o jeito errado começam com `// ❌`; os que dependem de um pacote do app que o repositório não tem (`next`, `zod`), com `// fora da verificação: <motivo>`.

---

## 6. Checklist do PR

Cole no corpo do PR e marque conforme avança:

- [ ] Componente implementado seguindo `docs/component-template/`
- [ ] `FieldShell` + `useFieldIds` usados (se for um field)
- [ ] ARIA: `aria-invalid`, `aria-describedby`, `aria-required`, `role` correto
- [ ] `displayName` setado
- [ ] Story com variantes `Default`, `Error`, `Disabled`, `Required` (`Description` quando aplicável)
- [ ] Teste cobrindo smoke + state + keyboard + ARIA wiring
- [ ] Teste de navegador em `tests/e2e/` com axe, teclado e 360px
- [ ] Cobertura local ≥95% (`bun run sync:coverage`)
- [ ] `bun run typecheck` limpo
- [ ] `bun run test` 100% pass
- [ ] `bun run build` sem warnings
- [ ] Textos em `labels` (ou prop de texto) com padrão pt-BR, `defaultXLabels` exportado
- [ ] Sem shadow; cores só por tokens (claro e escuro), sem `dark:` no componente
- [ ] `readOnly` e `disabled` em todo field
- [ ] Subpath export adicionado em `package.json` `exports`
- [ ] Adicionado em `src/index.ts` (barrel)
- [ ] `bun run skill:api` rodado; componente novo no `SKILL.md` e no guia da família em `skills/designing-with-amfernandesinc-ui/reference/`
- [ ] Commits no padrão Conventional (`feat:`, `fix:`, etc.) — um por mudança lógica
- [ ] Trailer `Co-Authored-By:` quando trabalho foi assistido por agente

---

## 7. Tokens de design

Definidos em `src/styles/tokens.css` dentro de `@theme inline`. Os mais usados:

| Token | Valor | Quando usar |
|---|---|---|
| `--radius-inner` / `--radius-element` / `--radius-container` | `4px` / `8px` / `12px` | Cantos por papel: `rounded-inner`, `rounded-element`, `rounded-container`. Ver Foundations/Radius. |
| `--duration-fast` | 175ms | Hover, Tooltip, DropdownMenu, Accordion, Collapsible; padrão de todo `transition*`. |
| `--duration-medium-min` | 310ms | Popover, Tour (entrada). |
| `--duration-medium` | 410ms | Sheet, menu mobile do AppShell. |
| `--duration-medium-max` | 550ms | Dialog, AlertDialog e backdrop (entrada). |
| `--duration-exit` | = `--duration-fast` | Toda saída, com `--ease-exit`. |
| `--z-overlay` | 40 | Backdrop de modal. |
| `--z-modal` | 50 | Dialog, AlertDialog, Sheet, CommandPalette. |
| `--z-popover` | 60 | Popover, Combobox, DateInput, DateRangePicker. |
| `--z-tooltip` | 70 | Tooltip. |
| `--z-toast` | 80 | Toaster (Sonner). |
| `--color-background` / `--color-card` / `--color-popover` | página / superfície / camada flutuante | A página é só a área de conteúdo; card, campo e botão outline pintam `card`; menu e dialog, `popover`. |
| `--color-primary` | marinho-950 | CTA primário, checkbox marcado. Hover e pressed: `--color-primary-hover` e `--color-primary-pressed`. |
| `--color-link` / `--color-ring` | azul funcional | Link, anel de foco, marcador do item ativo. |
| `--color-destructive` | fundo forte | Erros, ações destrutivas. Texto de erro sobre superfície: `--color-destructive-text`. |
| `--color-success` / `--color-warning` / `--color-info` | fundo forte | Estados não-erro. Sempre com o `-foreground` do token; não existe versão de fundo claro. |
| `--color-muted-foreground` / `--color-subtle-foreground` | — | Texto de apoio (description, captions) e terceiro nível (placeholder, dica). |
| `--color-input` / `--color-border` / `--color-border-strong` | — | Borda de campo, divisor e moldura. |
| `--font-sans` | Geist | Texto. |
| `--font-mono` | Geist Mono | Campos numéricos, código, IDs (`tabular-nums`). |

Auditoria de cor: `bun run audit:contrast` (contraste WCAG dos pares que os componentes desenham e distância entre status, categorias e séries de gráfico sob daltonismo simulado; falha se algum não passar).

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

A versionagem e o `CHANGELOG.md` são gerenciados via [changesets](https://github.com/changesets/changesets), e o **release roda automatizado pela CI** (ver §10).

1. **Em cada PR funcional**, rode `bun run changeset`. O CLI faz três perguntas: qual pacote mudou (só temos `@amfernandesinc/ui`), qual o tipo de bump (`patch` para correções, `minor` para novidades, `major` para breaking — em pre-1.0 vale `minor` para breaking também) e uma frase descrevendo a mudança do ponto de vista do consumidor.
2. O arquivo gerado em `.changeset/*.md` **vai commitado junto com o PR**. Ele substitui a necessidade de editar `CHANGELOG.md` manualmente. Se o PR não tem impacto visível pra consumidor (refactor interno, ajuste de teste, doc), pule esta etapa.
3. **Quando seu PR é merged**: o workflow `Release` (`.github/workflows/release.yml`) detecta os changesets pendentes e abre — ou atualiza — um PR chamado **"chore(release): version packages"**. Esse PR consolida todas as entradas em `CHANGELOG.md`, bumpa a versão em `package.json` e remove os arquivos `.changeset/*.md` consumidos.
4. **Para publicar**: revise e merge o PR "version packages". No próximo run do workflow, ele detecta que não há changesets pendentes e roda `bun run changeset:publish`, empurrando para o registro.

`bun x changeset status` mostra a qualquer momento quais changesets estão pendentes para o próximo release. Para acompanhar o fluxo no GitHub, veja a aba **Actions** → workflow **Release**.

## 10. Continuous Integration (CI)

A CI roda no GitHub Actions. Três workflows:

### `.github/workflows/ci.yml` — em todo PR e merge para `main`
Oito jobs em paralelo:

| Job | Comando | Falha bloqueia merge? |
|---|---|---|
| **Typecheck** | `bun run typecheck` | sim |
| **Lint** | `bun run lint` (biome) | sim |
| **Unit tests + coverage gate (95%)** | `bun run test:coverage` + `bun scripts/coverage-gate.ts` | sim |
| **Build** | `bun run build` | sim |
| **Build Storybook** | `bun run build-storybook` | sim |
| **Visual regression** | `bunx playwright install chromium && bun run test:visual` | sim |
| **E2E (Playwright)** | `bun run build-storybook` + `bun run test:e2e:ci` (os specs de `tests/e2e/` contra o Storybook estático, desktop + mobile + tablet, menos o visual) | sim |
| **Storybook tests (interaction + a11y)** | `bun run build-storybook` + `bun run test:storybook:ci` | sim |

Local equivalente: `bun run ci:local` roda todos exceto o visual (que precisa do Chromium headful).

O **coverage gate** falha se `lines`, `statements` ou `functions` ficarem abaixo de 95%. `branches` é reportado mas não bloqueia (métrica volátil). Atualmente estamos em ~97% / ~95% / ~92% — bem acima da margem.

### `.github/workflows/release.yml` — em todo merge para `main`
Roda `changesets/action@v1`. Comportamento:

- Se há changesets pendentes: abre/atualiza o PR **"chore(release): version packages"** (passo 3 acima).
- Se não há changesets pendentes (você acabou de mergear esse PR): roda `bun run changeset:publish`.

Secrets requeridos no repo:

- `GITHUB_TOKEN` — automático
- `NPM_TOKEN` — adicione manualmente em **Settings → Secrets and variables → Actions** antes do primeiro publish. Necessário porque `publishConfig.registry` aponta para o registro npm público. Se mudar para GitHub Packages (`https://npm.pkg.github.com`), o `GITHUB_TOKEN` já cobre.

### `.github/workflows/deploy-storybook.yml` — em todo merge para `main`
Builda o Storybook e publica em GitHub Pages.

**Setup único requerido** (uma vez):

1. **Settings → Pages** do repo → "Build and deployment" → Source = "GitHub Actions"
2. Não precisa configurar branch `gh-pages` — o workflow usa o `actions/deploy-pages` moderno.

A URL pública fica em `https://am-fernandes.github.io/ui` (mesmo com repo privado, no plano Team o site Pages é público — decisão consciente, conteúdo é só docs de componentes).

### Cancelamento de runs duplicados

Os workflows usam `concurrency: cancel-in-progress: true` na CI e no deploy do Storybook. Pushes consecutivos para a mesma PR cancelam runs anteriores automaticamente, economizando minutos.

### Como debugar uma falha de CI

1. Click na PR → aba **Checks** → escolha o job.
2. Para falha do **visual regression**: o artifact `playwright-report` é uploadado e contém HTML report com diff visual.
3. Para falha do **coverage gate**: o artifact `coverage` contém o report HTML completo (`coverage/index.html`).
4. Para falha do **build**: o artifact `dist` mostra exatamente o que o tsup gerou (ou não).

---

Dúvidas, sugestões ou propostas de mudança estrutural: abra issue antes do PR.
