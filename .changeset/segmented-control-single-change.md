---
"@amfernandesinc/ui": patch
---

**`SegmentedControl` controlado chama `onValueChange` uma vez por seta.** Com `value` controlado, cada seta do teclado disparava `onValueChange` duas vezes com o mesmo valor (`["semana", "semana"]`): uma seleção do componente e outra do Radix, antes de o pai renderizar de novo. Quem buscava dados, registrava analytics ou fazia `router.push` no callback fazia tudo em dobro. Agora é uma chamada por troca, com a tecla segurada ou num toque rápido.
