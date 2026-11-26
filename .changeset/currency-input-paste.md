---
"@amfernandesinc/ui": minor
---

**Colar no `CurrencyInput` não erra mais o valor por 10 ou 100 vezes.** A colagem seguia a regra da digitação (centavos primeiro): `350.000` copiado de uma planilha virava R$ 3.500,00 e `1.234,5` virava R$ 123,45. Agora o texto colado é lido como um número escrito por um brasileiro e substitui o valor do campo: com vírgula, ela é o separador decimal (`1500,5` → R$ 1.500,50); sem vírgula, um ponto seguido de um ou dois dígitos é decimal (`2350.9`, `1500.00`) e os demais pontos são de milhar (`350.000`); sem separador são reais inteiros (`1500` → R$ 1.500,00). `R$`, espaços e texto em volta são ignorados. A digitação continua preenchendo os centavos primeiro.

O leitor também é exportado: `parseBRNumber("R$ 2.350,90")` devolve `2350.9`, e `null` quando o texto não tem número.
