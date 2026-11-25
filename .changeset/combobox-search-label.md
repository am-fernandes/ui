---
"@amfernandesinc/ui": patch
---

**`Combobox`: a busca olha o rótulo e as palavras-chave, não o `value`.** Com ids numéricos como valor, digitar "10" achava a opção de id 101 mesmo sem "10" no texto dela. Agora a busca compara só o que a pessoa lê, sem acento nem caixa. Para achar uma opção por outro termo (sigla, código, nome antigo), passe `keywords` nela: `{ value: "1", label: "São Paulo", keywords: ["SP"] }`.
