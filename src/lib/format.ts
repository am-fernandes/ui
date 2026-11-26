import {
  digitsOnly,
  dropCountryAndTrunkPrefix,
  filterCNPJ,
  maskCEP,
  maskCNPJ,
  maskCPF,
  maskPhone,
} from "./_internal/masks"

// The masks are the same as the fields' (CPFInput, CNPJInput, CEPInput,
// PhoneInput): a table and a form write a value the same way. A value that
// is not a whole document comes back clean, never half masked.

/** "12345678900" → "123.456.789-00" */
export function formatCPF(cpf: string): string {
  const d = digitsOnly(cpf)
  return d.length === 11 ? maskCPF(d) : d
}

/**
 * "12345678000190" → "12.345.678/0001-90"
 * "12ABC34501DE35" → "12.ABC.345/01DE-35" (CNPJ alfanumérico, letras em maiúsculas)
 */
export function formatCNPJ(cnpj: string): string {
  const d = filterCNPJ(cnpj)
  return d.length === 14 ? maskCNPJ(d) : d
}

/**
 * "11987654321" → "(11) 98765-4321"
 * "1134567890"  → "(11) 3456-7890"
 * "+55 11 98765-4321" → "(11) 98765-4321" (sem o código do país, como o PhoneInput)
 */
export function formatPhone(phone: string): string {
  const { value } = dropCountryAndTrunkPrefix(digitsOnly(phone))
  if (value.length === 10 || value.length === 11) return maskPhone(value)
  return phone
}

/** "01310100" → "01310-100" */
export function formatCEP(cep: string): string {
  const d = digitsOnly(cep)
  return d.length === 8 ? maskCEP(d) : d
}
