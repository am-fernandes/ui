---
"@amfernandesinc/ui": minor
---

**Stepper** (novo): sequência numerada de etapas para fluxos longos (`@amfernandesinc/ui/stepper`). Data-driven, como `Tabs`.

- `steps`: `{ label, description?, optional?, disabled?, status?: "error" | "warning", content? }`. `activeStep` começa em 0: as anteriores ficam concluídas, e `activeStep={steps.length}` conclui todas.
- Indicadores com número, check (concluída) ou ícone de erro/alerta. Linhas de ligação preenchidas até a etapa atual.
- `onStepClick` deixa as etapas clicáveis (navegação não linear). Etapas `disabled` não podem ser escolhidas.
- `orientation="vertical"` empilha as etapas e mostra o `content` da etapa atual embaixo dela.
- Na horizontal, quando o contêiner não comporta as etapas, vira um resumo "Etapa 2 de 4 · Endereço" com barra de progresso (e setas, com `onStepClick`). O corte usa container queries, não a largura da tela.
- Leitor de tela: lista ordenada "Progresso", `aria-current="step"` na etapa atual e estado de cada etapa (concluída, etapa atual, com erro).
