---
"@amfernandesinc/ui": minor
---

**`CEPInput` ganha `onComplete` e `loading`, para a consulta de endereço.** `onComplete(cep)` é chamado com os oito dígitos quando o CEP fica completo por uma edição (o oitavo dígito digitado, ou um CEP inteiro colado), e de novo se o CEP for corrigido; não dispara por um `value` que chega pronto. `loading` mostra um indicador dentro do campo, marca `aria-busy` e anuncia "Buscando endereço…" ao leitor de tela, sem travar a edição.

```tsx
<CEPInput label="CEP" value={cep} onValueChange={setCep} onComplete={buscarEndereco} loading={buscando} />
```

O texto anunciado fica em `labels` (`defaultCEPInputLabels`).
