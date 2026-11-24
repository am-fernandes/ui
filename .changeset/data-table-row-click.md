---
"@amfernandesinc/ui": minor
---

**`DataTable`: a linha clicável continua sendo linha.** Com `onRowClick`, o `<tr>` deixa de ser `role="button"`: o leitor de tela volta a ver as linhas e as células da tabela, e o teclado chega à ação por um `<button>` que envolve o conteúdo da primeira célula, com o mesmo nome (Tab, Enter, Espaço). O clique do mouse em qualquer ponto da linha continua chamando `onRowClick`.

Clique ou tecla que começa num controle dentro da linha (botão, link, campo, menu de ações, inclusive o conteúdo do menu aberto em portal) agora é só do controle: não chama mais `onRowClick` nem cancela a ação do controle. Testes que procuravam a linha com `getByRole("button")` passam a procurar o botão pelo texto da primeira célula.
