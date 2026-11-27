import { render } from "@testing-library/react"
import type * as React from "react"
import { describe, expect, it } from "vitest"

import { CEPInput } from "../domain/cep-input"
import { CNPJInput } from "../domain/cnpj-input"
import { CPFInput } from "../domain/cpf-input"
import { CurrencyInput } from "../domain/currency-input"
import { FileUpload } from "../domain/file-upload"
import { InputOTP } from "../domain/input-otp"
import { MultiInput } from "../domain/multi-input"
import { PercentageInput } from "../domain/percentage-input"
import { PhoneInput } from "../domain/phone-input"
import { Combobox } from "../forms/combobox"
import { DateInput } from "../forms/date-input"
import { DateRangePicker } from "../forms/date-range-picker"
import { Select } from "../forms/select"
import { TimePicker } from "../forms/time-picker"
import { Stepper } from "../navigation/stepper"
import { Checkbox } from "../primitives/checkbox"
import { Input } from "../primitives/input"
import { NumberInput } from "../primitives/number-input"
import { RadioGroup } from "../primitives/radio-group"
import { Textarea } from "../primitives/textarea"
import { Toggle } from "../primitives/toggle"

const options = [{ value: "a", label: "Alpha" }]
const steps = [{ label: "Dados" }, { label: "Revisão" }]

const fields: [string, () => React.ReactElement][] = [
  ["Input", () => <Input label="Campo" />],
  ["Textarea", () => <Textarea label="Campo" />],
  ["NumberInput", () => <NumberInput label="Campo" />],
  ["CPFInput", () => <CPFInput label="Campo" />],
  ["CNPJInput", () => <CNPJInput label="Campo" />],
  ["CEPInput", () => <CEPInput label="Campo" />],
  ["PhoneInput", () => <PhoneInput label="Campo" />],
  ["CurrencyInput", () => <CurrencyInput label="Campo" emptyValue="null" value={null} />],
  ["PercentageInput", () => <PercentageInput label="Campo" emptyValue="null" value={null} />],
  ["MultiInput", () => <MultiInput label="Campo" />],
  ["InputOTP", () => <InputOTP label="Campo" length={4} />],
  ["FileUpload", () => <FileUpload label="Campo" />],
  ["DateInput", () => <DateInput label="Campo" />],
  ["DateRangePicker", () => <DateRangePicker label="Campo" />],
  ["TimePicker", () => <TimePicker label="Campo" />],
  ["Combobox", () => <Combobox label="Campo" options={options} />],
  ["Select", () => <Select label="Campo" options={options} />],
  ["Checkbox", () => <Checkbox label="Campo" />],
  ["RadioGroup", () => <RadioGroup label="Campo" options={options} />],
  ["Toggle", () => <Toggle>Campo</Toggle>],
  ["Stepper", () => <Stepper steps={steps} activeStep={0} />],
]

describe.each(fields)("%s", (_name, field) => {
  it("draws its frame with the same border colour as Card and DataTable", () => {
    const { container } = render(field())
    expect(container.querySelector(".border-border-strong")).not.toBeNull()
    expect(container.querySelector(".border-input")).toBeNull()
  })
})
