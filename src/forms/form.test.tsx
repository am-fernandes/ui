import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { Form, FormField } from "./form"

describe("Form", () => {
  it("renders a <form> with children", () => {
    render(
      <Form onSubmit={() => {}}>
        <FormField name="x" type="text" label="X" />
        <button type="submit">go</button>
      </Form>,
    )
    expect(screen.getByLabelText("X")).toBeInTheDocument()
  })

  it("calls onSubmit with form data", async () => {
    const onSubmit = vi.fn()
    render(
      <Form onSubmit={onSubmit} defaultValues={{ x: "abc" }}>
        <FormField name="x" type="text" label="X" />
        <button type="submit">go</button>
      </Form>,
    )
    fireEvent.submit(screen.getByRole("button", { name: "go" }))
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ x: "abc" }, expect.anything()),
    )
  })

  it("FormField renders an Input with the correct name+type", () => {
    render(
      <Form onSubmit={() => {}}>
        <FormField name="email" type="email" label="E-mail" />
      </Form>,
    )
    const input = screen.getByLabelText("E-mail") as HTMLInputElement
    expect(input.type).toBe("email")
    expect(input.name).toBe("email")
  })

  it("FormField with render prop wraps custom control", () => {
    render(
      <Form onSubmit={() => {}}>
        <FormField name="custom" label="X">
          {(field) => <input data-testid="custom" {...field} />}
        </FormField>
      </Form>,
    )
    expect(screen.getByTestId("custom")).toBeInTheDocument()
  })
})
