---
"@amfernandesinc/ui": patch
---

**Modal sem `description` não aponta mais para uma descrição inexistente.** `Dialog`, `Sheet` e `AlertDialog` sem `description` saíam com `aria-describedby` apontando para um id que nenhum elemento tinha, e o Radix avisava no console. Agora o atributo só existe quando há descrição. No `AlertDialog` a descrição continua recomendada: o Radix segue avisando, em desenvolvimento, quando ela falta.
