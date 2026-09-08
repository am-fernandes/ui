---
"@amfernandesinc/ui": minor
---

**DataTable**: `downloadable.filename` aceita `(scope: "filtered" | "page" | "all") => string`, permitindo refletir filtros ativos ou a página atual no nome do `.xlsx`. String continua funcionando igual; retorno falsy cai no default `"export.xlsx"`.
