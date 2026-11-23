---
"@amfernandesinc/ui": minor
---

**`MultiInput` ganha `labels`.** Os textos fixos do campo ("Adicione um item", "Adicione um número", "Lista de itens", "Lista de números" e o "Remover …" de cada item) entram em `labels?: Partial<MultiInputLabels>`, com os padrões em português exportados como `defaultMultiInputLabels`. As props `placeholder` e `aria-label` continuam valendo e ganham de `labels`.
