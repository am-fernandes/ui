function digitsOnly(value: string): string {
  return value.replace(/\D/g, "")
}

/** "12345678900" → "123.456.789-00" */
export function formatCPF(cpf: string): string {
  return digitsOnly(cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/** "12345678000190" → "12.345.678/0001-90" */
export function formatCNPJ(cnpj: string): string {
  return digitsOnly(cnpj).replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5",
  )
}

/**
 * "11987654321" → "(11) 98765-4321"
 * "1134567890"  → "(11) 3456-7890"
 */
export function formatPhone(phone: string): string {
  const d = digitsOnly(phone)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return phone
}

/** "01310100" → "01310-100" */
export function formatCEP(cep: string): string {
  return digitsOnly(cep).replace(/(\d{5})(\d{3})/, "$1-$2")
}
