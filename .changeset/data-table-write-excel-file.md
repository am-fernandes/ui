---
"@amfernandesinc/ui": minor
---

**`DataTable`: exportação sem o pacote `xlsx`.** O `.xlsx` agora é gerado com `write-excel-file` (MIT, sem alertas de segurança), no lugar do `xlsx@0.18.5`, que tem dois alertas de severidade alta sem versão corrigida no npm. Continua sendo carregado só no primeiro export. A dependência `xlsx` sai do pacote.

Datas (`Date`) saem como datas do Excel no mesmo dia e hora que a tabela mostra, em qualquer fuso do navegador: antes, uma data à meia-noite em São Paulo abria no Excel como o dia anterior. O cabeçalho sai em negrito e congelado, e as colunas com a largura do conteúdo. Nomes terminados em `.xls`, `.xlsm`, `.xlsb`, `.ods` ou `.txt` passam a sair como `.xlsx` (é o formato gravado); `.csv` continua CSV.
