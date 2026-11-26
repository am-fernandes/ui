<!-- Gerado por `bun run skill:api` a partir de src/. Não edite à mão: o teste scripts/lib/skill-api.test.ts falha se este arquivo e o código divergirem. -->

# API: Domínio (Brasil, dinheiro, arquivos)

## `domain/cep-input` — `@amfernandesinc/ui/cep-input`

### CEPInput

`import { CEPInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/cep-input"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `string \| null` | — | O CEP como **dígitos limpos** (sem máscara). Pode conter de 0 a 8 dígitos enquanto o usuário digita. Ex.: `"01310100"`. `null` é campo vazio; sem `value`, o campo guarda o próprio valor a partir de `defaultValue`. |
| `defaultValue` | `string` | — | CEP inicial (dígitos limpos) de um campo não controlado. |
| `onComplete` | `(cep: string) => void` | — | Chamado com os oito dígitos quando o CEP fica completo por uma edição do usuário (o oitavo dígito digitado, ou um CEP inteiro colado). É o gancho da consulta de endereço. Não dispara por um `value` que chega pronto. |
| `loading` | `boolean` | `false` | Mostra um indicador de carregamento dentro do campo, para o tempo da consulta de endereço. O campo continua editável. |
| `labels` | `Partial<CEPInputLabels>` | — | Textos do componente. Padrão em pt-BR. |
| `onValueChange` | `(value: string) => void` | — | Called with the clean value after every edit. |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).

### defaultCEPInputLabels

`import { defaultCEPInputLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/cep-input"`

```ts
const defaultCEPInputLabels: CEPInputLabels = {
  loading: "Buscando endereço…",
}
```

### CEPInputLabels

`import type { CEPInputLabels } from "@amfernandesinc/ui"`

```ts
export interface CEPInputLabels {
  /** Announced to screen readers while `loading`. */
  loading: string
}
```

### CEPInputProps

`import type { CEPInputProps } from "@amfernandesinc/ui"`

```ts
interface CEPInputProps extends MaskedInputProps {
  /**
   * O CEP como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 8 dígitos enquanto o usuário digita.
   * Ex.: `"01310100"`. `null` é campo vazio; sem `value`, o campo guarda o
   * próprio valor a partir de `defaultValue`.
   */
  value?: string | null
  /** CEP inicial (dígitos limpos) de um campo não controlado. */
  defaultValue?: string
  /**
   * Chamado com os oito dígitos quando o CEP fica completo por uma edição do
   * usuário (o oitavo dígito digitado, ou um CEP inteiro colado). É o gancho
   * da consulta de endereço. Não dispara por um `value` que chega pronto.
   */
  onComplete?: (cep: string) => void
  /**
   * Mostra um indicador de carregamento dentro do campo, para o tempo da
   * consulta de endereço. O campo continua editável.
   */
  loading?: boolean
  /** Textos do componente. Padrão em pt-BR. */
  labels?: Partial<CEPInputLabels>
}
```

## `domain/cnpj-input` — `@amfernandesinc/ui/cnpj-input`

### CNPJInput

`import { CNPJInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/cnpj-input"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `string \| null` | — | O CNPJ **sem máscara**: até 14 caracteres, na ordem em que aparecem. No CNPJ numérico são só dígitos (`"11222333000181"`); no alfanumérico (IN RFB 2.229/2024) as doze primeiras posições podem ter letras maiúsculas (`"12ABC34501DE35"`). Os dois últimos são sempre dígitos. `null` é campo vazio; sem `value`, o campo guarda o próprio valor a partir de `defaultValue`. |
| `defaultValue` | `string` | — | CNPJ inicial (sem máscara) de um campo não controlado. |
| `onValueChange` | `(value: string) => void` | — | Called with the clean value after every edit. |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).

### CNPJInputProps

`import type { CNPJInputProps } from "@amfernandesinc/ui"`

```ts
interface CNPJInputProps extends MaskedInputProps {
  /**
   * O CNPJ **sem máscara**: até 14 caracteres, na ordem em que aparecem.
   * No CNPJ numérico são só dígitos (`"11222333000181"`); no alfanumérico
   * (IN RFB 2.229/2024) as doze primeiras posições podem ter letras
   * maiúsculas (`"12ABC34501DE35"`). Os dois últimos são sempre dígitos.
   * `null` é campo vazio; sem `value`, o campo guarda o próprio valor a partir
   * de `defaultValue`.
   */
  value?: string | null
  /** CNPJ inicial (sem máscara) de um campo não controlado. */
  defaultValue?: string
}
```

## `domain/cpf-input` — `@amfernandesinc/ui/cpf-input`

### CPFInput

`import { CPFInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/cpf-input"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `string \| null` | — | O CPF como **dígitos limpos** (sem máscara). Pode conter de 0 a 11 dígitos enquanto o usuário digita. Ex.: `"12345678909"`. `null` é campo vazio; sem `value`, o campo guarda o próprio valor a partir de `defaultValue`. |
| `defaultValue` | `string` | — | CPF inicial (dígitos limpos) de um campo não controlado. |
| `onValueChange` | `(value: string) => void` | — | Called with the clean value after every edit. |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).

### CPFInputProps

`import type { CPFInputProps } from "@amfernandesinc/ui"`

```ts
interface CPFInputProps extends MaskedInputProps {
  /**
   * O CPF como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"12345678909"`. `null` é campo vazio; sem `value`, o campo guarda o
   * próprio valor a partir de `defaultValue`.
   */
  value?: string | null
  /** CPF inicial (dígitos limpos) de um campo não controlado. */
  defaultValue?: string
}
```

## `domain/currency-input` — `@amfernandesinc/ui/currency-input`

### CurrencyInput

`import { CurrencyInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/currency-input"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `CurrencyInputZeroProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `emptyValue` | `"zero"` | `"zero"` | What an empty field is worth. `"zero"` (the default): the field always holds a number, and clearing it goes back to `0,00`. `"null"`: the field can be empty, which is `null`, different from zero; the placeholder shows and a native `required` works. |
| `value` | `number` | — | The value in **float reais** (BRL), controlled. Leave it out and the field keeps its own value, starting from `defaultValue`. IMPORTANT: do not perform arithmetic on the float. Use `toCents`/`fromCents` from `@amfernandesinc/ui` for any computation (sums, percentages, multiplications). The component itself round-trips through cents — assume any value is accurate to 2 decimals only. |
| `defaultValue` | `number` | — | Initial value of an uncontrolled field. |
| `onValueChange` | `(value: number) => void` | — | Called with the value in reais after every edit. |
| `allowNegative` | `boolean` | `false` | Accepts negative values (a refund, a discount, a balance owed). The minus key makes the value negative, a second one or `+` makes it positive again, and a pasted negative number keeps its sign. The field then opens the text keyboard on phones: the iOS numeric keypad has no minus key. |
| `min` | `number` | — | Smallest value, in reais. While typing, the value passes below it on its way up, so it is applied when the field loses focus, or on Enter, after an edit: a smaller value is raised to `min`. |
| `max` | `number` | — | Largest value, in reais. A key (or a paste) that would take the value past it is refused: the field keeps what it had, and never shows a number the user did not type. |
| `required` | `boolean` | — | — |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).

#### `CurrencyInputNullProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `emptyValue` | `"null"` | **obrigatória** | — |
| `value` | `number \| null` | — | The value in reais, or `null` for an empty field. |
| `defaultValue` | `number \| null` | — | — |
| `onValueChange` | `(value: number \| null) => void` | — | Called with the value in reais, or `null` when the field is cleared. |
| `allowNegative` | `boolean` | `false` | Accepts negative values (a refund, a discount, a balance owed). The minus key makes the value negative, a second one or `+` makes it positive again, and a pasted negative number keeps its sign. The field then opens the text keyboard on phones: the iOS numeric keypad has no minus key. |
| `min` | `number` | — | Smallest value, in reais. While typing, the value passes below it on its way up, so it is applied when the field loses focus, or on Enter, after an edit: a smaller value is raised to `min`. |
| `max` | `number` | — | Largest value, in reais. A key (or a paste) that would take the value past it is refused: the field keeps what it had, and never shows a number the user did not type. |
| `required` | `boolean` | — | — |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).


### CurrencyInputProps

`import type { CurrencyInputProps } from "@amfernandesinc/ui"`

```ts
type CurrencyInputProps = CurrencyInputZeroProps | CurrencyInputNullProps
```

## `domain/file-upload` — `@amfernandesinc/ui/file-upload`

### FileUpload

`import { FileUpload } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/file-upload"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `accept` | `string \| string[]` | — | MIME pattern(s) accepted by the picker. Examples: `"image/*"`, `["image/png", "application/pdf"]`. Same syntax as native `<input accept>`. Checked only in the browser, against the type it infers from the file name: validate the file again on the server. |
| `multiple` | `boolean` | `false` | Allow selecting more than one file. Default `false`. |
| `maxSize` | `number` | — | Maximum bytes per file. Files larger than this are rejected. Compose with the `kb()` / `mb()` / `gb()` helpers from `@amfernandesinc/ui`. Checked only in the browser: enforce the limit on the server too. |
| `maxFiles` | `number` | — | Maximum number of files when `multiple`. Extra files are rejected. |
| `preview` | `"thumbnail" \| "none"` | `"thumbnail"` | How to display selected files. `"thumbnail"` (default) shows an image preview tile (clickable: an image opens fullscreen, a PDF opens in a new tab, any other file is downloaded). `"none"` hides previews. |
| `camera` | `boolean` | `false` | Show an extra "Capturar foto" button that opens the device camera and snapshots a photo as `image/jpeg`. Requires HTTPS or localhost (`getUserMedia`). |
| `value` | `File[]` | — | Controlled list of files. Pair with `onValueChange`. If omitted, the component manages its own state. |
| `onValueChange` | `(files: File[]) => void` | — | Called whenever the accepted file list changes. |
| `items` | `FileUploadItem[]` | `NO_ITEMS` | Files the component did not pick itself, shown in the same list, before the chosen ones: attachments already saved on the server (give them a `url`) and uploads in progress (`status`, `progress`, `error`). They are yours to keep: the usual flow is to take a file from `onValueChange`, start the upload and move it from `value` to `items`. They count towards `maxFiles`. |
| `onRemoveItem` | `(id: string) => void` | — | Called with the item's `id` when the user removes it. Without it, items have no remove button. |
| `onReject` | `(rejections: FileUploadRejection[]) => void` | — | Called when one or more files were dropped/selected but did not pass `accept`, `maxSize`, or `maxFiles`. |
| `showRejections` | `boolean` | `true` | Show, under the dropzone, why each file of the last attempt was refused (texts in `labels`). Set `false` when `onReject` already tells the user, with a toast for instance. Default `true`. |
| `disabled` | `boolean` | `false` | Disable user interaction. |
| `readOnly` | `boolean` | `false` | Shows the files without letting the list change: no dropzone, camera or remove buttons; files can still be opened, previewed and downloaded, and are sent with the form. The dropzone's place takes the `label`, and "no files" (`labels.noFiles`) when the list is empty. The `ref` (the dropzone) is `null`. |
| `error` | `string` | — | Validation message — when set, the dropzone border turns red and the message renders below. |
| `label` | `React.ReactNode` | — | Main label inside the dropzone. |
| `description` | `React.ReactNode` | — | Secondary helper text below the label. Defaults to a hint derived from `accept` / `maxSize`. |
| `className` | `string` | — | Additional class on the outer wrapper. |
| `dropzoneClassName` | `string` | — | Class on the dropzone clickable area. |
| `removable` | `boolean` | `true` | Show the per-row remove button. Set `false` to hide it: files can still be opened/previewed and new ones added through the dropzone (append-only). Default `true`. |
| `downloadable` | `boolean` | `false` | Show the download button in the image lightbox. Default `false` (view only). |
| `labels` | `Partial<FileUploadLabels>` | — | Override individual UI strings. Defaults are pt-BR. |
| `id` | `string` | — | `id` of the dropzone button, for a `<label htmlFor>` or a link to the field. |
| `name` | `string` | — | Name of the field in a native form: a hidden `<input type="file">` carries the files of the list, so `FormData` gets them under this name. `items` are not sent: they are already on the server. |
| `required` | `boolean` | `false` | The list cannot be empty (chosen files or `items`). A native form is not sent while it is: the message in `labels.requiredError` shows under the dropzone and the focus goes to it. |
| `ref` | `React.Ref<HTMLButtonElement>` | — | The dropzone button: it takes the focus (`ref.current.focus()`), as React Hook Form does on an error. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the field: the dropzone and the buttons of the list. |

### defaultFileUploadLabels

`import { defaultFileUploadLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/file-upload"`

```ts
const defaultFileUploadLabels: ResolvedFileUploadLabels = {
  dropzoneSingle: "Arraste um arquivo ou clique para selecionar",
  dropzoneMultiple: "Arraste arquivos ou clique para selecionar",
  dropzoneAriaLabel: "Selecionar arquivos",
  cameraButton: "Capturar foto",
  cameraDialogTitle: "Capturar foto",
  cameraDialogDescription: 'Posicione o documento ou objeto na câmera e toque em "Tirar foto".',
  cameraCancel: "Cancelar",
  cameraTakePhoto: "Tirar foto",
  cameraStarting: "Iniciando câmera…",
  cameraUnavailable: "Câmera não disponível neste navegador.",
  cameraAccessFailed: "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
  fileListAriaLabel: "Arquivos selecionados",
  imageFallbackName: "Imagem",
  imageDownload: "Baixar imagem",
  imageDownloadSuccess: "Download concluído",
  imageDownloadError: "Não foi possível baixar a imagem",
  imageClose: "Fechar",
  zoomImage: (fileName) => `Ampliar ${fileName}`,
  openFile: (fileName) => `Abrir ${fileName} em nova aba`,
  downloadFile: (fileName) => `Baixar ${fileName}`,
  fileFallbackName: "Arquivo",
  removeFile: (fileName) => `Remover ${fileName}`,
  rejectedType: (fileName) => `${fileName}: tipo de arquivo não aceito`,
  rejectedSize: (fileName, limit) => `${fileName}: maior que ${limit}`,
  rejectedMaxFiles: (fileName, limit) =>
    limit === 1
      ? `${fileName}: só é possível enviar um arquivo`
      : `${fileName}: passa do limite de ${limit} arquivos`,
  uploading: (progress) => (progress == null ? "Enviando…" : `Enviando… ${Math.round(progress)}%`),
  uploadFailed: "Falha no envio",
  uploadProgress: (fileName) => `Envio de ${fileName}`,
  required: "obrigatório",
  requiredError: "Selecione um arquivo.",
  noFiles: "Nenhum arquivo.",
  maxSizeHint: (limit) => `até ${limit}`,
  sizeUnits: { bytes: "B", kilobytes: "KB", megabytes: "MB", gigabytes: "GB" },
}
```

### FileSizeUnits

`import type { FileSizeUnits } from "@amfernandesinc/ui"`

Unit texts of the sizes `FileUpload` shows.

```ts
export interface FileSizeUnits {
  bytes: string
  kilobytes: string
  megabytes: string
  gigabytes: string
}
```

### FileUploadItem

`import type { FileUploadItem } from "@amfernandesinc/ui"`

A file the component did not pick itself: an attachment that already exists on the server, or one that is on its way there.

```ts
export interface FileUploadItem {
  /** Stable identifier, usually the attachment's id on the server. */
  id: string
  name: string
  /** Size in bytes, when known. */
  size?: number
  /**
   * Where the file lives (`http:`, `https:` or a relative URL; anything else
   * is ignored). An image gets a thumbnail and opens enlarged, a PDF opens in
   * a new tab and any other file is downloaded.
   */
  url?: string
  /**
   * `"uploading"` shows the progress and `"error"` shows `error`.
   * @default "done"
   */
  status?: "uploading" | "done" | "error"
  /** 0 to 100, while `uploading`. Leave it out when the progress is unknown. */
  progress?: number
  /** Why the upload failed, when `status` is `"error"`. */
  error?: string
}
```

### FileUploadLabels

`import type { FileUploadLabels } from "@amfernandesinc/ui"`

```ts
export interface FileUploadLabels {
  /** Default label inside the dropzone when `multiple={false}`. */
  dropzoneSingle: string
  /** Default label inside the dropzone when `multiple={true}`. */
  dropzoneMultiple: string
  /**
   * @deprecated No longer used: the dropzone is named by its visible label,
   * whatever it holds (`aria-labelledby`).
   */
  dropzoneAriaLabel: string
  /** Camera trigger button label. */
  cameraButton: string
  /** Camera dialog title. */
  cameraDialogTitle: string
  /** Camera dialog description. */
  cameraDialogDescription: string
  /** Camera dialog cancel button. */
  cameraCancel: string
  /** Camera capture/take-photo button. */
  cameraTakePhoto: string
  /** Loader caption while the camera stream is starting. */
  cameraStarting: string
  /** Error message when getUserMedia is unavailable. */
  cameraUnavailable: string
  /** Error message when getUserMedia fails (permission denied / hardware error). */
  cameraAccessFailed: string
  /** aria-label of the file list `<ul>`. */
  fileListAriaLabel: string
  /** Lightbox title fallback when the image has no name. */
  imageFallbackName: string
  /** Lightbox "download image" button. */
  imageDownload?: string
  /** Toast shown after the image is saved. */
  imageDownloadSuccess?: string
  /** Toast shown when the image could not be saved. */
  imageDownloadError?: string
  /** Lightbox "close" button. */
  imageClose?: string
  /** Aria-label of the lightbox-open button for image rows: `(fileName) => ...`. */
  zoomImage: (fileName: string) => string
  /** Aria-label of the open-in-new-tab button of a PDF row. */
  openFile: (fileName: string) => string
  /** Aria-label of the download button of a row that is neither an image nor a PDF. */
  downloadFile?: (fileName: string) => string
  /** Download name of a file that has none. */
  fileFallbackName?: string
  /** Aria-label of the remove-row button. */
  removeFile: (fileName: string) => string
  /** Message for a file refused because its type is not in `accept`. */
  rejectedType?: (fileName: string) => string
  /** Message for a file larger than `maxSize`; `limit` is that size, formatted. */
  rejectedSize?: (fileName: string, limit: string) => string
  /** Message for a file beyond `maxFiles` (`limit` is 1 when not `multiple`). */
  rejectedMaxFiles?: (fileName: string, limit: number) => string
  /** Second line of an item being sent; `progress` is 0 to 100, or undefined when unknown. */
  uploading?: (progress?: number) => string
  /** Second line of an item whose upload failed and that brings no `error` text. */
  uploadFailed?: string
  /** Accessible name of the progress bar of an item being sent. */
  uploadProgress?: (fileName: string) => string
  /** Added to the dropzone's accessible name when `required` (after a visible `*`). */
  required?: string
  /** Shown, and announced, when a form is sent with a `required` field still empty. */
  requiredError?: string
  /** Shown in a `readOnly` field with no files. */
  noFiles?: string
  /** Part of the default hint that tells the size limit; `limit` is formatted. */
  maxSizeHint?: (limit: string) => string
  /**
   * Unit texts of every size shown (list, hint, refusal). The number is
   * always written the Brazilian way: `1,5 MB`.
   */
  sizeUnits?: FileSizeUnits
}
```

### FileUploadProps

`import type { FileUploadProps } from "@amfernandesinc/ui"`

```ts
export interface FileUploadProps {
  /** MIME pattern(s) accepted by the picker. Examples: `"image/*"`, `["image/png", "application/pdf"]`. Same syntax as native `<input accept>`. Checked only in the browser, against the type it infers from the file name: validate the file again on the server. */
  accept?: string | string[]
  /** Allow selecting more than one file. Default `false`. */
  multiple?: boolean
  /** Maximum bytes per file. Files larger than this are rejected. Compose with the `kb()` / `mb()` / `gb()` helpers from `@amfernandesinc/ui`. Checked only in the browser: enforce the limit on the server too. */
  maxSize?: number
  /** Maximum number of files when `multiple`. Extra files are rejected. */
  maxFiles?: number
  /** How to display selected files. `"thumbnail"` (default) shows an image preview tile (clickable: an image opens fullscreen, a PDF opens in a new tab, any other file is downloaded). `"none"` hides previews. */
  preview?: "thumbnail" | "none"
  /** Show an extra "Capturar foto" button that opens the device camera and snapshots a photo as `image/jpeg`. Requires HTTPS or localhost (`getUserMedia`). */
  camera?: boolean
  /** Controlled list of files. Pair with `onValueChange`. If omitted, the component manages its own state. */
  value?: File[]
  /** Called whenever the accepted file list changes. */
  onValueChange?: (files: File[]) => void
  /**
   * Files the component did not pick itself, shown in the same list, before
   * the chosen ones: attachments already saved on the server (give them a
   * `url`) and uploads in progress (`status`, `progress`, `error`). They are
   * yours to keep: the usual flow is to take a file from `onValueChange`,
   * start the upload and move it from `value` to `items`. They count towards
   * `maxFiles`.
   */
  items?: FileUploadItem[]
  /**
   * Called with the item's `id` when the user removes it. Without it, items
   * have no remove button.
   */
  onRemoveItem?: (id: string) => void
  /** Called when one or more files were dropped/selected but did not pass `accept`, `maxSize`, or `maxFiles`. */
  onReject?: (rejections: FileUploadRejection[]) => void
  /**
   * Show, under the dropzone, why each file of the last attempt was refused
   * (texts in `labels`). Set `false` when `onReject` already tells the user,
   * with a toast for instance. Default `true`.
   */
  showRejections?: boolean
  /** Disable user interaction. */
  disabled?: boolean
  /**
   * Shows the files without letting the list change: no dropzone, camera or
   * remove buttons; files can still be opened, previewed and downloaded, and
   * are sent with the form. The dropzone's place takes the `label`, and "no
   * files" (`labels.noFiles`) when the list is empty. The `ref` (the
   * dropzone) is `null`.
   */
  readOnly?: boolean
  /** Validation message — when set, the dropzone border turns red and the message renders below. */
  error?: string
  /** Main label inside the dropzone. */
  label?: React.ReactNode
  /** Secondary helper text below the label. Defaults to a hint derived from `accept` / `maxSize`. */
  description?: React.ReactNode
  /** Additional class on the outer wrapper. */
  className?: string
  /** Class on the dropzone clickable area. */
  dropzoneClassName?: string
  /** Show the per-row remove button. Set `false` to hide it: files can still be opened/previewed and new ones added through the dropzone (append-only). Default `true`. */
  removable?: boolean
  /** Show the download button in the image lightbox. Default `false` (view only). */
  downloadable?: boolean
  /** Override individual UI strings. Defaults are pt-BR. */
  labels?: Partial<FileUploadLabels>
  /** `id` of the dropzone button, for a `<label htmlFor>` or a link to the field. */
  id?: string
  /**
   * Name of the field in a native form: a hidden `<input type="file">`
   * carries the files of the list, so `FormData` gets them under this name.
   * `items` are not sent: they are already on the server.
   */
  name?: string
  /**
   * The list cannot be empty (chosen files or `items`). A native form is not
   * sent while it is: the message in `labels.requiredError` shows under the
   * dropzone and the focus goes to it.
   */
  required?: boolean
  /** The dropzone button: it takes the focus (`ref.current.focus()`), as React Hook Form does on an error. */
  ref?: React.Ref<HTMLButtonElement>
  /** Called when the focus leaves the field: the dropzone and the buttons of the list. */
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
}
```

### FileUploadRejection

`import type { FileUploadRejection } from "@amfernandesinc/ui"`

```ts
export interface FileUploadRejection {
  file: File
  reason: FileUploadRejectionReason
}
```

### FileUploadRejectionReason

`import type { FileUploadRejectionReason } from "@amfernandesinc/ui"`

```ts
export type FileUploadRejectionReason = "type" | "size" | "max-files"
```

## `domain/input-otp` — `@amfernandesinc/ui/input-otp`

### InputOTP

`import { InputOTP } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/input-otp"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `length` | `number` | **obrigatória** | — |
| `value` | `string` | — | The code typed so far. Without it, the field keeps its own value from `defaultValue`. |
| `defaultValue` | `string` | — | Initial code of an uncontrolled field. |
| `onValueChange` | `(value: string) => void` | — | — |
| `onComplete` | `(value: string) => void` | — | — |
| `pattern` | `string` | `REGEXP_ONLY_DIGITS` | Regular expression every character must match. Default: digits only. |
| `inputMode` | `"numeric" \| "text"` | — | Virtual keyboard on phones. Default: `"numeric"` when `pattern` accepts only digits, `"text"` when it accepts letters. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `disabled` | `boolean` | — | — |
| `readOnly` | `boolean` | `false` | Shows the code without letting it change (typing, pasting or deleting). It still takes focus, can be copied, and is sent with the form. |
| `name` | `string` | — | Name of the field in a native form, which receives the code as typed. |
| `onBlur` | `React.FocusEventHandler<HTMLInputElement>` | — | Called when the focus leaves the code. |
| `id` | `string` | — | — |
| `className` | `string` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | — |

### REGEXP_ONLY_DIGITS

`import { REGEXP_ONLY_DIGITS } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/input-otp"`

Reexportado de `input-otp` (mesmo tipo do pacote original).

### InputOTPProps

`import type { InputOTPProps } from "@amfernandesinc/ui"`

```ts
export interface InputOTPProps {
  length: number
  /** The code typed so far. Without it, the field keeps its own value from `defaultValue`. */
  value?: string
  /** Initial code of an uncontrolled field. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  /** Regular expression every character must match. Default: digits only. */
  pattern?: string
  /**
   * Virtual keyboard on phones. Default: `"numeric"` when `pattern` accepts
   * only digits, `"text"` when it accepts letters.
   */
  inputMode?: "numeric" | "text"
  label?: React.ReactNode
  description?: React.ReactNode
  error?: string
  labelPosition?: LabelPosition
  required?: boolean
  disabled?: boolean
  /**
   * Shows the code without letting it change (typing, pasting or deleting).
   * It still takes focus, can be copied, and is sent with the form.
   */
  readOnly?: boolean
  /** Name of the field in a native form, which receives the code as typed. */
  name?: string
  /** Called when the focus leaves the code. */
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  id?: string
  className?: string
  ref?: React.Ref<HTMLInputElement>
}
```

## `domain/multi-input` — `@amfernandesinc/ui/multi-input`

### MultiInput

`import { MultiInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/multi-input"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `MultiInputStringProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `type` | `"string"` | — | Free-text tokens (preserves insertion order, deduped). |
| `value` | `string[]` | — | The items. Without it, the field keeps its own list from `defaultValue`. |
| `onValueChange` | `(values: string[]) => void` | — | — |
| `labels` | `Partial<MultiInputLabels>` | — | Override individual UI strings. Defaults are pt-BR. |
| `defaultValue` | `string[] \| number[]` | — | Initial items of an uncontrolled field (also what a form reset brings back): strings, or numbers with `type="number"`. One type for both modes, so props spread from one mode into the other still type-check. |
| `size` | `ControlSize` | `"md"` | Minimum height of the box, border included: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or field of that size. It grows with the items. |
| `disabled` | `boolean` | — | — |
| `readOnly` | `boolean` | — | Shows the items without letting them change: no remove buttons, nothing typed or pasted is added. The field still takes focus, its items can be read and copied, and the list is sent with the form (unlike `disabled`). |
| `placeholder` | `string` | — | — |
| `error` | `string` | — | Validation message — when set, the wrapper turns red and the message renders below. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `id` | `string` | — | — |
| `aria-label` | `string` | — | Accessible name when there is no visible `label`. With a `label`, the field and the group are named by it and this is ignored. |
| `prefix` | `string` | — | Optional prefix rendered before each token in its Badge (e.g. "R$ ", "#"). |
| `suffix` | `string` | — | Optional suffix rendered after each token in its Badge (e.g. " dias", " %"). |
| `maxItems` | `number` | — | Maximum number of tokens. The ones already in the list always stay: new tokens enter while there is room and the rest are refused, with `onReject("max-items")`. When nothing fits, the typed text stays in the field. |
| `onReject` | `(reason: "max-items" \| "invalid") => void` | — | Called when input is rejected (e.g. invalid numeric token, exceeds maxItems). |
| `name` | `string` | — | Name of the field in a native form: a hidden input carries the list joined by commas (`"urgente,fiscal"`, `"10,35"`). |
| `className` | `string` | — | Class of the box that draws the border and holds the items. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the field (the text input and the items' remove buttons), after any typed text became an item. |
| `ref` | `React.Ref<HTMLInputElement>` | — | The text input: it takes the focus, as React Hook Form does on an error. |

#### `MultiInputNumberProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `type` | `"number"` | **obrigatória** | Positive-integer tokens (sorted ascending, deduped). Each piece must be an integer from end to end: `10.000`, `3,5` and `12x` are refused with `onReject("invalid")`, never read as 10, 3 and 5, or 12. Pieces are separated by space, semicolon, slash, line break or comma; a single comma right between two numbers (`3,5`) is a decimal, not a separator. |
| `value` | `number[]` | — | The items. Without it, the field keeps its own list from `defaultValue`. |
| `onValueChange` | `(values: number[]) => void` | — | — |
| `labels` | `Partial<MultiInputLabels>` | — | Override individual UI strings. Defaults are pt-BR. |
| `defaultValue` | `string[] \| number[]` | — | Initial items of an uncontrolled field (also what a form reset brings back): strings, or numbers with `type="number"`. One type for both modes, so props spread from one mode into the other still type-check. |
| `size` | `ControlSize` | `"md"` | Minimum height of the box, border included: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or field of that size. It grows with the items. |
| `disabled` | `boolean` | — | — |
| `readOnly` | `boolean` | — | Shows the items without letting them change: no remove buttons, nothing typed or pasted is added. The field still takes focus, its items can be read and copied, and the list is sent with the form (unlike `disabled`). |
| `placeholder` | `string` | — | — |
| `error` | `string` | — | Validation message — when set, the wrapper turns red and the message renders below. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `id` | `string` | — | — |
| `aria-label` | `string` | — | Accessible name when there is no visible `label`. With a `label`, the field and the group are named by it and this is ignored. |
| `prefix` | `string` | — | Optional prefix rendered before each token in its Badge (e.g. "R$ ", "#"). |
| `suffix` | `string` | — | Optional suffix rendered after each token in its Badge (e.g. " dias", " %"). |
| `maxItems` | `number` | — | Maximum number of tokens. The ones already in the list always stay: new tokens enter while there is room and the rest are refused, with `onReject("max-items")`. When nothing fits, the typed text stays in the field. |
| `onReject` | `(reason: "max-items" \| "invalid") => void` | — | Called when input is rejected (e.g. invalid numeric token, exceeds maxItems). |
| `name` | `string` | — | Name of the field in a native form: a hidden input carries the list joined by commas (`"urgente,fiscal"`, `"10,35"`). |
| `className` | `string` | — | Class of the box that draws the border and holds the items. |
| `onBlur` | `(event: React.FocusEvent<HTMLElement>) => void` | — | Called when the focus leaves the field (the text input and the items' remove buttons), after any typed text became an item. |
| `ref` | `React.Ref<HTMLInputElement>` | — | The text input: it takes the focus, as React Hook Form does on an error. |


### defaultMultiInputLabels

`import { defaultMultiInputLabels } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/multi-input"`

```ts
const defaultMultiInputLabels: MultiInputLabels = {
  placeholder: "Adicione um item",
  numberPlaceholder: "Adicione um número",
  list: "Lista de itens",
  numberList: "Lista de números",
  remove: (item) => `Remover ${item}`,
}
```

### MultiInputLabels

`import type { MultiInputLabels } from "@amfernandesinc/ui"`

```ts
export interface MultiInputLabels {
  /** Placeholder of an empty string list (the `placeholder` prop wins). */
  placeholder: string
  /** Placeholder of an empty number list (the `placeholder` prop wins). */
  numberPlaceholder: string
  /** Name of the group when there is no `label` nor `aria-label`. */
  list: string
  /** Same, for `type="number"`. */
  numberList: string
  /** Accessible name of an item's remove button; `item` has `prefix` and `suffix`. */
  remove: (item: string) => string
}
```

### MultiInputProps

`import type { MultiInputProps } from "@amfernandesinc/ui"`

```ts
type MultiInputProps = MultiInputStringProps | MultiInputNumberProps
```

## `domain/percentage-input` — `@amfernandesinc/ui/percentage-input`

### PercentageInput

`import { PercentageInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/percentage-input"`

As props são uma união: cada forma abaixo é um jeito de usar o componente.

#### `PercentageInputZeroProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `emptyValue` | `"zero"` | `"zero"` | What an empty field is worth. `"zero"` (the default): the field always holds a number, and clearing it goes back to `0,00`. `"null"`: the field can be empty, which is `null`, different from zero; the placeholder shows and a native `required` works. |
| `value` | `number` | — | The percentage (`12.5` is 12,50 %), controlled. Leave it out and the field keeps its own value, starting from `defaultValue`. |
| `defaultValue` | `number` | — | Initial value of an uncontrolled field. |
| `onValueChange` | `(value: number) => void` | — | Called with the percentage after every edit. |
| `max` | `number` | `100` | Largest percentage. A key (or a paste) that would take the value past it is refused: the field keeps what it had, and never shows a number the user did not type. |
| `min` | `number` | — | Smallest percentage. While typing, the value passes below it on its way up, so it is applied when the field loses focus, or on Enter, after an edit: a smaller value is raised to `min`. A negative `min` lets the field take negative percentages, with the minus key. |
| `decimals` | `0 \| 1 \| 2` | `2` | Decimal places shown and kept: `2` (12,50), `1` (12,5) or `0` (12). Typed digits fill the last place first, and a value with more places is rounded. |
| `required` | `boolean` | — | — |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).

#### `PercentageInputNullProps`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `emptyValue` | `"null"` | **obrigatória** | — |
| `value` | `number \| null` | — | The percentage, or `null` for an empty field. |
| `defaultValue` | `number \| null` | — | — |
| `onValueChange` | `(value: number \| null) => void` | — | Called with the percentage, or `null` when the field is cleared. |
| `max` | `number` | `100` | Largest percentage. A key (or a paste) that would take the value past it is refused: the field keeps what it had, and never shows a number the user did not type. |
| `min` | `number` | — | Smallest percentage. While typing, the value passes below it on its way up, so it is applied when the field loses focus, or on Enter, after an edit: a smaller value is raised to `min`. A negative `min` lets the field take negative percentages, with the minus key. |
| `decimals` | `0 \| 1 \| 2` | `2` | Decimal places shown and kept: `2` (12,50), `1` (12,5) or `0` (12). Typed digits fill the last place first, and a value with more places is rounded. |
| `required` | `boolean` | — | — |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `labelPosition` | `LabelPosition` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).


### PercentageInputProps

`import type { PercentageInputProps } from "@amfernandesinc/ui"`

```ts
type PercentageInputProps = PercentageInputZeroProps | PercentageInputNullProps
```

## `domain/phone-input` — `@amfernandesinc/ui/phone-input`

### PhoneInput

`import { PhoneInput } from "@amfernandesinc/ui"` ou `"@amfernandesinc/ui/phone-input"`

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| `value` | `string \| null` | — | O telefone como **dígitos limpos** (sem máscara). Pode conter de 0 a 11 dígitos enquanto o usuário digita. Ex.: `"11987654321"` (celular) ou `"1133334444"` (fixo). `null` é campo vazio; sem `value`, o campo guarda o próprio valor a partir de `defaultValue`. |
| `defaultValue` | `string` | — | Telefone inicial (dígitos limpos) de um campo não controlado. |
| `onValueChange` | `(value: string) => void` | — | Called with the clean value after every edit. |
| `size` | `ControlSize` | `"md"` | Height of the field: `sm` 32px, `md` 40px, `lg` 44px, the same as a button or select of that size. |
| `label` | `React.ReactNode` | — | — |
| `description` | `React.ReactNode` | — | — |
| `error` | `string` | — | — |
| `labelPosition` | `LabelPosition` | — | — |
| `required` | `boolean` | — | — |
| `readOnly` | `boolean` | — | Shows the value without letting it be edited: it stays readable, takes focus, can be copied and is submitted with the form. Use it for a field on a view-only screen; `disabled` is for a field that does not apply. |
| `name` | `string` | — | Name of the field in a native form. The form receives the **clean** value (what `onValueChange` reports), carried by a hidden input; the visible input, which shows the formatted text, has no name. |
| `ref` | `React.Ref<HTMLInputElement>` | — | Allows getting a ref to the component instance. Once the component unmounts, React will set `ref.current` to `null` (or call the ref with `null` if you passed a callback ref). |

Repassa também: atributos HTML do React (`Attributes`, `HTMLAttributes`, `InputHTMLAttributes`).

### PhoneInputProps

`import type { PhoneInputProps } from "@amfernandesinc/ui"`

```ts
interface PhoneInputProps extends MaskedInputProps {
  /**
   * O telefone como **dígitos limpos** (sem máscara).
   * Pode conter de 0 a 11 dígitos enquanto o usuário digita.
   * Ex.: `"11987654321"` (celular) ou `"1133334444"` (fixo). `null` é campo
   * vazio; sem `value`, o campo guarda o próprio valor a partir de
   * `defaultValue`.
   */
  value?: string | null
  /** Telefone inicial (dígitos limpos) de um campo não controlado. */
  defaultValue?: string
}
```
