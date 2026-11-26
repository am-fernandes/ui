---
"@amfernandesinc/ui": minor
---

**`DataTable` aceita `ref` e atributos na raiz.** `ref`, `id`, `data-*`, `title`, eventos e os demais atributos de `<div>` vão para o elemento raiz (`data-slot="data-table"`), como em `Card` e `EmptyState`. `aria-label` e `aria-labelledby` continuam indo para a `<table>`.
