---
"@amfernandesinc/ui": patch
---

**`Pagination` nunca mostra "NaN".** Uma página que não é número (um `NaN` vindo de uma query string ruim) vira a página 1, e um total que não é número é ignorado no lugar de virar "NaN–NaN de 243". Em desenvolvimento, uma página fora do intervalo gera um aviso no console, porque o estado do consumidor ainda guarda o valor errado. A `DataTable` passa a página já ajustada enquanto volta para a última página depois que os dados encolhem.
