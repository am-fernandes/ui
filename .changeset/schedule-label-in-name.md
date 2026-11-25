---
"@amfernandesinc/ui": patch
---

**`Schedule`: o nome de cada evento começa pelo que está escrito nele.** Quem usa controle por voz diz o texto que vê; um evento do mês mostra "15:00 Comitê de obras", mas se chamava "Comitê de obras, terça-feira, 3 de novembro, 15:00 – 16:30" (WCAG 2.5.3, rótulo no nome). Agora o nome segue a ordem da tela e completa com o que não aparece: no mês, "15:00 Comitê de obras, terça-feira, 3 de novembro, 15:00 – 16:30"; na semana e no dia, "Comitê de obras, 15:00 – 16:30, terça-feira, 3 de novembro"; na lista, "09:00 – 10:30 Daily, quarta-feira, 18 de novembro". Testes que acham eventos pelo nome com `^Título` precisam acompanhar a nova ordem.
