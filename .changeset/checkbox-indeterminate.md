---
"@amfernandesinc/ui": minor
---

**`Checkbox` ganha o estado misto.** `checked="indeterminate"` (ou `defaultChecked="indeterminate"`) mostra um traço e é anunciado como "parcialmente marcada": é o "selecionar todos" quando só parte dos itens está marcada. Um clique no estado misto marca a caixa.

`onCheckedChange` passa a receber sempre `true` ou `false`. Quem escrevia `onCheckedChange={(v) => setChecked(v === true)}` pode passar `setChecked` direto.
