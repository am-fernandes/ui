---
"@amfernandesinc/ui": minor
---

**`AppShell`: seções, `target` e motivo de item desabilitado.** Os itens agora ficam em listas (`ul`/`li`), e o leitor de tela anuncia quantos são e a hierarquia dos grupos. Um item `{ type: "section", label: "Vendas", items: [...] }` dá título a um conjunto de itens (o título é o nome da lista; no trilho recolhido vira um divisor). Links aceitam `target` (`"_blank"` também põe `rel="noopener noreferrer"`), e `disabledReason` num item `disabled` explica por quê ("Disponível para o perfil Gestor") num tooltip; o item segue alcançável pelo teclado e lê o motivo como descrição.
