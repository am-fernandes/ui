import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { mb } from "../lib/size"
import { toast } from "../overlays/sonner"
import { FileUpload, type FileUploadRejection } from "./file-upload"

const meta = {
  title: "Domain/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Campo de upload de arquivos com **drag-and-drop**, clique para abrir o seletor nativo, **captura por câmera** opcional e validação configurável.",
          "",
          '**Comportamento do preview (`preview="thumbnail"`):**',
          "- Imagens: clicar na miniatura abre a foto em **tela cheia** (lightbox).",
          "- Documentos (PDF, etc.): clicar abre o arquivo em uma **nova aba** via blob URL.",
          "",
          "**Props principais:**",
          "- `accept` — string ou array de padrões (`'image/*'`, `['image/png', 'application/pdf']`, `.csv`).",
          "- `multiple` — permite selecionar mais de um arquivo (default `false`).",
          "- `maxSize` — tamanho máximo por arquivo em bytes. Use os helpers `kb(500)`, `mb(2)`, `gb(1)` para legibilidade.",
          "- `maxFiles` — limite total quando `multiple` (excedente vai para `onReject`).",
          "- `preview` — `'thumbnail'` (default) ou `'none'`.",
          "- `camera` — adiciona o botão **Capturar foto** que abre a câmera (`getUserMedia`) e salva a foto como `image/jpeg`.",
          "- `value` / `onValueChange` — modo controlado. Sem `value`, o componente gerencia o próprio estado.",
          "- `onReject` — recebe `{file, reason}` para tipos inválidos (`'type'`), arquivos grandes (`'size'`) ou excesso (`'max-files'`).",
          "- `label`, `description` — textos do dropzone (defaults derivam de `accept`/`maxSize`).",
          "",
          "**Helpers de tamanho (`@am-fernandes/ui`):**",
          "",
          "```tsx",
          'import { FileUpload, kb, mb, gb } from "@am-fernandes/ui"',
          "",
          "<FileUpload maxSize={mb(2)} />     // 2 MiB",
          "<FileUpload maxSize={kb(500)} />   // 500 KiB",
          "<FileUpload maxSize={gb(1)} />     // 1 GiB",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    accept: {
      control: "text",
      description:
        "Padrão MIME aceito (`image/*`, `application/pdf`, `.csv`) — mesma sintaxe do `<input accept>` nativo.",
      table: { type: { summary: "string | string[]" } },
    },
    multiple: {
      control: "boolean",
      description: "Permite selecionar vários arquivos.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    maxSize: {
      control: { type: "number", min: 0, step: 1024 },
      description: "Tamanho máximo por arquivo em **bytes**. Use `kb(n)` / `mb(n)` / `gb(n)`.",
      table: { type: { summary: "number" } },
    },
    maxFiles: {
      control: { type: "number", min: 1, step: 1 },
      description: "Quantidade máxima quando `multiple` está ligado.",
      table: { type: { summary: "number" } },
    },
    preview: {
      control: "inline-radio",
      options: ["thumbnail", "none"],
      description:
        "`thumbnail` exibe a miniatura clicável (imagem → tela cheia, doc → nova aba). `none` esconde a lista.",
      table: {
        type: { summary: "'thumbnail' | 'none'" },
        defaultValue: { summary: "'thumbnail'" },
      },
    },
    camera: {
      control: "boolean",
      description:
        "Adiciona o botão **Capturar foto** que abre a câmera do dispositivo via `getUserMedia` e salva a foto como `image/jpeg`. Requer HTTPS ou localhost.",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: { control: "boolean", description: "Desabilita o dropzone e o seletor." },
    error: { control: "boolean", description: "Aplica borda destrutiva (use junto com `Field`)." },
    label: { control: "text", description: "Texto principal do dropzone." },
    description: {
      control: "text",
      description: "Texto secundário. Default deriva de `accept`/`maxSize`.",
    },
    onValueChange: { control: false, table: { category: "Eventos" } },
    onReject: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    accept: "image/*,application/pdf",
    multiple: false,
    preview: "thumbnail",
    camera: false,
    disabled: false,
    error: false,
  },
}

export const Default: Story = {
  render: () => <FileUpload />,
}

export const ImagensComPreview: Story = {
  render: () => <FileUpload accept="image/*" multiple maxFiles={4} preview="thumbnail" />,
}

export const ComCamera: Story = {
  name: "Com câmera + upload",
  render: () => (
    <FileUpload
      accept="image/*,application/pdf"
      multiple
      maxFiles={5}
      maxSize={mb(5)}
      camera
      description="Envie arquivos ou tire uma foto. Imagens/PDF até 5 MB."
    />
  ),
}

export const HelpersDeTamanho: Story = {
  name: "Helpers kb/mb/gb",
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs text-muted-foreground">
          <code>maxSize=&#123;kb(500)&#125;</code>
        </p>
        <FileUpload accept="image/*" maxSize={500 * 1024} />
      </div>
      <div>
        <p className="mb-1 text-xs text-muted-foreground">
          <code>maxSize=&#123;mb(2)&#125;</code>
        </p>
        <FileUpload accept="application/pdf" maxSize={mb(2)} />
      </div>
    </div>
  ),
}

export const Controlled: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return (
      <div className="space-y-3">
        <FileUpload
          value={files}
          onValueChange={setFiles}
          multiple
          accept="image/*,application/pdf"
        />
        <p className="text-xs text-muted-foreground">
          Estado externo: {files.length} arquivo{files.length === 1 ? "" : "s"}.
        </p>
      </div>
    )
  },
}

export const ComRejeicaoEToast: Story = {
  render: () => {
    function handleReject(rejections: FileUploadRejection[]) {
      for (const r of rejections) {
        const reason =
          r.reason === "type"
            ? "tipo não permitido"
            : r.reason === "size"
              ? "arquivo grande demais"
              : "excede o limite de arquivos"
        toast.error(`${r.file.name}: ${reason}`)
      }
    }
    return (
      <FileUpload
        accept="image/png,image/jpeg"
        maxSize={500 * 1024}
        multiple
        maxFiles={3}
        onReject={handleReject}
        description="PNG/JPEG até 500 KB · máx. 3 arquivos"
      />
    )
  },
}

export const Disabled: Story = {
  render: () => <FileUpload disabled />,
}

export const ErrorState: Story = {
  render: () => <FileUpload error description="Selecione ao menos um arquivo." />,
}
