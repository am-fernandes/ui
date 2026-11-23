import { render, screen } from "@testing-library/react"
import type * as React from "react"
import { describe, expect, it } from "vitest"

import { Checkbox } from "../checkbox"
import { Input } from "../input"
import { RadioGroup } from "../radio-group"
import { Switch } from "../switch"
import { Textarea } from "../textarea"

// A consumer's `aria-describedby` (a hint elsewhere on the page) used to
// replace the one the component builds, because the props were spread after
// it: the description and, worse, the error message stopped being read.
const fields: Array<{
  name: string
  render: (props: { "aria-describedby"?: string }) => React.ReactElement
  control: () => HTMLElement
}> = [
  {
    name: "Input",
    render: (props) => <Input label="Campo" description="Ajuda" error="Erro" {...props} />,
    control: () => screen.getByLabelText("Campo"),
  },
  {
    name: "Textarea",
    render: (props) => <Textarea label="Campo" description="Ajuda" error="Erro" {...props} />,
    control: () => screen.getByLabelText("Campo"),
  },
  {
    name: "Checkbox",
    render: (props) => <Checkbox label="Campo" description="Ajuda" error="Erro" {...props} />,
    control: () => screen.getByRole("checkbox"),
  },
  {
    name: "Switch",
    render: (props) => <Switch label="Campo" description="Ajuda" error="Erro" {...props} />,
    control: () => screen.getByRole("switch"),
  },
  {
    name: "RadioGroup",
    render: (props) => (
      <RadioGroup
        label="Campo"
        description="Ajuda"
        error="Erro"
        values={[{ value: "a", label: "A" }]}
        {...props}
      />
    ),
    control: () => screen.getByRole("radiogroup"),
  },
]

/** The text of every element the control's aria-describedby points at, in order. */
function describedByTexts(control: HTMLElement) {
  return (control.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? `(missing: ${id})`)
}

describe.each(fields)("$name: aria-describedby", ({ render: renderField, control }) => {
  it("points at its description and its error", () => {
    render(renderField({}))
    expect(describedByTexts(control())).toEqual(["Ajuda", "Erro"])
  })

  it("keeps them when the consumer passes an aria-describedby of its own", () => {
    render(
      <>
        {renderField({ "aria-describedby": "hint" })}
        <p id="hint">Dica da página</p>
      </>,
    )
    expect(describedByTexts(control())).toEqual(["Ajuda", "Erro", "Dica da página"])
    expect(control()).toHaveAccessibleDescription("Ajuda Erro Dica da página")
  })

  it("accepts several ids from the consumer", () => {
    render(
      <>
        {renderField({ "aria-describedby": "hint other" })}
        <p id="hint">Dica</p>
        <p id="other">Outra</p>
      </>,
    )
    expect(describedByTexts(control())).toEqual(["Ajuda", "Erro", "Dica", "Outra"])
  })
})
