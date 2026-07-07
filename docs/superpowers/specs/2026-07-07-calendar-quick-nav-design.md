# Calendar quick nav (seleção rápida de ano e mês)

**Data:** 2026-07-07 · **Status:** aprovado (brainstorm com Matheus)

## Problema

Para selecionar uma data 3 anos à frente no `DateInput`/`DateRangePicker`/`Calendar`,
o usuário precisa clicar 36× na seta de próximo mês. Não há como pular direto
para um ano/mês (referência de UX: MUI `DateCalendar`).

## Decisões

- **UX:** troca de view estilo MUI (não dropdowns no caption). Clicar no título
  "julho 2026" abre uma grade de **anos** no mesmo footprint do calendário;
  escolher o ano abre a grade de **meses**; escolher o mês volta para a grade
  de dias já posicionada.
- **Escopo:** comportamento **default** em `Calendar`, `DateInput` e
  `DateRangePicker` (nenhuma mudança nos consumidores). Só ativa quando
  `captionLayout === "label"` (o default) — quem passa `captionLayout="dropdown"`
  mantém o nativo do react-day-picker. Minor bump, sem breaking change.

## Design

- `src/forms/calendar.tsx`: estado `view: "days" | "years" | "months"` +
  mês exibido tornado controlável internamente (`month`/`defaultMonth`/
  `onMonthChange` do consumidor continuam respeitados). Override de
  `components.CaptionLabel` → botão ghost com chevron, `aria-expanded`.
  Quando `view !== "days"`, renderiza `CalendarQuickNav` no lugar do
  `DayPicker`.
- `src/forms/calendar-quick-nav.tsx` (interno): view de anos = grade 4 col.
  rolável com auto-scroll até o ano selecionado (selecionado `bg-primary`,
  ano corrente com contorno); view de meses = 3×4 pt-BR ("jan"…"dez") com
  header mostrando o ano pendente (volta para anos). `Esc` volta para dias
  sem alterar nada.
- **Limites:** com `startMonth`/`endMonth`, só os anos dentro do range são
  listados e meses fora do range no ano-limite ficam `disabled`. Sem props,
  range default 1900–2100 (como o MUI).
- **Range picker (2 meses):** o painel substitui o conteúdo inteiro; o mês
  escolhido vira o mês do pane esquerdo.
- **Regras do DS:** flat, raio 4px, densidade via `--cell-size`, tokens,
  pt-BR, sem animações gratuitas.

## Testes

Vitest + Testing Library (`calendar-quick-nav.test.tsx`): caption abre a view
de anos; fluxo ano→mês→dia reposiciona o grid; `onMonthChange` notificado;
`Esc` cancela; bounds respeitados; `captionLayout="dropdown"` não ativa o
quick nav.

## Entrega

Changeset `minor` → PR → release CI publica no npm → app Vértice faz bump
para `^0.4.0` (sem mudança de código).
