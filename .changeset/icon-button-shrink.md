---
"@amfernandesinc/ui": patch
---

**`IconButton` não encolhe mais numa linha apertada.** Num `flex` sem espaço, o botão de 40px era espremido até uns 19px de largura e deixava de ser quadrado (e de ser um alvo de 24px). Agora ele mantém o tamanho e quem cede é o texto ao lado.
