---
"@amfernandesinc/ui": patch
---

**`Tour` encontra um alvo que aparece depois ou que é trocado.** O alvo de cada etapa era procurado uma vez só, quando ela abria. Se o elemento ainda não existia (dados carregando), o balão ficava no centro da tela; se o React trocava o nó por outro com o mesmo seletor, o destaque ia para o canto da página. Agora, enquanto a etapa está aberta, o `Tour` procura de novo quando a página muda e o alvo atual sumiu ou não foi achado.
