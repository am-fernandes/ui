---
"@amfernandesinc/ui": minor
---

**`Sheet`: o painel vira uma coluna de verdade.** O painel era `display: block`, então o `gap-4` e o `mt-auto` do rodapé não faziam nada: título, descrição e corpo ficavam colados, o rodapé parava logo abaixo do conteúdo e um formulário longo empurrava o "Salvar" para fora da tela, sem rolagem.

Agora título, descrição, corpo e rodapé ficam a 16px um do outro, o rodapé vai para o fim do painel e o corpo (`[data-slot="sheet-body"]`) rola quando o conteúdo é mais alto que o espaço. Painéis `top` e `bottom` crescem com o conteúdo até a altura da tela menos 2rem.

**Ao atualizar:** se você colocava margem ou `py-4` no `children` para afastá-lo do título, remova: o espaço agora vem do painel.
