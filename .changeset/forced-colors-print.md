---
"@amfernandesinc/ui": minor
---

**Estados continuam visíveis com cores forçadas e na impressão.** O sistema é flat e muito estado era só um preenchimento. Com o Alto Contraste do Windows (`forced-colors: active`) o navegador troca os fundos pela cor da página: o `Toggle` ligado ficava igual ao desligado, o segmento escolhido do `SegmentedControl` sumia, o `Switch` ligado ficava igual ao desligado, e o `Separator` e o `Skeleton` desapareciam. Agora o que está ligado, marcado ou escolhido usa as cores de seleção do sistema (`Highlight`), o polegar do `Switch` é sólido, o `Separator` vira uma linha e o `Skeleton` um bloco cinza. O `Button` `link` não ganha moldura.

Na impressão sem gráficos de fundo, `Toggle`, `SegmentedControl`, `Switch`, `Checkbox` e `Button` pedem `print-color-adjust: exact`: o Checkbox marcado não sai mais vazio e o texto branco do botão primário não some.
