---
"@amfernandesinc/ui": minor
---

**Combobox**: a busca passa a considerar o `label` das opções, além do `value`, e ignora acentos (`coracao` encontra `Coração`).

- Vale para o modo normal e para o `creatable`, que usam o mesmo filtro. A busca é por trecho, sem o ranqueamento fuzzy do cmdk: a ordem das opções é mantida.
- O `value` continua pesquisável.
- A lista do dropdown não propaga o scroll para o container pai (página, Sheet ou Dialog) nem em desktop nem em toque.

Sem mudança de tipos públicos.
