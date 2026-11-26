# Formulários

A lib é uma biblioteca de UI, não um framework de formulário: não há `<Form>`, `<FormField>` nem validação embutida. Cada campo é um componente só (rótulo, controle, ajuda e erro) com uma API simples de valor. O estado fica com você: react-hook-form, `useState` ou um `<form>` nativo com `FormData`.

## O contrato de campo

| Prop | O que faz |
|---|---|
| `label` | Rótulo visível e nome acessível. Sem rótulo visível, use `aria-label` (ou `labelPosition="hidden"`, que mantém o rótulo para o leitor de tela). |
| `labelPosition` | `"up"` (padrão), `"left"` (alinhado ao controle, bom em formulários largos), `"hidden"`. |
| `description` | Ajuda abaixo do campo, ligada por `aria-describedby`. Formato esperado, exemplo, limite. |
| `error` | String do erro. Pinta a borda, marca `aria-invalid`, mostra a mensagem com `role="alert"`. `undefined` ou `""` = sem erro. |
| `required` | Asterisco, obrigatório para o navegador e o leitor de tela. |
| `disabled` | Indisponível e **fora** do `FormData`. |
| `readOnly` | Mostra o valor, recebe foco, dá para copiar, **vai** no `FormData`, não edita. Use para dados que o usuário vê mas não pode mudar. |
| `size` | `"sm"` 32px, `"md"` 40px (padrão), `"lg"` 44px. Campos e botões do mesmo tamanho alinham. |
| `name`, `form` | O valor entra no `FormData` (sem máscara, ver tabela abaixo). `form` liga a um `<form>` em outro ponto da página. |
| `id` | Id do controle; sem ele a lib gera um. |
| `ref` | O elemento do controle (input, botão gatilho), como prop comum. |

## Valores de cada campo

| Campo | `value` | Vazio | Callback | No `FormData` (`name`) |
|---|---|---|---|---|
| `Input` | `string` | `""` | `onChange(event)` | o texto |
| `Textarea` | `string` | `""` | `onChange(event)` | o texto |
| `NumberInput` | `number \| null` | `null` | `onValueChange(n)` | número bruto com ponto (`"1234.5"`) |
| `CurrencyInput` | `number` em **reais** (ou `number \| null` com `emptyValue="null"`) | `0` (ou `null`) | `onValueChange(reais)` | número com ponto |
| `PercentageInput` | `number` (`12.5` = 12,5 %) (ou `null` com `emptyValue="null"`) | `0` (ou `null`) | `onValueChange(p)` | número com ponto |
| `CPFInput`, `CNPJInput`, `CEPInput`, `PhoneInput` | `string` só dígitos (CNPJ alfanumérico: dígitos e maiúsculas) | `""` / `null` | `onValueChange(digitos)` | os dígitos, sem máscara |
| `Select` | `string` | `""` | `onValueChange(v)` | o valor; nada escolhido não envia nada |
| `Combobox` | `string` (ou `string[]` com `multiple`) | `""` / `[]` | `onValueChange(v)` | o valor (vários: uma entrada por valor, via `getAll`) |
| `RadioGroup`, `SegmentedControl` | `string` | `""` | `onValueChange(v)` | o valor |
| `Checkbox` | `boolean \| "indeterminate"` | `false` | `onCheckedChange(c)` | `"on"` quando marcado |
| `Switch` | `boolean` | `false` | `onCheckedChange(c)` | `"on"` quando ligado |
| `Slider` | `number` (ou `[min, max]` com `range`) | `min` | `onValueChange(v)` | um campo por polegar |
| `DateInput` | `string` `"yyyy-MM-dd"` | `""` | `onValueChange(iso)` | a data ISO |
| `DateRangePicker` | `{ from: string; to: string }` ISO | `{ from: "", to: "" }` | `onValueChange(r)` | dois campos: `<name>-from` e `<name>-to` |
| `TimePicker` | `string` `"HH:mm"` | `""` | `onValueChange(h)` | a hora |
| `MultiInput` | `string[]` (ou `number[]` com `type="number"`) | `[]` | `onValueChange(lista)` | separados por vírgula |
| `InputOTP` | `string` | `""` | `onValueChange(c)` + `onComplete(c)` | o código |
| `FileUpload` | `File[]` (opcional) | `[]` | `onValueChange(files)` | os arquivos |

Todos aceitam modo não controlado (`defaultValue`/`defaultChecked`) e controlado (`value` + callback). Escolha um por campo e não alterne: um `value` que começa `undefined` e depois vira algo faz o campo trocar de modo. Use o vazio do tipo (`""`, `null`, `[]`).

## react-hook-form

Regras:

1. **`noValidate` no `<form>`.** `required` nos campos marca o campo para o navegador; sem `noValidate`, o balão do navegador aparece antes das suas regras e as suas mensagens nunca são vistas.
2. **`register`** para os campos de `onChange(event)`: `Input`, `Textarea`, e `Checkbox`/`Switch` simples. **`Controller`** para todos os outros (entregam o valor, não um evento).
3. **`defaultValues` sempre**, com o vazio do tipo: `""` para texto, datas e selects; `null` para `NumberInput` (e `CurrencyInput`/`PercentageInput` com `emptyValue="null"`); `0` para `CurrencyInput` padrão; `[]` para listas; `{ from: "", to: "" }` para período.
4. Erro: `error={errors.campo?.message}` com `register`, `error={fieldState.error?.message}` no `Controller`.
5. Repasse `onBlur={field.onBlur}` para o `mode: "onBlur"`/`"onTouched"` funcionar.
6. Não misture `{...register("x")}` com `value=` no mesmo campo.

```tsx
import { Controller, useForm } from "react-hook-form"
import {
  Button,
  CEPInput,
  CPFInput,
  Checkbox,
  Combobox,
  DateInput,
  Input,
  NumberInput,
  PhoneInput,
  Switch,
  Textarea,
  isValidCPF,
  isValidPhone,
} from "@amfernandesinc/ui"

type Lead = {
  nome: string
  email: string
  cpf: string
  telefone: string
  cep: string
  nascimento: string
  empreendimentos: string[]
  quartos: number | null
  observacoes: string
  aceitaContato: boolean
  aceitaTermos: boolean
}

const empreendimentos = [
  { value: "bosque", label: "Residencial Bosque" },
  { value: "torre-norte", label: "Torre Norte" },
  { value: "vila-jardim", label: "Vila Jardim", keywords: ["vj"] },
]

export function LeadForm({ onSave }: { onSave: (lead: Lead) => Promise<void> }) {
  const { register, control, handleSubmit, formState } = useForm<Lead>({
    mode: "onTouched",
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      cep: "",
      nascimento: "",
      empreendimentos: [],
      quartos: null,
      observacoes: "",
      aceitaContato: true,
      aceitaTermos: false,
    },
  })
  const { errors } = formState

  return (
    <form noValidate onSubmit={handleSubmit(onSave)} className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Nome completo"
        required
        autoComplete="name"
        {...register("nome", { required: "Informe o nome." })}
        error={errors.nome?.message}
      />
      <Input
        label="E-mail"
        type="email"
        required
        autoComplete="email"
        {...register("email", {
          required: "Informe o e-mail.",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "E-mail inválido." },
        })}
        error={errors.email?.message}
      />
      <Controller
        control={control}
        name="cpf"
        rules={{ validate: (v) => v === "" || isValidCPF(v) || "CPF inválido." }}
        render={({ field, fieldState }) => (
          <CPFInput
            label="CPF"
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="telefone"
        rules={{
          required: "Informe um telefone.",
          validate: (v) => isValidPhone(v) || "Telefone incompleto.",
        }}
        render={({ field, fieldState }) => (
          <PhoneInput
            label="Celular"
            required
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="cep"
        render={({ field }) => (
          <CEPInput label="CEP" value={field.value} onValueChange={field.onChange} onBlur={field.onBlur} />
        )}
      />
      <Controller
        control={control}
        name="nascimento"
        render={({ field, fieldState }) => (
          <DateInput
            label="Data de nascimento"
            max="2008-12-31"
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="empreendimentos"
        rules={{ validate: (v) => v.length > 0 || "Escolha pelo menos um empreendimento." }}
        render={({ field, fieldState }) => (
          <Combobox
            multiple
            label="Empreendimentos de interesse"
            options={empreendimentos}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="quartos"
        render={({ field }) => (
          <NumberInput
            label="Quartos"
            min={1}
            max={6}
            steppers
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <div className="sm:col-span-2">
        <Textarea label="Observações" maxLength={500} autoResize {...register("observacoes")} />
      </div>
      <Controller
        control={control}
        name="aceitaContato"
        render={({ field }) => (
          <Switch
            label="Aceita contato por WhatsApp"
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="aceitaTermos"
        rules={{ validate: (v) => v || "É preciso aceitar os termos." }}
        render={({ field, fieldState }) => (
          <Checkbox
            label="Li e aceito os termos de uso"
            checked={field.value}
            onCheckedChange={(c) => field.onChange(c === true)}
            error={fieldState.error?.message}
          />
        )}
      />
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="reset" variant="outline">
          Limpar
        </Button>
        <Button type="submit" loading={formState.isSubmitting}>
          Salvar lead
        </Button>
      </div>
    </form>
  )
}
```

### Validação com zod

`zod` e `@hookform/resolvers` são dependências do app. O schema descreve os **valores da lib**: dígitos para CPF, número em reais para dinheiro, `"yyyy-MM-dd"` para datas.

```tsx
// fora da verificação: depende de zod e @hookform/resolvers, que são do app
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { isValidCPF } from "@amfernandesinc/ui"

const schema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  cpf: z.string().refine(isValidCPF, "CPF inválido."),
  valor: z.number().positive("O valor precisa ser maior que zero."),
  vencimento: z.string().min(1, "Escolha a data."),
  empreendimentos: z.array(z.string()).min(1, "Escolha pelo menos um."),
})

export function useProposta() {
  return useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", cpf: "", valor: 0, vencimento: "", empreendimentos: [] },
  })
}
```

## Formulário nativo (sem biblioteca)

Todos os campos funcionam não controlados com `name` e `defaultValue`. O `FormData` recebe valores limpos (dígitos, números com ponto, datas ISO). `<button type="reset">` volta cada campo ao `defaultValue`.

```tsx
import * as React from "react"
import { Button, CurrencyInput, DateInput, Input, Select } from "@amfernandesinc/ui"

export function FiltroNativo({ onFilter }: { onFilter: (dados: Record<string, string>) => void }) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    onFilter(Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)])))
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <Input name="busca" label="Buscar" size="sm" />
      <Select
        name="status"
        label="Status"
        size="sm"
        defaultValue=""
        options={[
          { value: "ativo", label: "Ativo" },
          { value: "inativo", label: "Inativo" },
        ]}
      />
      <DateInput name="desde" label="Desde" size="sm" />
      <CurrencyInput name="valorMinimo" label="Valor mínimo" size="sm" />
      <Button type="reset" variant="ghost" size="sm">
        Limpar
      </Button>
      <Button type="submit" size="sm">
        Filtrar
      </Button>
    </form>
  )
}
```

## Cada campo, o que saber

### Input e Textarea

- `type` nativo (`email`, `password`, `search`, `tel`, `url`). Use `autoComplete` e `inputMode` certos.
- `leadingIcon`/`trailingIcon` recebem o **elemento** (`<Search />`).
- No `Input`, `wrapperClassName` posiciona o campo inteiro (rótulo + controle + mensagens), `fieldClassName` a caixa e `className` o `<input>`. Cada componente tem o seu conjunto de classes: confira em `reference/api/`.
- `Textarea`: `maxLength` limita e mostra contador ("27/500", anunciado sem incomodar), `autoResize` cresce com o texto.

### NumberInput, CurrencyInput, PercentageInput

| Quero | Use |
|---|---|
| Quantidade, área, andares, prazo em meses | `NumberInput` (`decimals`, `step`, `min`/`max`, `suffix="m²"`, `steppers`) |
| Dinheiro em reais | `CurrencyInput` (`allowNegative` para estorno/desconto, `min`/`max` em reais) |
| Percentual | `PercentageInput` (`decimals` 0, 1 ou 2; padrão 2; `max` 100) |

- `NumberInput` vazio é `null`, nunca `0`. Setas do teclado e PageUp/PageDown ajustam; `min`/`max` se aplicam ao sair do campo e no Enter.
- `CurrencyInput` guarda **reais** e arredonda para centavos. Faça contas com `toCents`/`fromCents`.
- `emptyValue="null"` nos dois quando "não informado" é diferente de zero (ex.: desconto opcional).
- O que for digitado que passe do `max` é recusado (o campo não mostra número que o usuário não digitou).

### CPF, CNPJ, CEP, telefone

- O `value` é **só dígitos**; a máscara é só de exibição. Guarde e envie os dígitos.
- Os campos **não validam**: combine com `isValidCPF`, `isValidCNPJ`, `isValidCEP`, `isValidPhone` (aceitam com ou sem máscara).
- `CNPJInput` aceita o CNPJ alfanumérico (letras maiúsculas nas 12 primeiras posições) e o `isValidCNPJ` também.
- `CEPInput` chama `onComplete(cep)` quando o oitavo dígito é digitado (ou um CEP colado): é o gancho para buscar o endereço; mostre `loading` durante a busca.

```tsx
import * as React from "react"
import { CEPInput, Input } from "@amfernandesinc/ui"

type Endereco = { logradouro: string; bairro: string; cidade: string; uf: string }

export function EnderecoFields({ buscarCep }: { buscarCep: (cep: string) => Promise<Endereco | null> }) {
  const [cep, setCep] = React.useState("")
  const [endereco, setEndereco] = React.useState<Endereco | null>(null)
  const [buscando, setBuscando] = React.useState(false)
  const [erro, setErro] = React.useState<string>()

  const consultar = async (valor: string) => {
    setBuscando(true)
    setErro(undefined)
    try {
      const achado = await buscarCep(valor)
      setEndereco(achado)
      if (!achado) setErro("CEP não encontrado. Preencha o endereço à mão.")
    } finally {
      setBuscando(false)
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <CEPInput
        label="CEP"
        value={cep}
        onValueChange={setCep}
        onComplete={consultar}
        loading={buscando}
        error={erro}
      />
      <Input label="Logradouro" wrapperClassName="sm:col-span-2" defaultValue={endereco?.logradouro} key={endereco?.logradouro} />
      <Input label="Bairro" defaultValue={endereco?.bairro} key={endereco?.bairro} />
      <Input label="Cidade" defaultValue={endereco?.cidade} key={endereco?.cidade} />
      <Input label="UF" maxLength={2} defaultValue={endereco?.uf} key={endereco?.uf} />
    </div>
  )
}
```

### Select, Combobox, RadioGroup, SegmentedControl

| Situação | Use |
|---|---|
| 2 a 5 opções, todas visíveis, num formulário | `RadioGroup` (`orientation`) |
| 2 a 5 opções curtas como alternância (visão, período, filtro) | `SegmentedControl` (`label` obrigatório, escondido por padrão; `iconOnly`) |
| Lista curta (até ~15), sem busca | `Select` (aceita grupos: `{ label, options }`) |
| Muitas opções, busca, várias, criar nova, busca no servidor | `Combobox` |

- `Select`: `""` mostra o placeholder (`labels.placeholder`, "Selecione…"). Um valor de opção não pode ser `""`.
- `Combobox`: a busca ignora acento e caixa e olha `label` e `keywords` (nunca `value`). `creatable` permite criar valor. Para buscar no servidor: `onSearchChange` (com debounce), `shouldFilter={false}`, `loading` e as opções que chegaram. Listas enormes ficam rápidas (`maxVisibleOptions`, 100 por padrão).
- `useComboboxOptions(rows, "nome")` transforma linhas `{ id, nome }` do backend em opções.
- Múltiplo: `showBadges={false}` numa linha de filtros compacta; `selectedCountLabel` acerta a concordância ("3 corretores").

```tsx
import * as React from "react"
import { Combobox, useComboboxOptions, useDebounce } from "@amfernandesinc/ui"

type Cliente = { id: number; nome: string }

export function ClienteCombobox({
  buscar,
  value,
  onValueChange,
}: {
  buscar: (termo: string) => Promise<Cliente[]>
  value: string
  onValueChange: (id: string) => void
}) {
  const [termo, setTermo] = React.useState("")
  const termoAtrasado = useDebounce(termo, 300)
  const [clientes, setClientes] = React.useState<Cliente[]>([])
  const [carregando, setCarregando] = React.useState(false)

  React.useEffect(() => {
    let atual = true
    setCarregando(true)
    buscar(termoAtrasado)
      .then((lista) => atual && setClientes(lista))
      .finally(() => atual && setCarregando(false))
    return () => {
      atual = false
    }
  }, [buscar, termoAtrasado])

  const options = useComboboxOptions(clientes, "nome")
  return (
    <Combobox
      label="Cliente"
      options={options}
      value={value}
      onValueChange={onValueChange}
      onSearchChange={setTermo}
      shouldFilter={false}
      loading={carregando}
    />
  )
}
```

### Checkbox, Switch, Toggle

- `Checkbox` com `label`; `checked="indeterminate"` para "selecionar todos" parcial.
- `Switch` é campo com efeito imediato ou preferência; tem `label`, `description`, `error`.
- `Toggle` é botão de alternância (toolbar), sem `label` de campo: dê nome pelo conteúdo ou `aria-label`.

### Slider

`label` (ou `aria-label`), `min`/`max`/`step`, `showValue` + `formatValue` para o valor ao lado do rótulo, `marks` (`[0, 50, 100]` ou `{ value, label }`). `range` dá dois polegares (`[min, max]`), cada um com nome "mínimo"/"máximo" (`labels`). `onValueCommit` dispara no fim do arrasto, bom para buscar no servidor.

```tsx
import * as React from "react"
import { Slider, formatBRL } from "@amfernandesinc/ui"

export function FaixaDePreco() {
  const [faixa, setFaixa] = React.useState<[number, number]>([300_000, 800_000])
  return (
    <Slider
      range
      label="Preço"
      min={100_000}
      max={2_000_000}
      step={50_000}
      value={faixa}
      onValueChange={setFaixa}
      showValue
      formatValue={(v) => formatBRL(v).replace(",00", "")}
    />
  )
}
```

### Datas e horas

- `DateInput`: digitável (dd/mm/aaaa) com calendário; `min`/`max` em ISO; `disabledDays` (`"past"`, `"future"`, `"weekends"`, `"weekdays"`, `"today"`, datas ou função).
- `DateRangePicker`: `{ from, to }` ISO, `numberOfMonths` (2 no desktop), mesmos `min`/`max`/`disabledDays`.
- `TimePicker`: `"HH:mm"` 24h.
- `Calendar`: o react-day-picker com o visual e os textos da lib (`mode="single" | "range" | "multiple"`), quando o calendário fica na página.
- Converta e compare com `lib/date` (`parseDate`, `formatDate`, `diffInDays`), nunca com `new Date("2026-03-10")` (que vira UTC e muda de dia no Brasil).

### MultiInput e InputOTP

- `MultiInput`: Enter adiciona o que foi digitado; colar texto separado por vírgula, ponto e vírgula ou quebra de linha adiciona vários. `type="number"` só aceita inteiros positivos (separados também por espaço ou barra; `3,5` é recusado, não vira 3 e 5) e ordena. `maxItems` e `onReject("max-items" | "invalid")`.
- `InputOTP`: `length` obrigatório; `pattern` padrão só dígitos (`REGEXP_ONLY_DIGITS`); `onComplete` ao preencher; aceita colar o código inteiro.

### FileUpload

- Valor `File[]`. `accept` (`"image/*"`, `["application/pdf"]`), `maxSize={mb(10)}`, `multiple` + `maxFiles`.
- Recusas (tipo, tamanho, quantidade) aparecem embaixo da área e chegam em `onReject`.
- `accept`, `maxSize` e `maxFiles` valem só no navegador, que deduz o tipo pelo nome do arquivo: o servidor precisa validar tipo, conteúdo, tamanho e quantidade de novo.
- Anexos que já estão no servidor e envios em andamento: `items` (`{ id, name, url, status, progress, error }`) + `onRemoveItem`.
- `camera` abre a câmera (HTTPS); `preview="thumbnail"` mostra miniaturas; `removable={false}` deixa só adicionar.

```tsx
import * as React from "react"
import { FileUpload, type FileUploadItem, mb } from "@amfernandesinc/ui"

export function DocumentosDoContrato({
  anexos,
  enviar,
  remover,
}: {
  anexos: FileUploadItem[]
  enviar: (files: File[]) => void
  remover: (id: string) => void
}) {
  const [novos, setNovos] = React.useState<File[]>([])
  return (
    <FileUpload
      label="Documentos do contrato"
      description="PDF ou imagem, até 10 MB cada."
      accept={["application/pdf", "image/*"]}
      maxSize={mb(10)}
      multiple
      maxFiles={10}
      items={anexos}
      onRemoveItem={remover}
      value={novos}
      onValueChange={(files) => {
        setNovos(files)
        enviar(files)
      }}
    />
  )
}
```

## Layout de formulário

- Grade responsiva: `grid gap-4 sm:grid-cols-2`. Campo largo: `wrapperClassName="sm:col-span-2"` onde a prop existe (`Input`, `NumberInput`, `Select`), ou um `<div className="sm:col-span-2">` em volta dos outros.
- Seções: um `Card` por grupo (`title`, `description`), ou `Separator` + `Typography variant="subtitle"`.
- Ações no fim, à direita: secundária (`variant="outline"` ou `ghost`) antes da principal. Num `Dialog`/`Sheet`, as ações vão no `footer` (`form="id-do-form"` no botão de envio).
- Linha de filtros: todos com o mesmo `size` (`sm` em barras densas) e `items-end` no container.
- Formulário longo: `labelPosition="left"` em telas largas economiza altura; `Stepper` para dividir em etapas.

## Erros, carregamento e envio

- Erro de campo: `error` no campo. Erro geral (servidor, permissão): `Alert variant="destructive"` acima das ações, ou `toast.error`.
- Enviando: `loading` no botão de envio (mantém a largura, anuncia ocupado, ignora cliques).
- Depois de salvar: `toast.success("Lead salvo.")`, e foco ou navegação para o próximo passo.
- Não desabilite o botão de envio para "forçar" preenchimento: deixe enviar e mostre os erros.
