---
"@amfernandesinc/ui": minor
---

**`Schedule` aceita `locale`.** Os nomes de dias e meses e a ordem das datas vinham fixos em português, mesmo com `labels`. A nova prop `locale` ("pt-BR" por padrão, "en-US", "es"...) passa a decidir esses nomes e formatos, pelo `Intl` do navegador; os textos fixos continuam em `labels`. Em pt-BR nada muda: "15 – 21 de nov. de 2026", "sábado, 21 de novembro".
