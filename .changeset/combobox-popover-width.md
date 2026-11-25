---
"@amfernandesinc/ui": patch
---

**`Combobox`: a lista tem a largura do campo.** A classe de largura do popover estava escrita no formato do Tailwind 3 e o Tailwind 4 a ignorava: num campo de 396 px a lista abria com 252 px. Agora ela acompanha o gatilho (a prop `popoverWidth` continua valendo). O `aria-controls` do gatilho passa a apontar para a lista que está na tela, e o gatilho deixa de declarar `aria-autocomplete`, que não se aplica a um botão.
