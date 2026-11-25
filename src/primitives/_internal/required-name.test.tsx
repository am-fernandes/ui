import { render, screen } from "@testing-library/react"
import { computeAccessibleName } from "dom-accessibility-api"
import type * as React from "react"
import { describe, expect, it } from "vitest"

import {
  CEPInput,
  CNPJInput,
  CPFInput,
  Combobox,
  CurrencyInput,
  DateInput,
  DateRangePicker,
  Input,
  InputOTP,
  MultiInput,
  PercentageInput,
  PhoneInput,
  Select,
  TimePicker,
} from "@/index"

const option = [{ value: "a", label: "A" }]

// A required field is announced as required once. When the control carries
// `required`/`aria-required` (inputs, the combobox trigger), the label draws
// only the asterisk; "obrigatório" in the name as well was read twice
// ("CPF obrigatório, editar texto, obrigatório").
describe("required fields are announced as required once", () => {
  const cases: Array<[string, React.ReactElement, string, string]> = [
    ["Input", <Input key="i" label="Nome" required />, "textbox", "Nome"],
    ["Select", <Select key="s" label="Cidade" required options={option} />, "combobox", "Cidade"],
    ["CPFInput", <CPFInput key="cpf" label="CPF" required />, "textbox", "CPF"],
    ["CNPJInput", <CNPJInput key="cnpj" label="CNPJ" required />, "textbox", "CNPJ"],
    ["CEPInput", <CEPInput key="cep" label="CEP" required />, "textbox", "CEP"],
    ["PhoneInput", <PhoneInput key="tel" label="Telefone" required />, "textbox", "Telefone"],
    ["CurrencyInput", <CurrencyInput key="brl" label="Valor" required />, "textbox", "Valor"],
    ["PercentageInput", <PercentageInput key="pct" label="Taxa" required />, "textbox", "Taxa"],
    ["DateInput", <DateInput key="d" label="Data" required />, "textbox", "Data"],
    ["MultiInput", <MultiInput key="m" label="Tags" required />, "textbox", "Tags"],
    ["InputOTP", <InputOTP key="otp" label="Código" required length={4} />, "textbox", "Código"],
    [
      "Combobox",
      <Combobox key="c" label="Bairro" required options={option} />,
      "combobox",
      "Bairro",
    ],
  ]

  it.each(cases)(
    "%s: the name is the label, and the control says required",
    (_name, element, role, label) => {
      render(element)
      const control = screen.getAllByRole(role)[0] as HTMLElement
      expect(computeAccessibleName(control)).toBe(label)
      const required =
        control.getAttribute("aria-required") === "true" || control.hasAttribute("required")
      expect(required).toBe(true)
    },
  )

  it("DateRangePicker: its button cannot say required, so the name does, in the labels' words", () => {
    const { unmount } = render(<DateRangePicker label="Período" required />)
    expect(computeAccessibleName(screen.getByRole("button", { name: /Período/ }))).toBe(
      "Período obrigatório",
    )
    unmount()
    render(<DateRangePicker label="Period" required labels={{ required: "required" }} />)
    expect(computeAccessibleName(screen.getByRole("button", { name: /Period/ }))).toBe(
      "Period required",
    )
  })

  it("TimePicker: the group's name carries the required word from labels", () => {
    render(<TimePicker label="Start" required labels={{ required: "required" }} />)
    expect(computeAccessibleName(screen.getByRole("group", { name: /Start/ }))).toBe(
      "Start required",
    )
  })
})
