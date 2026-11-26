---
"@amfernandesinc/ui": minor
---

**`Skeleton` sai da árvore de acessibilidade e ganha `SkeletonGroup`.** Cada bloco era um `role="status"` vazio: uma tabela carregando virava 16 regiões vivas sem nada a dizer, e o leitor de tela não ouvia que algo carregava. Agora cada `Skeleton` é `aria-hidden`, e o novo `SkeletonGroup` em volta dos blocos de uma área é o único status e diz "Carregando…" uma vez (texto em `labels.loading`, padrão em `defaultSkeletonLabels`).

```tsx
<SkeletonGroup labels={{ loading: "Carregando propostas…" }} className="flex flex-col gap-2">
  <Skeleton className="h-4 w-48" />
  <Skeleton className="h-4 w-32" />
</SkeletonGroup>
```

Testes que procuravam o skeleton com `getByRole("status")` passam a achar o `SkeletonGroup`, ou devem usar `[data-slot="skeleton"]`.
