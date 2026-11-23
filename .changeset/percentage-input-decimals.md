---
"@amfernandesinc/ui": minor
---

**`PercentageInput` ganha `decimals`.** O campo só tinha duas casas. `decimals` aceita `2` (o padrão, `12,50`), `1` (`12,5`) ou `0` (`12`): os dígitos digitados preenchem a última casa primeiro, um valor colado é arredondado para as casas do campo e o pai recebe o número já nessa precisão.
