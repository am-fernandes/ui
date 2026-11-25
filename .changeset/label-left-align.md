---
"@amfernandesinc/ui": patch
---

**Rótulo à esquerda alinhado com a caixa do campo.** Com `labelPosition="left"`, o rótulo era centralizado no bloco inteiro: com descrição e erro abaixo da caixa, ele descia até 22px do centro do campo. Agora fica na linha da caixa, em qualquer `size`, por mais alto que seja o que vem abaixo.

Para alinhar os rótulos de um formulário numa coluna, defina a largura num contêiner: `<form className="[--field-label-width:8rem]">`.
