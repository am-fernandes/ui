---
"@amfernandesinc/ui": minor
---

**Tema escuro.** Ponha a classe `dark` no `<html>` (ou num ancestral) e todos os componentes trocam de tema: cada token de cor ganhou um valor em `.dark`, com o mesmo papel do claro, e o `color-scheme` acompanha (barras de rolagem e campos nativos escurecem junto).

- Os componentes não usam `dark:`: quem muda são os tokens. A variante `dark:` do Tailwind fica configurada para ajustes nas telas do app.
- No escuro, os preenchimentos de status (`--destructive`, `--success`, `--info`, `--warning`) ficam mais claros e o texto sobre eles fica escuro, porque branco não chegaria a 4,5:1. Popovers e menus ficam um tom acima do fundo, já que a lib não usa sombra (o Dialog já se separa pelo backdrop).
- Compatível com `next-themes` (`attribute="class"`) e com toggles do shadcn que já alternam `.dark`.
- `bun run audit:contrast` mede os pares que os componentes desenham nos dois temas (texto ≥ 4,5:1, anel de foco e tons sólidos ≥ 3:1), e o test-runner do Storybook roda o axe em cada story no claro e no escuro.
- Storybook: seletor **Claro / Escuro** na barra de ferramentas.
