---
"@amfernandesinc/ui": patch
---

**`Combobox` abre na opção escolhida e diz qual é.** A lista abria sempre na primeira opção, com a escolhida fora da vista, e Enter logo depois de abrir trocava o valor pela primeira. Agora a lista abre com a escolhida (a primeira escolhida, no modo múltiplo) destacada e rolada até a vista, e Enter nela mantém o valor. O leitor de tela passa a saber o que está marcado: as opções escolhidas têm `aria-checked="true"`, separado do destaque do teclado (`aria-selected`).

Num `Combobox` único com `required`, clicar na opção já escolhida a mantém. Sem `required`, o clique nela continua limpando o campo.
