import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Combobox, type ComboboxOption } from "../../forms/combobox"
import { DateInput } from "../../forms/date-input"
import { Button } from "../../primitives/button"
import { Input } from "../../primitives/input"
import { Switch } from "../../primitives/switch"
import { CurrencyInput } from "../../domain/currency-input"

const estadoOptions: ComboboxOption[] = [
  { value: "AC", label: "Acre" },
  { value: "BA", label: "Bahia" },
  { value: "DF", label: "Distrito Federal" },
  { value: "MG", label: "Minas Gerais" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "SP", label: "São Paulo" },
]

type FormValues = {
  email: string
  estado: string
  nascimento: string
  salario: number
  aceitaTermos: boolean
}

const meta: Meta = {
  title: "Form Integration/RHF Form",
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Exemplo completo de integração com react-hook-form combinando Input (register), Combobox/DateInput/CurrencyInput (Controller) e Switch (Controller). Use como referência viva ao migrar formulários para a lib. Veja a aba **Form Integration** para a documentação detalhada.",
      },
    },
  },
}

export default meta

type Story = StoryObj

export const Default: Story = {
  name: "Formulário completo com RHF",
  render: () => {
    const {
      register,
      control,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<FormValues>({
      defaultValues: {
        email: "",
        estado: "",
        nascimento: "",
        salario: 0,
        aceitaTermos: false,
      },
      mode: "onBlur",
    })
    const [submitted, setSubmitted] = useState<FormValues | null>(null)

    const onSubmit = (data: FormValues) => setSubmitted(data)

    return (
      <div className="flex w-[420px] flex-col gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="E-mail"
            type="email"
            required
            placeholder="voce@empresa.com"
            {...register("email", {
              required: "Informe o e-mail",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Formato de e-mail inválido",
              },
            })}
            error={errors.email?.message}
          />

          <Controller
            control={control}
            name="estado"
            rules={{ required: "Selecione um estado" }}
            render={({ field, fieldState }) => (
              <Combobox
                label="Estado"
                required
                options={estadoOptions}
                value={field.value}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
                placeholder="Selecione um estado"
              />
            )}
          />

          <Controller
            control={control}
            name="nascimento"
            rules={{ required: "Informe a data de nascimento" }}
            render={({ field, fieldState }) => (
              <DateInput
                label="Data de nascimento"
                required
                value={field.value ?? ""}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="salario"
            rules={{
              required: "Informe o salário",
              min: { value: 0.01, message: "Deve ser maior que zero" },
            }}
            render={({ field, fieldState }) => (
              <CurrencyInput
                label="Salário pretendido"
                required
                value={field.value ?? 0}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="aceitaTermos"
            rules={{
              validate: (value) => value === true || "Você precisa aceitar os termos",
            }}
            render={({ field, fieldState }) => (
              <Switch
                label="Aceito os termos de uso"
                checked={field.value}
                onCheckedChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              Enviar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                setSubmitted(null)
              }}
            >
              Limpar
            </Button>
          </div>
        </form>

        {submitted ? (
          <pre className="rounded-md border bg-muted p-3 text-xs">
            {JSON.stringify(submitted, null, 2)}
          </pre>
        ) : null}
      </div>
    )
  },
}
