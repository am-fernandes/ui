---
"@amfernandesinc/ui": minor
---

**DataTable**: `downloadable.filename` aceita `(scope: "filtered" | "page" | "all") => string`, permitindo refletir filtros ativos ou a página atual no nome do `.xlsx`. String continua funcionando igual; retorno falsy cai no default `"export.xlsx"`. A função não deve lançar: uma exceção interrompe a exportação. O tipo `ExportScope` passa a ser exportado para anotar a função. `.xlsx` é acrescentado ao final quando o nome resolvido não termina em extensão de planilha ou CSV (`.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.csv`, `.ods`, `.txt`). Nomes com essas extensões são salvos como informados, como antes.
