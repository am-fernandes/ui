import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { describe, expect, it } from "vitest"

import { Input } from "../primitives/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "./form"

function Harness() {
  const form = useForm({ defaultValues: { name: "" } })
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe("Form", () => {
  it("renders label + control wired via context", () => {
    render(<Harness />)
    expect(screen.getByText("Nome")).toBeInTheDocument()
    expect(screen.getByLabelText("Nome")).toBeInTheDocument()
  })
})
