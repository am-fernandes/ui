import path from "node:path"

import { render, screen } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import type * as React from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { componentsWithProp } from "../../scripts/lib/component-props"
import { createProgram } from "../../scripts/lib/skill-api"
import { CEPInput } from "../domain/cep-input"
import { CNPJInput } from "../domain/cnpj-input"
import { CPFInput } from "../domain/cpf-input"
import { CurrencyInput } from "../domain/currency-input"
import { InputOTP } from "../domain/input-otp"
import { PercentageInput } from "../domain/percentage-input"
import { PhoneInput } from "../domain/phone-input"
import { DateInput } from "../forms/date-input"
import { TimePicker } from "../forms/time-picker"
import { NumberInput } from "../primitives/number-input"

/**
 * Contract of every field the user types into: the value it reports (to
 * `onValueChange`, so to react-hook-form) and the value a native form sends
 * are the one the screen shows, at every keystroke. Enter submits a form
 * without a blur, so a field that waits for the blur to report sends the
 * value it had before.
 *
 * DateInput kept the old date while the text was incomplete or not a date,
 * and TimePicker the old time while the hour was erased or out of range:
 * Enter sent it, and the app held it, with another one on screen. Either the
 * submit stops (the field is invalid for the browser) or what goes out is
 * what is on screen.
 */

// input-otp looks for the element under its slots after a timeout.
beforeAll(() => {
  document.elementFromPoint ??= () => null
})

type Reported = (value: unknown) => void

type TypedCase = {
  name: string
  field: (onValueChange: Reported) => React.ReactElement
  /** Leaves the text in a state that is no longer the starting value. */
  edit: (user: UserEvent) => Promise<void>
  /** What the form sent before the edit. */
  before: string
  /** The submit stops on the field instead of sending (an invalid text). */
  blocks?: boolean
}

const textbox = (name: RegExp | string) => screen.getByRole("textbox", { name })

async function eraseLast(user: UserEvent, name: string) {
  await user.click(textbox(name))
  await user.keyboard("{End}{Backspace}")
}

const cases: TypedCase[] = [
  {
    name: "DateInput, a digit of the year erased",
    field: (on) => (
      <DateInput label="Data" name="campo" defaultValue="2024-05-10" onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "Data"),
    before: "2024-05-10",
    blocks: true,
  },
  {
    name: "DateInput, a date that does not exist",
    field: (on) => (
      <DateInput label="Data" name="campo" defaultValue="2024-05-10" onValueChange={on} />
    ),
    edit: async (user) => {
      await user.click(textbox("Data"))
      await user.keyboard("{Control>}a{/Control}")
      await user.paste("31/02/2024")
    },
    before: "2024-05-10",
    blocks: true,
  },
  {
    name: "DateInput, a date after max",
    field: (on) => (
      <DateInput
        label="Data"
        name="campo"
        defaultValue="2024-05-10"
        max="2024-12-31"
        onValueChange={on}
      />
    ),
    edit: async (user) => {
      await user.click(textbox("Data"))
      await user.keyboard("{Control>}a{/Control}")
      await user.paste("10/05/2025")
    },
    before: "2024-05-10",
    blocks: true,
  },
  {
    name: "TimePicker, the hour erased",
    field: (on) => (
      <TimePicker label="Início" name="campo" defaultValue="08:15" onValueChange={on} />
    ),
    edit: async (user) => {
      await user.click(screen.getByLabelText("Horas"))
      await user.keyboard("{Control>}a{/Control}{Backspace}")
    },
    before: "08:15",
  },
  {
    name: "TimePicker, a minute out of range",
    field: (on) => (
      <TimePicker label="Início" name="campo" defaultValue="08:15" onValueChange={on} />
    ),
    edit: async (user) => {
      await user.click(screen.getByLabelText("Minutos"))
      // user-event does not type over a full selection under maxLength.
      await user.keyboard("{Backspace}75")
    },
    before: "08:15",
  },
  {
    name: "NumberInput, emptied",
    field: (on) => <NumberInput label="Qtd" name="campo" defaultValue={2} onValueChange={on} />,
    edit: async (user) => {
      await user.click(screen.getByRole("spinbutton", { name: "Qtd" }))
      await user.keyboard("{Control>}a{/Control}{Backspace}")
    },
    before: "2",
  },
  {
    name: "CPFInput, a digit erased",
    field: (on) => (
      <CPFInput label="CPF" name="campo" defaultValue="52998224725" onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "CPF"),
    before: "52998224725",
  },
  {
    name: "CNPJInput, a digit erased",
    field: (on) => (
      <CNPJInput label="CNPJ" name="campo" defaultValue="11222333000181" onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "CNPJ"),
    before: "11222333000181",
  },
  {
    name: "CEPInput, a digit erased",
    field: (on) => <CEPInput label="CEP" name="campo" defaultValue="01310100" onValueChange={on} />,
    edit: (user) => eraseLast(user, "CEP"),
    before: "01310100",
  },
  {
    name: "PhoneInput, a digit erased",
    field: (on) => (
      <PhoneInput label="Telefone" name="campo" defaultValue="11987654321" onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "Telefone"),
    before: "11987654321",
  },
  {
    name: "CurrencyInput, a digit erased",
    field: (on) => (
      <CurrencyInput label="Valor" name="campo" defaultValue={12.5} onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "Valor"),
    before: "12.5",
  },
  {
    name: "PercentageInput, a digit erased",
    field: (on) => (
      <PercentageInput label="Taxa" name="campo" defaultValue={12.5} onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "Taxa"),
    before: "12.5",
  },
  {
    name: "InputOTP, a character erased",
    field: (on) => (
      <InputOTP label="Código" name="campo" length={4} defaultValue="1234" onValueChange={on} />
    ),
    edit: (user) => eraseLast(user, "Código"),
    before: "1234",
  },
]

const asSent = (value: unknown) => (value == null ? "" : String(value))

describe.each(cases)("$name", (field) => {
  it("Enter never sends, nor leaves the app with, a value the screen no longer shows", async () => {
    const user = userEvent.setup()
    const reported = vi.fn()
    const submitted: string[] = []
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submitted.push(String(new FormData(e.currentTarget).get("campo")))
        }}
      >
        {field.field(reported)}
        <button type="submit">Enviar</button>
      </form>,
    )
    const form = document.querySelector("form") as HTMLFormElement
    expect(new FormData(form).get("campo")).toBe(field.before)

    await field.edit(user)
    // The app heard about the edit before any blur.
    expect(reported).toHaveBeenCalled()
    const last = asSent(reported.mock.lastCall?.[0])
    expect(last).not.toBe(field.before)
    // What the form would send is what the app holds.
    expect(asSent(new FormData(form).get("campo"))).toBe(last)

    await user.keyboard("{Enter}")
    if (field.blocks) {
      expect(submitted).toEqual([])
      expect(form.checkValidity()).toBe(false)
      expect(screen.getByRole("alert")).toBeInTheDocument()
    } else {
      expect(submitted).toEqual([last])
    }
  })
})

/**
 * Fields with `name` that are not typed into, or whose text is the value
 * itself: a native input or textarea, a choice, a list that takes a typed
 * item only on Enter (MultiInput) or a file list.
 */
const NOT_TYPED = [
  "Button",
  "Checkbox",
  "Combobox",
  "DateRangePicker",
  "FileUpload",
  "IconButton",
  "Input",
  "MultiInput",
  "RadioGroup",
  "SegmentedControl",
  "Select",
  "Slider",
  "Sparkline",
  "Switch",
  "Textarea",
  "Toggle",
]

describe("typed value contract coverage", () => {
  it("every exported field with `name` that is typed into is checked here", () => {
    const root = path.join(__dirname, "..", "..")
    const withName = componentsWithProp(createProgram(root), root, "name")
    const checked = new Set(cases.map((c) => c.name.split(",")[0]))
    expect(withName.filter((name) => !checked.has(name) && !NOT_TYPED.includes(name))).toEqual([])
    expect(NOT_TYPED.filter((name) => !withName.includes(name))).toEqual([])
  }, 120_000)
})
