---
"@amfernandesinc/ui": minor
---

**`Combobox` ganha `readOnly`.** Uma tela de consulta precisava usar `disabled`, a 50% de opacidade e fora do Tab e do envio. Com `readOnly`, a escolha aparece num fundo esmaecido, sem reação ao hover: o gatilho recebe foco e é lido (`aria-readonly`), a lista não abre, não há botão de limpar nem × nos itens, e o valor vai junto no envio do formulário.
