---
"@amfernandesinc/ui": minor
---

**`Video`: `objectFit` (padrão `contain`), `crossOrigin` livre, estados de carga e erro, `labels`.**

- O vídeo usava `object-cover` fixo, que cortava o tour vertical gravado no celular numa caixa 16:9. Agora `objectFit` é `"contain"` por padrão (o quadro aparece inteiro); passe `"cover"` para o comportamento antigo.
- Legendas não forçam mais `crossOrigin="anonymous"`, que impedia o vídeo de tocar em servidor sem cabeçalhos CORS. Legendas de outra origem precisam de `crossOrigin="anonymous"` passado por você; há um aviso em desenvolvimento.
- Um indicador de carregamento aparece até os metadados chegarem (`aria-busy` no invólucro). Em erro de rede, arquivo ausente ou codec, aparece "Não foi possível carregar o vídeo" com o botão "Tentar de novo", no lugar do player vazio. Os textos vêm de `labels` (`error`, `invalid`, `retry`) e os estados levam o nome do vídeo.
- Um `src` que começa recusado (prévia `blob:`) e passa a ser aceito agora carrega e entrega o `ref`.
- Aviso em desenvolvimento para `autoPlay` + `loop` sem `controls` (sem como pausar, WCAG 2.2.2).

**Como migrar:** para o corte antigo (o vídeo preenchendo a caixa), passe `objectFit="cover"`.
