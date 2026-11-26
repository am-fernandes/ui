---
"@amfernandesinc/ui": minor
---

**`Schedule`: altura da grade e eventos por dia no mês viram props.** `timeGridMaxHeight` (padrão `"36rem"`; número em px ou `"none"` para mostrar todas as horas sem rolagem interna) e `monthMaxEvents` (padrão 3, quantos eventos um dia do mês mostra antes de "+N mais") substituem os valores fixos. Os eventos passam a ser filtrados e ordenados só quando a lista ou o período mudam, não a cada minuto do relógio.
