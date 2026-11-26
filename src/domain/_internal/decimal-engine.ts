/**
 * Editing rules of the numeric fields (currency and percentage).
 *
 * The value is kept as an integer number of **units**: cents for money,
 * hundredths (or tenths, or whole points) for a percentage. Typed digits fill
 * the smallest unit first, so `1`, `5`, `0`, `0` shows `0,01`, `0,15`, `1,50`,
 * `15,00`. `null` is an empty field.
 */

/** Fifteen digits: what round-trips exactly through a float. */
export const MAX_UNITS = 999_999_999_999_999

export type Decimals = 0 | 1 | 2

const onlyDigits = (text: string) => text.replace(/\D/g, "")
const isDigit = (char: string) => char >= "0" && char <= "9"
const minusSigns = (text: string) => text.split(/[-−]/).length - 1

/** `1234.56` with two decimals is `123456` units. Not a number: `null`. */
export function toUnits(value: number | null | undefined, decimals: Decimals): number | null {
  if (value == null || !Number.isFinite(value)) return null
  return Math.round(value * 10 ** decimals)
}

export function fromUnits(units: number, decimals: Decimals): number {
  return units / 10 ** decimals
}

/**
 * The text of the field: `123456` units with two decimals is `1.234,56`.
 * `null` is an empty field. `negativeDraft` is a minus sign typed before any
 * digit: it shows (`-0,00`, or `-` alone) but is not part of the value yet.
 */
export function formatUnits(
  units: number | null,
  decimals: Decimals,
  negativeDraft = false,
): string {
  if (units == null) return negativeDraft ? "-" : ""
  const sign = units < 0 || (units === 0 && negativeDraft) ? "-" : ""
  const digits = String(Math.abs(units)).padStart(decimals + 1, "0")
  const integer = Number(digits.slice(0, digits.length - decimals)).toLocaleString("pt-BR")
  return decimals === 0 ? `${sign}${integer}` : `${sign}${integer},${digits.slice(-decimals)}`
}

export interface NumberEditInput {
  /** Units before the edit. */
  previous: number | null
  /** What the field showed before the edit. */
  previousText: string
  /** What the browser left in the field. */
  edited: string
  /** Caret position in `edited`. */
  caret: number
  inputType?: string
  allowNegative: boolean
  /** `true` when an empty field is `null`; `false` when it is zero. */
  allowEmpty: boolean
}

export interface NumberEdit {
  units: number | null
  negativeDraft: boolean
  /** The caret belongs where this many digits follow it. */
  digitsAfterCaret: number
  /** Which neighbour the caret stays against when a separator sits there. */
  stick: "left" | "right"
  /** The edit was not applied; `caret` says where the caret goes back to. */
  refused?: { caret: number }
}

/**
 * Turns what the browser left in the field into the new number of units.
 *
 * Every digit in the text counts, in order, and the leading zeros that only
 * pad the display (`0,05`) never do: a digit typed to the left of them lands
 * right before the first real digit. The caret is tracked by the digits that
 * follow it, because the number grows from the right.
 */
export function applyNumberEdit(input: NumberEditInput): NumberEdit {
  const { previous, previousText, edited, caret, inputType, allowNegative, allowEmpty } = input
  const deleting = inputType?.startsWith("delete") ?? false
  const typing = inputType === "insertText" || inputType === "insertCompositionText"
  const refuse = (): NumberEdit => ({
    units: previous,
    negativeDraft: previous === 0 || previous == null ? minusSigns(previousText) > 0 : false,
    digitsAfterCaret: 0,
    stick: "left",
    refused: { caret: Math.max(0, caret - Math.max(0, edited.length - previousText.length)) },
  })

  let before = onlyDigits(edited.slice(0, caret))
  let after = onlyDigits(edited.slice(caret))
  let stick: NumberEdit["stick"] = inputType === "deleteContentBackward" ? "right" : "left"

  if (deleting) {
    // A separator alone was deleted: the neighbouring digit goes with it.
    const sameDigits = before + after === onlyDigits(previousText)
    const sameSign = minusSigns(edited) === minusSigns(previousText)
    if (sameDigits && sameSign && edited.length === previousText.length - 1) {
      if (inputType === "deleteContentBackward") before = before.slice(0, -1)
      else if (inputType === "deleteContentForward") after = after.slice(1)
    }
  } else {
    // Digits after the caret beyond the real ones are padding zeros.
    const real = previous == null || previous === 0 ? "" : String(Math.abs(previous))
    if (after.length > real.length) after = after.slice(after.length - real.length)
  }

  let digits = (before + after).replace(/^0+/, "")
  if (digits.length > 15) {
    if (typing) return refuse()
    // A long text set at once: keep what fits and leave the caret at the end.
    digits = digits.slice(0, 15)
    after = ""
    stick = "left"
  }

  const hasDigits = /\d/.test(edited)
  const magnitude = digits === "" ? 0 : Number(digits)
  const negative = allowNegative && !edited.includes("+") && minusSigns(edited) % 2 === 1

  let units: number | null = negative ? -magnitude : magnitude
  if (allowEmpty && (!hasDigits || (deleting && previous === 0 && magnitude === 0))) units = null
  // `-0` is not a value: keep the sign aside until a digit gives it one.
  const negativeDraft = negative && magnitude === 0
  if (units != null && Object.is(units, -0)) units = 0

  return { units, negativeDraft, digitsAfterCaret: after.length, stick }
}

/**
 * Where the caret goes in `text` so that `digitsAfter` digits follow it.
 * Next to a separator there are two such places; `stick` picks the one
 * against the text that did not change.
 */
export function caretBeforeDigits(text: string, digitsAfter: number, stick: "left" | "right") {
  if (digitsAfter <= 0) return text.length
  let position = text.length
  let seen = 0
  while (position > 0 && seen < digitsAfter) {
    position -= 1
    if (isDigit(text.charAt(position))) seen += 1
  }
  if (stick === "right") return position
  // Against the digit on the left; with none (only a sign there), stay put.
  let left = position
  while (left > 0 && !isDigit(text.charAt(left - 1))) left -= 1
  return left > 0 ? left : position
}
