import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

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
          "Campo de upload de arquivos com **drag-and-drop**, clique para abrir o seletor nativo e validação configurável.",
          "",
          "**Props principais:**",
          "- `accept` — string ou array de padrões (`'image/*'`, `['image/png', 'application/pdf']`, `.csv`).",
          "- `multiple` — permite selecionar mais de um arquivo (default `false`).",
          "- `maxSize` — tamanho máximo por arquivo em bytes (excedente vai para `onReject`).",
          "- `maxFiles` — limite total quando `multiple` (excedente vai para `onReject`).",
          "- `preview` — `'thumbnail'` (default, mostra preview de imagens), `'list'` (só nome/tamanho), `'none'`.",
          "- `value` / `onValueChange` — modo controlado. Sem `value`, o componente gerencia o próprio estado.",
          "- `onReject` — recebe `{file, reason}` para tipos inválidos (`'type'`), arquivos grandes (`'size'`) ou excesso (`'max-files'`).",
          "- `label`, `description` — textos do dropzone (defaults derivam de `accept`/`maxSize`).",
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
      description: "Tamanho máximo por arquivo em **bytes**.",
      table: { type: { summary: "number" } },
    },
    maxFiles: {
      control: { type: "number", min: 1, step: 1 },
      description: "Quantidade máxima quando `multiple` está ligado.",
      table: { type: { summary: "number" } },
    },
    preview: {
      control: "inline-radio",
      options: ["thumbnail", "list", "none"],
      description: "Como renderizar arquivos selecionados.",
      table: {
        type: { summary: "'thumbnail' | 'list' | 'none'" },
        defaultValue: { summary: "'thumbnail'" },
      },
    },
    disabled: { control: "boolean", description: "Desabilita o dropzone e o seletor." },
    error: { control: "boolean", description: "Aplica borda destrutiva (use junto com `Field`)." },
    label: { control: "text", description: "Texto principal do dropzone." },
    description: {
      control: "text",
      description: "Texto secundário. Default deriva de `accept`/`maxSize`.",
    },
  },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    accept: "image/*,application/pdf",
    multiple: false,
    preview: "thumbnail",
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

export const PDFsListView: Story = {
  render: () => (
    <FileUpload
      accept="application/pdf"
      multiple
      maxFiles={5}
      maxSize={2 * 1024 * 1024}
      preview="list"
      label="Anexar PDFs"
    />
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
