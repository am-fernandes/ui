---
"@amfernandesinc/ui": patch
---

**`SegmentedControl` desabilitado fica a 50%, não a 25%.** Com `disabled` no controle inteiro, a trilha e cada segmento aplicavam `opacity-50` ao mesmo tempo, e o texto ficava a 25%, quase ilegível. Agora a opacidade entra uma vez só: na trilha quando o controle todo está desabilitado, no segmento quando só aquela opção está.
