---
"@amfernandesinc/ui": minor
---

**Token** (novo): chip compacto para metadados, filtros e seleções (`@amfernandesinc/ui/token`).

- 9 cores categóricas (`gray`, `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `purple`, `pink`) sobre os novos tokens `--category-*`; texto ≥ 7,3:1 sobre o fundo.
- `onRemove` mostra o × (“Remover {label}”); `onClick` torna o chip inteiro um botão; `href` (+ `target`), um link com checagem de protocolo.
- O clique e o × são irmãos, nunca aninhados: a área clicável cobre o chip todo e o × fica por cima, sem disparar o clique.
- `size` (`md` = 28px, `sm` = 24px), `icon`, `disabled` e `labels`.
- Diferente do `Badge`: o `Badge` é rótulo de status em cor sólida; o `Token` é chip claro, clicável e removível.
