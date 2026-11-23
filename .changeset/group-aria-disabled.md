---
"@amfernandesinc/ui": minor
---

**`RadioGroup` e `SegmentedControl` desabilitados dizem isso no grupo.** O Radix desabilita cada opção, mas o grupo (`role="radiogroup"`) não dizia que estava indisponível: o leitor de tela anunciava o nome do grupo como de um grupo ativo, e o axe cobrava contraste do rótulo esmaecido. Agora o grupo desabilitado tem `aria-disabled="true"`.
