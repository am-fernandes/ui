---
"@amfernandesinc/ui": minor
---

**`addMonths` não estoura mais o fim do mês.** `addMonths("2024-01-31", 1)` devolve 29/02/2024 (antes, 02/03/2024): quando o mês de destino não tem o dia de origem, a data para no último dia dele. Parcelas com vencimento em 29, 30 ou 31 deixam de pular fevereiro. Para gerar um carnê, some a partir da data base (`addMonths(base, i)`), assim o vencimento volta ao dia 31 nos meses que têm 31.

**Como migrar:** revise os cálculos de vencimento que contavam com o estouro para o mês seguinte.
