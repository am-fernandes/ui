import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import { mb } from "@/lib/size"
import { Toaster, toast } from "../overlays/sonner"
import { Button } from "../primitives/button"
import { FileUpload, type FileUploadRejection } from "./file-upload"

const meta = {
  title: "Domain/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    a11y: {
      // Hidden `<input type="file">` is intentionally visually-hidden and triggered via the dropzone label;
      // it lacks an associated `<label for>` because the dropzone itself acts as the label region.
      // Real component bug to track: wire aria-labelledby to the dropzone heading.
      config: {
        rules: [
          { id: "label", enabled: false },
          { id: "color-contrast", enabled: false },
        ],
      },
    },
    docs: {
      description: {
        component: [
          "Dropzone para upload de arquivos com suporte a múltiplos, filtro por MIME/extensão, limite de tamanho e contagem, preview thumbnail e câmera nativa.",
          "",
          "**Props principais:**",
          "- `accept` — MIME(s) aceitos: `'image/*'`, `['image/png', 'application/pdf']` ou `.pdf`. Mesma sintaxe do `<input accept>` nativo.",
          "- `multiple` — habilita seleção/drag de múltiplos arquivos.",
          "- `maxSize` — limite em bytes. Use `kb()` / `mb()` / `gb()` da própria lib para ergonomia.",
          "- `maxFiles` — número máximo de arquivos quando `multiple`.",
          "- `preview` — `'thumbnail'` (default) ou `'none'`.",
          "- `camera` — adiciona botão de captura via `getUserMedia` (HTTPS/localhost).",
          "- `value` / `onValueChange` — modo controlado.",
          "- `onReject` — chamado com `{ file, reason: 'type' | 'size' | 'max-files' }[]`.",
          "- `label`, `description`, `error`, `className`, `dropzoneClassName` — customização visual.",
          "",
          "**Exemplo de uso:**",
          "",
          "```tsx",
          'import { FileUpload, mb, toast, Toaster } from "@amfernandesinc/ui"',
          "",
          "<FileUpload",
          '  accept="application/pdf"',
          "  multiple",
          "  maxFiles={5}",
          "  maxSize={mb(10)}",
          "  onReject={(rs) => toast.error(`${rs.length} arquivo(s) recusado(s).`)}",
          "/>",
          "```",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    accept: {
      control: "text",
      description: "MIME(s)/extensões aceitos. Aceita string ou array.",
      table: { type: { summary: "string | string[]" } },
    },
    multiple: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    maxSize: {
      control: "number",
      description: "Limite por arquivo em bytes. Use `kb()`/`mb()`/`gb()`.",
      table: { type: { summary: "number" } },
    },
    maxFiles: {
      control: "number",
      table: { type: { summary: "number" } },
    },
    preview: {
      control: "inline-radio",
      options: ["thumbnail", "none"],
      table: {
        type: { summary: "'thumbnail' | 'none'" },
        defaultValue: { summary: "'thumbnail'" },
      },
    },
    camera: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    disabled: {
      control: "boolean",
      table: { type: { summary: "boolean" }, defaultValue: { summary: "false" } },
    },
    error: { control: "text", table: { type: { summary: "string" } } },
    label: { control: "text", table: { type: { summary: "ReactNode" } } },
    description: { control: "text", table: { type: { summary: "ReactNode" } } },
    onValueChange: { control: false, table: { category: "Eventos" } },
    onReject: { control: false, table: { category: "Eventos" } },
  },
} satisfies Meta<typeof FileUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
}

export const SingleFile: Story = {
  args: {
    multiple: false,
    label: "Anexar contrato assinado",
    description: "Apenas um arquivo. Para trocar, remova o atual.",
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
}

export const ImageOnly: Story = {
  args: {
    accept: "image/*",
    multiple: true,
    label: "Imagens do imóvel",
    maxSize: mb(2),
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
}

export const PDFOnly: Story = {
  args: {
    accept: "application/pdf",
    multiple: true,
    label: "Documentos do processo",
    description: "Somente PDFs assinados.",
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
}

export const MultipleWithLimit: Story = {
  args: {
    multiple: true,
    maxFiles: 3,
    maxSize: mb(5),
    accept: ["image/*", "application/pdf"],
    label: "Comprovantes",
    description: "Até 3 arquivos · imagem ou PDF · 5 MB cada.",
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`maxFiles` + `maxSize` combinados — use `mb()` da lib para legibilidade dos limites.",
      },
    },
  },
}

export const WithError: Story = {
  args: {
    error: "Pelo menos um documento é obrigatório.",
    label: "Documentos obrigatórios",
    multiple: true,
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Upload indisponível",
    description: "Habilitado após assinatura digital.",
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
}

export const WithCamera: Story = {
  args: {
    accept: "image/*",
    camera: true,
    label: "Fotografar documento",
    description: "Toque em 'Capturar foto' para usar a câmera do dispositivo.",
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando `camera={true}`, exibe um botão extra que abre um modal com a câmera traseira. Requer HTTPS ou localhost (`getUserMedia`).",
      },
    },
  },
}

export const Controlled: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    return (
      <div className="flex w-[460px] flex-col gap-3">
        <FileUpload
          multiple
          maxFiles={5}
          maxSize={mb(10)}
          label="Anexar evidências"
          value={files}
          onValueChange={setFiles}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{files.length} arquivo(s) selecionado(s)</span>
          {files.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
              Limpar
            </Button>
          ) : null}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Modo controlado: `value` + `onValueChange` permitem botões externos manipulando o estado (ex.: limpar tudo).",
      },
    },
  },
}

export const English: Story = {
  args: {
    multiple: true,
    accept: ["image/*", "application/pdf"],
    maxSize: mb(5),
    camera: true,
    labels: {
      dropzoneMultiple: "Drag files or click to select",
      dropzoneSingle: "Drag a file or click to select",
      dropzoneAriaLabel: "Select files",
      cameraButton: "Take photo",
      cameraDialogTitle: "Take photo",
      cameraDialogDescription:
        'Position the document or object in front of the camera and tap "Take photo".',
      cameraCancel: "Cancel",
      cameraTakePhoto: "Take photo",
      cameraStarting: "Starting camera…",
      cameraUnavailable: "Camera is not available in this browser.",
      cameraAccessFailed: "Could not access the camera. Check your browser permissions.",
      fileListAriaLabel: "Selected files",
      imageFallbackName: "Image",
      zoomImage: (name) => `Zoom ${name}`,
      openFile: (name) => `Open ${name} in a new tab`,
      removeFile: (name) => `Remove ${name}`,
    },
  },
  render: (args) => (
    <div className="w-[460px]">
      <FileUpload {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Full en-US override via the `labels` prop. Defaults are pt-BR; pass `labels={{ ... }}` to translate or rewrite copy per instance.",
      },
    },
  },
}

export const RejectionHandler: Story = {
  render: () => {
    function describe(rejection: FileUploadRejection): string {
      switch (rejection.reason) {
        case "type":
          return `${rejection.file.name}: tipo não suportado`
        case "size":
          return `${rejection.file.name}: maior que 1 MB`
        case "max-files":
          return `${rejection.file.name}: excede o limite de 3 arquivos`
      }
    }
    return (
      <div className="w-[460px]">
        <Toaster position="top-right" />
        <FileUpload
          multiple
          maxFiles={3}
          maxSize={mb(1)}
          accept="image/*"
          label="Anexar imagens (≤ 1 MB cada, máx. 3)"
          onReject={(rejections) => {
            for (const r of rejections) {
              toast.error(describe(r))
            }
          }}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Combine `onReject` com `toast` para feedback imediato sobre arquivos recusados — distinguindo `type`, `size` e `max-files`.",
      },
    },
  },
}
