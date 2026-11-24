---
"@amfernandesinc/ui": minor
---

**`AppShell`: o grupo da página atual abre sozinho.** Quando `isActive` marca um filho (link direto para "Propostas › Aprovadas", por exemplo), o grupo já aparece aberto no primeiro render, no menu lateral e no menu do celular. No trilho recolhido, ou com o grupo fechado, o próprio grupo fica marcado como ativo (`aria-current="true"`), já que o filho não está à vista. O menu do celular também passa a lembrar os grupos que a pessoa abriu ou fechou entre uma abertura e outra.
