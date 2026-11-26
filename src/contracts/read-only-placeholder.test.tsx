import path from "node:path"

import { render } from "@testing-library/react"
import type * as React from "react"
import { describe, expect, it } from "vitest"

import { componentsWithProp } from "../../scripts/lib/component-props"
import { createProgram } from "../../scripts/lib/skill-api"
import { CEPInput } from "../domain/cep-input"
import { CNPJInput } from "../domain/cnpj-input"
import { CPFInput } from "../domain/cpf-input"
import { CurrencyInput } from "../domain/currency-input"
import { MultiInput } from "../domain/multi-input"
import { PercentageInput } from "../domain/percentage-input"
import { PhoneInput } from "../domain/phone-input"
import { Combobox } from "../forms/combobox"
import { DateInput } from "../forms/date-input"
import { DateRangePicker } from "../forms/date-range-picker"
import { Select } from "../forms/select"
import { TimePicker } from "../forms/time-picker"
import { Input } from "../primitives/input"
import { NumberInput } from "../primitives/number-input"
import { Textarea } from "../primitives/textarea"

/**
 * Contract of every field that has a placeholder: read-only and empty, it
 * shows none. A read-only field is painted with `--muted`, and the
 * placeholder colour (`--placeholder`, the third text level) reaches only
 * 4.3:1 on it in the light theme and 4.1:1 in the dark one, under the 4.5:1
 * WCAG 1.4.3 asks of text (read-only, unlike disabled, is not exempt). A hint
 * to type ("dd/mm/aaaa", "Selecione...") in a field that takes no typing is
 * also the wrong hint.
 */

const HINT = "Dica de preenchimento"
const options = [{ value: "a", label: "Alpha" }]

type Field = {
  name: string
  field: (readOnly: boolean) => React.ReactElement
  /** The hint the field shows when editable (its own default, or `HINT`). */
  hint?: string
}

const fields: Field[] = [
  { name: "Input", field: (ro) => <Input label="Campo" placeholder={HINT} readOnly={ro} /> },
  { name: "Textarea", field: (ro) => <Textarea label="Campo" placeholder={HINT} readOnly={ro} /> },
  {
    name: "NumberInput",
    field: (ro) => <NumberInput label="Campo" placeholder={HINT} readOnly={ro} />,
  },
  { name: "CPFInput", field: (ro) => <CPFInput label="Campo" placeholder={HINT} readOnly={ro} /> },
  {
    name: "CNPJInput",
    field: (ro) => <CNPJInput label="Campo" placeholder={HINT} readOnly={ro} />,
  },
  { name: "CEPInput", field: (ro) => <CEPInput label="Campo" placeholder={HINT} readOnly={ro} /> },
  {
    name: "PhoneInput",
    field: (ro) => <PhoneInput label="Campo" placeholder={HINT} readOnly={ro} />,
  },
  {
    name: "CurrencyInput",
    field: (ro) => <CurrencyInput label="Campo" emptyValue="null" value={null} readOnly={ro} />,
    hint: "0,00",
  },
  {
    name: "PercentageInput",
    field: (ro) => <PercentageInput label="Campo" emptyValue="null" value={null} readOnly={ro} />,
    hint: "0,00",
  },
  {
    name: "MultiInput",
    field: (ro) => <MultiInput label="Campo" placeholder={HINT} readOnly={ro} />,
  },
  {
    name: "DateInput",
    field: (ro) => <DateInput label="Campo" readOnly={ro} />,
    hint: "dd/mm/aaaa",
  },
  {
    name: "DateRangePicker",
    field: (ro) => <DateRangePicker label="Campo" placeholder={HINT} readOnly={ro} />,
  },
  { name: "TimePicker", field: (ro) => <TimePicker label="Campo" readOnly={ro} />, hint: "--" },
  {
    name: "Combobox",
    field: (ro) => <Combobox label="Campo" options={options} placeholder={HINT} readOnly={ro} />,
  },
  {
    name: "Select",
    field: (ro) => <Select label="Campo" options={options} placeholder={HINT} readOnly={ro} />,
  },
]

/** The hint, as an attribute of a text field or as text on a trigger. */
function hintsShown(container: HTMLElement, hint: string): string[] {
  const attributes = [...container.querySelectorAll("[placeholder]")]
    .map((el) => el.getAttribute("placeholder") ?? "")
    .filter((text) => text !== "")
  const texts = (container.textContent ?? "").includes(hint) ? [hint] : []
  return [...attributes, ...texts]
}

describe.each(fields)("$name", ({ field, hint = HINT }) => {
  it("shows its placeholder while editable (so this test means something)", () => {
    const { container } = render(field(false))
    expect(hintsShown(container, hint)).not.toEqual([])
  })

  it("read-only and empty, shows no placeholder", () => {
    const { container } = render(field(true))
    expect(hintsShown(container, hint)).toEqual([])
  })
})

describe("read-only placeholder contract coverage", () => {
  it("every exported field with `placeholder` and `readOnly` is checked here", () => {
    const root = path.join(__dirname, "..", "..")
    const program = createProgram(root)
    const readOnly = componentsWithProp(program, root, "readOnly")
    const withBoth = componentsWithProp(program, root, "placeholder").filter((name) =>
      readOnly.includes(name),
    )
    const checked = new Set(fields.map((f) => f.name))
    expect(withBoth.filter((name) => !checked.has(name))).toEqual([])
  }, 120_000)
})
