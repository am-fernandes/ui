---
"@amfernandesinc/ui": minor
---

**`AppShell`: o trilho recolhido não perde informação.** O `badge` de um item virava nada no trilho (o leitor ouvia só "Leads, link"); agora aparece um ponto ao lado do ícone e a contagem entra no nome acessível ("Leads, 3"). Um item sem `icon` virava um link vazio; agora mostra a inicial do rótulo. O rótulo segue no DOM, escondido da vista, como nome do item.
