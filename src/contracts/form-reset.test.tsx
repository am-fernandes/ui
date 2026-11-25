import path from "node:path"

import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent, { type UserEvent } from "@testing-library/user-event"
import type * as React from "react"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { componentsWithProp } from "../../scripts/lib/component-props"
import { createProgram } from "../../scripts/lib/skill-api"
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
import { Checkbox } from "../primitives/checkbox"
import { Input } from "../primitives/input"
import { NumberInput } from "../primitives/number-input"
import { RadioGroup } from "../primitives/radio-group"
import { SegmentedControl } from "../primitives/segmented-control"
import { Slider } from "../primitives/slider"
import { Switch } from "../primitives/switch"
import { Textarea } from "../primitives/textarea"

/**
 * Contract of every field that takes part in a native form: a form reset
 * puts it back where it started, on screen and in the FormData, whatever
 * resets the form (a reset button, `form.reset()`, the reset React 19 does
 * after a form action). A controlled field keeps its `value`.
 *
 * Fields that keep their value in state (the mask, the chosen option, the
 * file list) do not go back by themselves: the browser resets the native
 * inputs and the state stays. FileUpload, NumberInput and InputOTP showed,
 * and sent, the edited value after a reset. A new field joins this list.
 */

// Radix Select uses pointer capture, which jsdom lacks.
beforeAll(() => {
  const proto = Element.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.setPointerCapture ??= () => {}
  proto.releasePointerCapture ??= () => {}
  // input-otp looks for the element under its slots after a timeout.
  document.elementFromPoint ??= () => null
})

type FieldCase = {
  name: string
  /** The field, uncontrolled, with `defaultValue` and `name="campo"`. */
  uncontrolled: () => React.ReactElement
  /** The field, controlled at the same value it starts with uncontrolled. */
  controlled: () => React.ReactElement
  /** Changes the value with the keyboard or the pointer. */
  edit: (user: UserEvent) => Promise<void>
  /** What the form sends: before the edit, and after. */
  sent: { initial: string; edited: string }
  /** What the screen shows at the initial value. */
  showsInitial: () => void
}

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
]

const textbox = (name: RegExp | string) => screen.getByRole("textbox", { name })

/** All the values sent under `campo` (and its `-from` / `-to`), joined. */
function sent(form: HTMLFormElement): string {
  const data = new FormData(form)
  const keys = [...new Set([...data.keys()])].filter((key) => key.startsWith("campo")).sort()
  return keys.map((key) => `${key}=${data.getAll(key).map(String).join(",")}`).join("&")
}

const noop = () => {}

const cases: FieldCase[] = [
  {
    name: "Input",
    uncontrolled: () => <Input label="Nome" name="campo" defaultValue="Ana" />,
    controlled: () => <Input label="Nome" name="campo" value="Ana" onChange={noop} />,
    edit: async (user) => user.type(textbox("Nome"), " Lima"),
    sent: { initial: "campo=Ana", edited: "campo=Ana Lima" },
    showsInitial: () => expect(textbox("Nome")).toHaveValue("Ana"),
  },
  {
    name: "Textarea",
    uncontrolled: () => <Textarea label="Obs" name="campo" defaultValue="Ana" />,
    controlled: () => <Textarea label="Obs" name="campo" value="Ana" onChange={noop} />,
    edit: async (user) => user.type(textbox("Obs"), " Lima"),
    sent: { initial: "campo=Ana", edited: "campo=Ana Lima" },
    showsInitial: () => expect(textbox("Obs")).toHaveValue("Ana"),
  },
  {
    name: "NumberInput",
    uncontrolled: () => <NumberInput label="Qtd" name="campo" defaultValue={2} />,
    controlled: () => <NumberInput label="Qtd" name="campo" value={2} onValueChange={noop} />,
    edit: async (user) => {
      await user.click(screen.getByRole("spinbutton", { name: "Qtd" }))
      await user.keyboard("{ArrowUp}{ArrowUp}")
      await user.tab()
    },
    sent: { initial: "campo=2", edited: "campo=4" },
    showsInitial: () => expect(screen.getByRole("spinbutton", { name: "Qtd" })).toHaveValue("2"),
  },
  {
    name: "Checkbox",
    uncontrolled: () => <Checkbox label="Aceito" name="campo" />,
    controlled: () => (
      <Checkbox label="Aceito" name="campo" checked={false} onCheckedChange={noop} />
    ),
    edit: async (user) => user.click(screen.getByRole("checkbox", { name: "Aceito" })),
    sent: { initial: "", edited: "campo=on" },
    showsInitial: () =>
      expect(screen.getByRole("checkbox", { name: "Aceito" })).toHaveAttribute(
        "aria-checked",
        "false",
      ),
  },
  {
    name: "Switch",
    uncontrolled: () => <Switch label="Ativo" name="campo" />,
    controlled: () => <Switch label="Ativo" name="campo" checked={false} onCheckedChange={noop} />,
    edit: async (user) => user.click(screen.getByRole("switch", { name: "Ativo" })),
    sent: { initial: "", edited: "campo=on" },
    showsInitial: () =>
      expect(screen.getByRole("switch", { name: "Ativo" })).toHaveAttribute(
        "aria-checked",
        "false",
      ),
  },
  {
    name: "RadioGroup",
    uncontrolled: () => <RadioGroup label="Plano" name="campo" values={options} defaultValue="a" />,
    controlled: () => (
      <RadioGroup label="Plano" name="campo" values={options} value="a" onValueChange={noop} />
    ),
    edit: async (user) => user.click(screen.getByRole("radio", { name: "Bravo" })),
    sent: { initial: "campo=a", edited: "campo=b" },
    showsInitial: () => expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked(),
  },
  {
    name: "SegmentedControl",
    uncontrolled: () => (
      <SegmentedControl label="Período" name="campo" options={options} defaultValue="a" />
    ),
    controlled: () => (
      <SegmentedControl
        label="Período"
        name="campo"
        options={options}
        value="a"
        onValueChange={noop}
      />
    ),
    edit: async (user) => user.click(screen.getByRole("radio", { name: "Bravo" })),
    sent: { initial: "campo=a", edited: "campo=b" },
    showsInitial: () => expect(screen.getByRole("radio", { name: "Alpha" })).toBeChecked(),
  },
  {
    name: "Slider",
    uncontrolled: () => <Slider label="Área" name="campo" defaultValue={80} max={500} />,
    controlled: () => (
      <Slider label="Área" name="campo" value={80} max={500} onValueChange={noop} />
    ),
    edit: async (user) => {
      screen.getByRole("slider", { name: "Área" }).focus()
      await user.keyboard("{ArrowRight}{ArrowRight}")
    },
    sent: { initial: "campo=80", edited: "campo=82" },
    showsInitial: () =>
      expect(screen.getByRole("slider", { name: "Área" })).toHaveAttribute("aria-valuenow", "80"),
  },
  {
    name: "Select",
    uncontrolled: () => <Select label="Estágio" name="campo" options={options} defaultValue="a" />,
    controlled: () => (
      <Select label="Estágio" name="campo" options={options} value="a" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(screen.getByRole("combobox", { name: "Estágio" }))
      await user.click(await screen.findByRole("option", { name: "Bravo" }))
    },
    sent: { initial: "campo=a", edited: "campo=b" },
    showsInitial: () =>
      expect(screen.getByRole("combobox", { name: "Estágio" })).toHaveTextContent("Alpha"),
  },
  {
    name: "Combobox",
    uncontrolled: () => <Combobox label="Status" name="campo" options={options} defaultValue="a" />,
    controlled: () => (
      <Combobox label="Status" name="campo" options={options} value="a" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(screen.getByRole("combobox", { name: /Status/ }))
      await user.click(await screen.findByRole("option", { name: "Bravo" }))
    },
    sent: { initial: "campo=a", edited: "campo=b" },
    showsInitial: () =>
      expect(screen.getByRole("combobox", { name: /Status/ })).toHaveTextContent("Alpha"),
  },
  {
    name: "DateInput",
    uncontrolled: () => <DateInput label="Data" name="campo" defaultValue="2024-05-10" />,
    controlled: () => (
      <DateInput label="Data" name="campo" value="2024-05-10" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("Data"))
      await user.keyboard("{Control>}a{/Control}")
      await user.paste("11/06/2025")
    },
    sent: { initial: "campo=2024-05-10", edited: "campo=2025-06-11" },
    showsInitial: () => expect(textbox("Data")).toHaveValue("10/05/2024"),
  },
  {
    name: "DateRangePicker",
    uncontrolled: () => (
      <DateRangePicker
        label="Período"
        name="campo"
        defaultValue={{ from: "2025-03-10", to: "2025-03-12" }}
      />
    ),
    controlled: () => (
      <DateRangePicker
        label="Período"
        name="campo"
        value={{ from: "2025-03-10", to: "2025-03-12" }}
        onValueChange={noop}
      />
    ),
    edit: async (user) => {
      await user.click(screen.getByRole("button", { name: /Período/ }))
      await user.click(await screen.findByRole("button", { name: "Limpar" }))
    },
    sent: {
      initial: "campo-from=2025-03-10&campo-to=2025-03-12",
      edited: "campo-from=&campo-to=",
    },
    showsInitial: () =>
      expect(screen.getByRole("button", { name: /Período/ })).toHaveTextContent(
        "10/03/2025 — 12/03/2025",
      ),
  },
  {
    name: "TimePicker",
    uncontrolled: () => <TimePicker label="Início" name="campo" defaultValue="08:15" />,
    controlled: () => <TimePicker label="Início" name="campo" value="08:15" onValueChange={noop} />,
    edit: async (user) => {
      const hour = screen.getByLabelText("Horas")
      await user.click(hour)
      await user.keyboard("{ArrowUp}")
    },
    sent: { initial: "campo=08:15", edited: "campo=09:15" },
    showsInitial: () => expect(screen.getByLabelText("Horas")).toHaveValue("08"),
  },
  {
    name: "MultiInput",
    uncontrolled: () => <MultiInput label="Tags" name="campo" defaultValue={["a"]} />,
    controlled: () => <MultiInput label="Tags" name="campo" value={["a"]} onValueChange={noop} />,
    edit: async (user) => user.type(textbox("Tags"), "b{Enter}"),
    sent: { initial: "campo=a", edited: "campo=a,b" },
    showsInitial: () =>
      expect(screen.queryByRole("button", { name: "Remover b" })).not.toBeInTheDocument(),
  },
  {
    name: "CPFInput",
    uncontrolled: () => <CPFInput label="CPF" name="campo" defaultValue="52998224725" />,
    controlled: () => (
      <CPFInput label="CPF" name="campo" value="52998224725" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("CPF"))
      await user.keyboard("{End}{Backspace}")
    },
    sent: { initial: "campo=52998224725", edited: "campo=5299822472" },
    showsInitial: () => expect(textbox("CPF")).toHaveValue("529.982.247-25"),
  },
  {
    name: "CNPJInput",
    uncontrolled: () => <CNPJInput label="CNPJ" name="campo" defaultValue="11222333000181" />,
    controlled: () => (
      <CNPJInput label="CNPJ" name="campo" value="11222333000181" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("CNPJ"))
      await user.keyboard("{End}{Backspace}")
    },
    sent: { initial: "campo=11222333000181", edited: "campo=1122233300018" },
    showsInitial: () => expect(textbox("CNPJ")).toHaveValue("11.222.333/0001-81"),
  },
  {
    name: "CEPInput",
    uncontrolled: () => <CEPInput label="CEP" name="campo" defaultValue="01310100" />,
    controlled: () => <CEPInput label="CEP" name="campo" value="01310100" onValueChange={noop} />,
    edit: async (user) => {
      await user.click(textbox("CEP"))
      await user.keyboard("{End}{Backspace}")
    },
    sent: { initial: "campo=01310100", edited: "campo=0131010" },
    showsInitial: () => expect(textbox("CEP")).toHaveValue("01310-100"),
  },
  {
    name: "PhoneInput",
    uncontrolled: () => <PhoneInput label="Telefone" name="campo" defaultValue="11987654321" />,
    controlled: () => (
      <PhoneInput label="Telefone" name="campo" value="11987654321" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("Telefone"))
      await user.keyboard("{End}{Backspace}")
    },
    sent: { initial: "campo=11987654321", edited: "campo=1198765432" },
    showsInitial: () => expect(textbox("Telefone")).toHaveValue("(11) 98765-4321"),
  },
  {
    name: "CurrencyInput",
    uncontrolled: () => <CurrencyInput label="Valor" name="campo" defaultValue={12.5} />,
    controlled: () => (
      <CurrencyInput label="Valor" name="campo" value={12.5} onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("Valor"))
      await user.keyboard("{End}9")
    },
    sent: { initial: "campo=12.5", edited: "campo=125.09" },
    showsInitial: () => expect(textbox("Valor")).toHaveValue("12,50"),
  },
  {
    name: "PercentageInput",
    uncontrolled: () => <PercentageInput label="Taxa" name="campo" defaultValue={12.5} />,
    controlled: () => (
      <PercentageInput label="Taxa" name="campo" value={12.5} onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("Taxa"))
      await user.keyboard("{End}{Backspace}")
    },
    sent: { initial: "campo=12.5", edited: "campo=1.25" },
    showsInitial: () => expect(textbox("Taxa")).toHaveValue("12,50"),
  },
  {
    name: "InputOTP",
    uncontrolled: () => <InputOTP label="Código" name="campo" length={4} defaultValue="12" />,
    controlled: () => (
      <InputOTP label="Código" name="campo" length={4} value="12" onValueChange={noop} />
    ),
    edit: async (user) => {
      await user.click(textbox("Código"))
      await user.keyboard("34")
    },
    sent: { initial: "campo=12", edited: "campo=1234" },
    showsInitial: () => expect(textbox("Código")).toHaveValue("12"),
  },
]

/** Lets the listeners that wait for the browser's reset finish. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 0))
  })
}

type Reset = { how: string; run: (form: HTMLFormElement, user: UserEvent) => Promise<void> }

const resets: Reset[] = [
  {
    how: "a reset button",
    run: async (_form, user) => user.click(screen.getByRole("button", { name: "Redefinir" })),
  },
  {
    how: "form.reset()",
    run: async (form) => {
      act(() => form.reset())
    },
  },
]

function Harness({ children, action }: { children: React.ReactNode; action?: () => void }) {
  return (
    <form data-testid="form" action={action}>
      {children}
      <button type="reset">Redefinir</button>
      <button type="submit">Enviar</button>
    </form>
  )
}

describe.each(cases)("$name in a native form", (field) => {
  it.each(resets)("goes back to its default after $how", async ({ run }) => {
    const user = userEvent.setup()
    render(<Harness>{field.uncontrolled()}</Harness>)
    const form = screen.getByTestId("form") as HTMLFormElement
    expect(sent(form)).toBe(field.sent.initial)

    await field.edit(user)
    expect(sent(form)).toBe(field.sent.edited)

    await run(form, user)
    await settle()
    await waitFor(() => expect(sent(form)).toBe(field.sent.initial))
    field.showsInitial()
  })

  it("goes back to its default after a React form action", async () => {
    const user = userEvent.setup()
    const action = vi.fn()
    render(<Harness action={action}>{field.uncontrolled()}</Harness>)
    const form = screen.getByTestId("form") as HTMLFormElement

    await field.edit(user)
    expect(sent(form)).toBe(field.sent.edited)
    // Submitted from the form itself: the button the edit may have left
    // focused (a popover trigger) must not stand in for it.
    await act(async () => {
      fireEvent.submit(form)
    })
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    await settle()
    await waitFor(() => expect(sent(form)).toBe(field.sent.initial))
    field.showsInitial()
  })

  it("keeps its controlled value after form.reset()", async () => {
    render(<Harness>{field.controlled()}</Harness>)
    const form = screen.getByTestId("form") as HTMLFormElement
    expect(sent(form)).toBe(field.sent.initial)
    act(() => form.reset())
    await settle()
    expect(sent(form)).toBe(field.sent.initial)
    field.showsInitial()
  })
})

// jsdom has no DataTransfer, so the files a FileUpload copies into its form
// input are checked in the browser (tests/e2e/form-integration.spec.ts).
// Here: what the screen shows.
describe("FileUpload in a native form", () => {
  const file = (name: string) => new File(["x"], name, { type: "text/plain" })
  async function choose(container: HTMLElement, names: string[]) {
    const picker = container.querySelector('input[type="file"]:not([name])') as HTMLInputElement
    await userEvent.upload(picker, names.map(file))
  }

  it.each(resets)("empties its list after $how", async ({ run }) => {
    const user = userEvent.setup()
    const { container } = render(
      <Harness>
        <FileUpload label="Anexos" name="campo" multiple required />
      </Harness>,
    )
    await choose(container, ["a.txt", "b.txt"])
    expect(screen.getByText("a.txt")).toBeInTheDocument()
    await run(screen.getByTestId("form") as HTMLFormElement, user)
    await settle()
    expect(screen.queryByText("a.txt")).not.toBeInTheDocument()
    expect(screen.queryByText("b.txt")).not.toBeInTheDocument()
    // Empty again, so `required` blocks the next submit.
    expect(container.querySelector('input[type="file"]:not([name])')).toBeRequired()
  })

  it("empties its list after a React form action", async () => {
    const action = vi.fn()
    const { container } = render(
      <Harness action={action}>
        <FileUpload label="Anexos" name="campo" multiple />
      </Harness>,
    )
    await choose(container, ["a.txt"])
    await act(async () => {
      fireEvent.submit(screen.getByTestId("form"))
    })
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    await settle()
    await waitFor(() => expect(screen.queryByText("a.txt")).not.toBeInTheDocument())
  })

  it("controlled, keeps the files the app holds", async () => {
    const onValueChange = vi.fn()
    render(
      <Harness>
        <FileUpload
          label="Anexos"
          name="campo"
          value={[file("a.txt")]}
          onValueChange={onValueChange}
        />
      </Harness>,
    )
    act(() => (screen.getByTestId("form") as HTMLFormElement).reset())
    await settle()
    expect(screen.getByText("a.txt")).toBeInTheDocument()
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it("clears the refusal and the missing-file message", async () => {
    const user = userEvent.setup({ applyAccept: false })
    const { container } = render(
      <Harness>
        <FileUpload label="Anexos" name="campo" accept=".pdf" />
      </Harness>,
    )
    const picker = container.querySelector('input[type="file"]:not([name])') as HTMLInputElement
    await user.upload(picker, file("a.txt"))
    expect(screen.getByRole("alert")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Redefinir" }))
    await settle()
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })
})

/**
 * Exported components that take `name` but are not form fields: a button
 * sends its name only as the submitter, and a chart series is named.
 */
const NOT_FORM_FIELDS = ["Button", "IconButton", "Sparkline", "Toggle"]

describe("form contract coverage", () => {
  it("every exported component that takes `name` is checked here", () => {
    const root = path.join(__dirname, "..", "..")
    const withName = componentsWithProp(createProgram(root), root, "name")
    const checked = new Set([...cases.map((c) => c.name), "FileUpload", ...NOT_FORM_FIELDS])
    expect(withName.filter((name) => !checked.has(name))).toEqual([])
    // An exemption that no longer takes `name` is dead weight.
    expect(NOT_FORM_FIELDS.filter((name) => !withName.includes(name))).toEqual([])
  }, 120_000)
})
