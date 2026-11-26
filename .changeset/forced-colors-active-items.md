---
"@amfernandesinc/ui": patch
---

**Item ativo visível em alto contraste na `CommandPalette` e no menu do trilho do `AppShell`.** O item marcado pelas setas tinha só a camada de cor (`state-hover`), uma imagem de fundo que o modo de cores forçadas do Windows remove. Na `CommandPalette` o foco fica no campo de busca, então nem o anel aparecia: dava para andar com as setas sem ver onde estava, e o Enter executava um comando às cegas. Agora o item ativo ganha um contorno nesse modo (como no `Combobox`), e as linhas do menu do trilho recolhido ganham o realce do sistema (como no `DropdownMenu`).
