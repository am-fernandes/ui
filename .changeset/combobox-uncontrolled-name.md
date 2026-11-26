---
"@amfernandesinc/ui": minor
---

**`Combobox` funciona sem estado externo e em formulário nativo.** Sem `value` e `onValueChange`, nada era selecionado, em silêncio. Agora, sem `value`, o campo guarda a própria escolha a partir de `defaultValue` (uma string, ou uma lista no modo `multiple`) e volta a ela no reset do formulário. Com `name`, um `<input type="hidden">` envia o valor bruto da opção (no modo múltiplo, uma entrada por valor, lida com `formData.getAll(name)`; sem nada escolhido, nenhuma entrada, como num `<select multiple>`); campo desabilitado não envia nada.
