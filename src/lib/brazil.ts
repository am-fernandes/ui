/**
 * Validadores para identificadores e contatos brasileiros.
 *
 * Os algoritmos de CPF/CNPJ implementam o cálculo oficial dos dígitos
 * verificadores (DV) definido pela Receita Federal:
 *   - CPF: módulo 11 sobre pesos decrescentes (10..2 para o primeiro DV,
 *     11..2 para o segundo). Resto < 2 → DV = 0, caso contrário 11 - resto.
 *   - CNPJ: módulo 11 sobre pesos `[5,4,3,2,9,8,7,6,5,4,3,2]` (primeiro DV)
 *     e `[6,5,4,3,2,9,8,7,6,5,4,3,2]` (segundo DV). Mesma regra do resto.
 *     No CNPJ alfanumérico (IN RFB 2.229/2024) as doze primeiras posições
 *     aceitam letras maiúsculas e cada caractere vale o código ASCII menos
 *     48: "0" é 0, "9" é 9, "A" é 17.
 *
 * Os helpers normalizam o input antes de validar: CPF, CEP e telefone ficam
 * só com os dígitos; o CNPJ fica com dígitos e letras, em maiúsculas.
 */

/** Remove tudo que não for dígito. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}

/** Mantém dígitos e letras sem acento, em maiúsculas (CNPJ alfanumérico). */
function alphanumericOnly(value: string): string {
  return value.replace(/[^0-9a-z]/gi, "").toUpperCase()
}

/** Verdadeiro se a string tem todos os dígitos iguais (ex.: "11111111111"). */
function allSameDigits(value: string): boolean {
  return value.length > 0 && /^(\d)\1+$/.test(value)
}

/**
 * Lê o caractere em `digits[index]` como número: código ASCII menos 48
 * (0 se fora do range). Para dígitos dá 0 a 9; para as letras do CNPJ
 * alfanumérico, 17 ("A") a 42 ("Z").
 */
function digitAt(digits: string, index: number): number {
  const ch = digits.charAt(index)
  if (ch === "") return 0
  return ch.charCodeAt(0) - 48
}

/**
 * Valida um CPF (11 dígitos) usando o algoritmo oficial de DV.
 * Rejeita strings de dígitos repetidos.
 */
export function isValidCPF(value: string): boolean {
  const digits = digitsOnly(value)
  if (digits.length !== 11) return false
  if (allSameDigits(digits)) return false

  // Primeiro DV
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += digitAt(digits, i) * (10 - i)
  }
  let remainder = sum % 11
  const dv1 = remainder < 2 ? 0 : 11 - remainder
  if (dv1 !== digitAt(digits, 9)) return false

  // Segundo DV
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += digitAt(digits, i) * (11 - i)
  }
  remainder = sum % 11
  const dv2 = remainder < 2 ? 0 : 11 - remainder
  if (dv2 !== digitAt(digits, 10)) return false

  return true
}

/**
 * Valida um CNPJ (14 caracteres) usando o algoritmo oficial de DV. Aceita o
 * formato numérico e o alfanumérico: doze posições com dígitos ou letras e
 * dois dígitos verificadores numéricos. Letras minúsculas são lidas como
 * maiúsculas. Rejeita strings de dígitos repetidos.
 *
 * Qualquer letra conta como parte do número: `"CNPJ 11.222.333/0001-81"` não
 * é um CNPJ válido, `"11.222.333/0001-81"` é.
 * @example isValidCNPJ("12.ABC.345/01DE-35") → true
 */
export function isValidCNPJ(value: string): boolean {
  const digits = alphanumericOnly(value)
  if (!/^[0-9A-Z]{12}\d{2}$/.test(digits)) return false
  if (allSameDigits(digits)) return false

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const

  // Primeiro DV
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += digitAt(digits, i) * (weights1[i] ?? 0)
  }
  let remainder = sum % 11
  const dv1 = remainder < 2 ? 0 : 11 - remainder
  if (dv1 !== digitAt(digits, 12)) return false

  // Segundo DV
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += digitAt(digits, i) * (weights2[i] ?? 0)
  }
  remainder = sum % 11
  const dv2 = remainder < 2 ? 0 : 11 - remainder
  if (dv2 !== digitAt(digits, 13)) return false

  return true
}

/** Valida um CEP — exatamente 8 dígitos numéricos. */
export function isValidCEP(value: string): boolean {
  const digits = digitsOnly(value)
  return digits.length === 8
}

/**
 * Valida um telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular).
 * O DDD (primeiros 2 dígitos) deve estar entre 11 e 99.
 */
export function isValidPhone(value: string): boolean {
  const digits = digitsOnly(value)
  if (digits.length !== 10 && digits.length !== 11) return false
  const ddd = Number.parseInt(digits.slice(0, 2), 10)
  if (Number.isNaN(ddd) || ddd < 11 || ddd > 99) return false
  return true
}
