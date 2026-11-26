---
"@amfernandesinc/ui": minor
---

**No `MultiInput`, `maxItems` recusa os itens novos em vez de descartar os antigos.** No modo número a lista era ordenada e depois cortada: `[10, 20, 30]` mais `5` com limite 3 virava `[5, 10, 20]`, e o 30 que já estava lá sumia. Agora quem já está na lista fica; os novos entram na ordem digitada enquanto há espaço e os demais são recusados com `onReject("max-items")`.

Com a lista cheia, `onValueChange` não é mais chamado e o texto digitado continua no campo, para a pessoa ver que não entrou. Um item repetido também não dispara `onValueChange`.
