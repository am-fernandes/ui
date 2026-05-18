import type { Meta, StoryObj } from "@storybook/react-vite"
import { Controller, useForm } from "react-hook-form"

import { toast } from "../overlays/sonner"
import { Button } from "../primitives/button"
import { Input } from "../primitives/input"
import { Textarea } from "../primitives/textarea"
import { Combobox } from "./combobox"
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

type MultiFieldValues = {
  nome: string
  email: string
  categoria: string
  mensagem: string
}

const categorias = [
  { value: "juridico", label: "Jurídico" },
  { value: "tributario", label: "Tributário" },
  { value: "trabalhista", label: "Trabalhista" },
  { value: "contratos", label: "Contratos" },
]

interface MultiFieldFormProps {
  defaultValues?: Partial<MultiFieldValues>
  mode?: "onChange" | "onTouched" | "onSubmit" | "onBlur" | "all"
}

function MultiFieldForm({ defaultValues, mode = "onTouched" }: MultiFieldFormProps) {
  const form = useForm<MultiFieldValues>({
    defaultValues: {
      nome: "",
      email: "",
      categoria: "",
      mensagem: "",
      ...defaultValues,
    },
    mode,
  })

  const onSubmit = (values: MultiFieldValues) => {
    console.log("[Form] submit", values)
    toast.success("Formulário enviado", {
      description: `${values.nome} • ${values.categoria}`,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[420px] space-y-5" noValidate>
        <FormField
          control={form.control}
          name="nome"
          rules={{ required: "Informe seu nome" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Maria Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          rules={{
            required: "Informe um e-mail",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "E-mail inválido",
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="voce@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Controller
          control={form.control}
          name="categoria"
          rules={{ required: "Selecione uma categoria" }}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Combobox
                options={categorias}
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Selecione..."
              />
              {fieldState.error ? (
                <p className="text-destructive text-sm">{fieldState.error.message}</p>
              ) : null}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mensagem"
          rules={{
            required: "Escreva uma mensagem",
            minLength: { value: 10, message: "Mínimo 10 caracteres" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensagem</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Como podemos ajudar?" {...field} />
              </FormControl>
              <FormDescription>Mínimo 10 caracteres</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button type="submit">Enviar</Button>
        </div>
      </form>
    </Form>
  )
}

const meta: Meta<typeof DemoForm> = {
  title: "Forms/Form",
  component: DemoForm,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: [
          "Integração com **react-hook-form** via componentes composicionais. `Form` é alias direto de `FormProvider` — basta espalhar o retorno de `useForm()` nele.",
          "",
          "**Sub-componentes:**",
          "- `Form` — alias de `FormProvider`. Recebe `{...form}` retornado por `useForm()`.",
          "- `FormField` — wrapper de `Controller` que injeta contexto (`name`) para os demais sub-componentes. Props: `control`, `name`, `rules`, `render`.",
          "- `FormItem` — `<div>` com `space-y-2` que cria escopo de `id` para casar Label/Control/Description/Message via ARIA.",
          "- `FormLabel` — `<Label>` que aplica `text-destructive` automaticamente quando há erro e gera `htmlFor` correto.",
          "- `FormControl` — `<Slot>` que liga `id`, `aria-describedby` e `aria-invalid` ao input filho. Use em volta de um Input/Textarea/etc.",
          "- `FormDescription` — texto auxiliar (`text-muted-foreground`).",
          "- `FormMessage` — exibe `error.message` automaticamente; some quando não há erro nem `children`.",
          "",
          "**Padrão recomendado:** envolva inputs nativos com `FormField` + `FormItem`. Para componentes custom que já gerenciam o próprio input (`Combobox`, `DateInput`), use `Controller` direto + `FormItem` (veja a story `MultiField`).",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          "import {",
          "  Button,",
          "  Form,",
          "  FormControl,",
          "  FormField,",
          "  FormItem,",
          "  FormLabel,",
          "  FormMessage,",
          "  Input,",
          '} from "@am-fernandes/ui"',
          'import { useForm } from "react-hook-form"',
          "",
          "type Values = { username: string }",
          "",
          'const form = useForm<Values>({ defaultValues: { username: "" } })',
          "",
          "<Form {...form}>",
          "  <form onSubmit={form.handleSubmit((values) => console.log(values))}>",
          "    <FormField",
          "      control={form.control}",
          '      name="username"',
          '      rules={{ required: "Obrigatório" }}',
          "      render={({ field }) => (",
          "        <FormItem>",
          "          <FormLabel>Usuário</FormLabel>",
          "          <FormControl>",
          '            <Input placeholder="seu-usuario" {...field} />',
          "          </FormControl>",
          "          <FormMessage />",
          "        </FormItem>",
          "      )}",
          "    />",
          '    <Button type="submit">Salvar</Button>',
          "  </form>",
          "</Form>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof DemoForm>

export const Playground: Story = {
  render: () => <DemoForm />,
}

export const Default: Story = {
  render: () => <DemoForm />,
}

export const MultiField: Story = {
  render: () => <MultiFieldForm />,
}

export const WithErrors: Story = {
  render: () => (
    <MultiFieldForm
      mode="onChange"
      defaultValues={{
        nome: "",
        email: "nao-eh-email",
        categoria: "",
        mensagem: "curto",
      }}
    />
  ),
}
