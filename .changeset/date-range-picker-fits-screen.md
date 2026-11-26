---
"@amfernandesinc/ui": patch
---

**`DateRangePicker` cabe na tela.** No celular o popover empilhava dois meses e media mais de 700 px: começava acima do topo da tela e o "Confirmar" ficava fora dela; mesmo num notebook de 800 px de altura ele passava do topo. Agora, abaixo do breakpoint `md` (768 px), o calendário mostra um mês só, e o popover nunca passa do espaço que tem na tela: se for preciso, o calendário rola dentro dele e os botões "Limpar" e "Confirmar" continuam à vista.
