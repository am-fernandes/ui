---
"@amfernandesinc/ui": minor
---

**`DataTable`: `.csv` para o Excel brasileiro.** Com `downloadable.filename` terminado em `.csv`, a lib escreve ela mesma o arquivo: UTF-8 com BOM (os acentos abrem certos), `;` entre as células, vírgula decimal sem separador de milhar, datas em `dd/mm/aaaa` (com `hh:mm` quando há hora) e `'` na frente de texto que começa com `=`, `+`, `-` ou `@`, para o Excel não rodá-lo como fórmula. Antes o arquivo saía com vírgula como separador, `1234.56`, datas `5/18/26` e fórmulas vivas.
