import type { Meta, StoryObj } from "@storybook/react-vite"
import { useForm } from "react-hook-form"

import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form"

type DemoValues = {
  username: string
}

function DemoForm() {
  const form = useForm<DemoValues>({
    defaultValues: { username: "" },
    mode: "onTouched",
  })

  const onSubmit = (_values: DemoValues) => {
    // no-op for storybook demo
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[320px] space-y-6">
        <FormField
          control={form.control}
          name="username"
          rules={{
            required: "Obrigatório",
            minLength: { value: 3, message: "Pelo menos 3 caracteres" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário</FormLabel>
              <FormControl>
                <Input placeholder="seu-usuario" {...field} />
              </FormControl>
              <FormDescription>Mínimo 3 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar</Button>
      </form>
    </Form>
  )
}

const meta: Meta<typeof DemoForm> = {
  title: "Forms/Form",
  component: DemoForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof DemoForm>

export const Default: Story = {
  render: () => <DemoForm />,
}
