/**
 * The masks of the Brazilian documents and numbers, shared by the formatting
 * helpers (`lib/format`) and the fields that edit them (`CPFInput`,
 * `CNPJInput`, `CEPInput`, `PhoneInput`), so a table and a form always write
 * a value the same way. Each mask takes the clean value and also formats a
 * partial one, as the user types it.
 */

/** Only the digits of `text`. */
export function digitsOnly(text: string): string {
  return text.replace(/\D/g, "")
}

/** `000.000.000-00` over clean digits. */
export function maskCPF(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}

/** `XX.XXX.XXX/XXXX-DD` over the clean value (digits, or capitals in the first twelve). */
export function maskCNPJ(raw: string): string {
  const d = raw.slice(0, 14)
  if (d.length <= 2) return d
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`
}

/**
 * The clean value of a CNPJ: digits anywhere; letters without accent, in
 * capitals, only in the first twelve (the two check digits are numeric).
 */
export function filterCNPJ(text: string): string {
  let kept = ""
  for (const char of text) {
    if (char >= "0" && char <= "9") kept += char
    else if (kept.length < 12) {
      if (char >= "A" && char <= "Z") kept += char
      else if (char >= "a" && char <= "z") kept += char.toUpperCase()
    }
  }
  return kept
}

/** `00000-000` over clean digits. */
export function maskCEP(digits: string): string {
  const d = digits.slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`
}

/** `(00) 0000-0000` with 10 digits, `(00) 00000-0000` with 11. */
export function maskPhone(digits: string): string {
  const d = digits.slice(0, 11)
  if (d.length === 0) return ""
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
}

/**
 * A number with more than 11 digits came with something before the area
 * code: the country code (`55`) and, after it, the carrier's trunk zero
 * (`011`). With 11 digits or fewer nothing is dropped: `55` is also an area
 * code (Santa Maria, RS).
 */
export function dropCountryAndTrunkPrefix(digits: string) {
  let value = digits
  if (value.length > 11 && value.startsWith("55")) value = value.slice(2)
  if (value.length > 11 && value.startsWith("0")) value = value.slice(1)
  return { value, dropped: digits.length - value.length }
}
