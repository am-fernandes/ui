---
"@amfernandesinc/ui": minor
---

**Novos subpaths `@amfernandesinc/ui/lib/date` e `@amfernandesinc/ui/lib/format`.** Os helpers de data (`formatDate`, `parseDate`, `addMonths`…) e de formatação (`formatCPF`, `formatCNPJ`…) só podiam ser importados da raiz do pacote, ao contrário de `lib/brazil`, `lib/currency` e dos demais. Agora têm o próprio subpath, para quem importa só o helper sem passar pelo índice.
