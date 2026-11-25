---
"@amfernandesinc/ui": patch
---

**`Button` em `loading` mantém o foco e a largura.** Antes o `loading` desabilitava o botão de verdade: quem apertava Enter em "Salvar" perdia o foco do teclado para o corpo da página, o spinner entrava antes do texto e alargava o botão (de 127 para 151px num "Salvar proposta") e o leitor de tela não ouvia nada.

Agora, enquanto `loading`:

- o botão fica `aria-disabled` e `aria-busy`, continua focado e ignora clique, Enter, espaço e o Enter dado num campo do formulário (nada é enviado duas vezes);
- o spinner fica no lugar do rótulo, que continua ocupando o seu espaço: a largura não muda. O rótulo não aparece durante o carregamento, então não troque o texto para "Salvando...";
- o início é anunciado ao leitor de tela ("Carregando…", ajustável com `labels={{ loading: "Salvando proposta" }}`; padrão em `defaultButtonLabels`).

Um `disabled` passado junto com `loading` continua desabilitando o botão de verdade. Testes que esperavam `toBeDisabled()` num botão só com `loading` devem conferir `aria-disabled="true"`.
