---
"@amfernandesinc/ui": minor
---

**Colar em `CPFInput`, `CNPJInput`, `CEPInput` e `PhoneInput` não perde mais dígitos.** O campo tinha `maxLength` do tamanho da máscara, e o navegador cortava o texto colado antes da limpeza: `" 529.982.247-25"` virava `529.982.247-2` e `"CPF: 529.982.247-25"` virava `529.982.2`. O `maxLength` saiu; o texto é limpo primeiro e limitado depois, e o número é achado no meio de rótulo, espaço e outros números (o CEP no fim de um endereço colado, por exemplo). Um número completo colado substitui o que estava no campo.

No `PhoneInput`, um número com mais de 11 dígitos perde o código do país e o zero de operadora: `+55 11 98765-4321` e `011 98765-4321` viram `(11) 98765-4321` (antes, `(55) 11987-6543`, que passava em `isValidPhone`). Vale também para quem digita o 55 na frente e para um `value` que já chega com ele.

Quem digitava num campo cheio continua sem conseguir: a tecla é recusada, sem empurrar o último dígito para fora.
