---
"@amfernandesinc/ui": minor
---

**`Breadcrumb`: trilha longa recolhida, nome em português e lista válida.** `maxItems` mostra o primeiro passo, um botão "…" com os passos ocultos num menu e os últimos. O `<nav>` passa a se chamar "Trilha de navegação" (texto em `labels.navigation`; `ariaLabel` continua funcionando, mas está obsoleto). Os separadores ficam dentro de cada item e escondidos do leitor de tela, então a lista passa na regra `list` do axe. Um passo do meio sem `href` aparece como texto simples; só a página atual fica em destaque.
