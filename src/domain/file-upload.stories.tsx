import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"

import { mb } from "@/lib/size"
import { Toaster, toast } from "../overlays/sonner"
import { Button } from "../primitives/button"
import { FileUpload, type FileUploadItem, type FileUploadRejection } from "./file-upload"

const meta = {
  title: "Domain/FileUpload",
  component: FileUpload,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
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
          "- `preview` — `'thumbnail'` (default) ou `'none'`. Na lista, uma imagem abre ampliada, um PDF abre em outra aba e qualquer outro arquivo é baixado: um `.html` aberto por blob URL rodaria script na origem da aplicação.",
          "- `camera` — adiciona botão de captura via `getUserMedia` (HTTPS/localhost).",
          "- `value` / `onValueChange` — modo controlado.",
          "- `items` / `onRemoveItem` — anexos que já estão no servidor e envios em andamento (`status`, `progress`, `error`), na mesma lista.",
          "- Anexo com nome `.pdf` e `url` do próprio domínio abre em outra aba na origem da aplicação. O servidor precisa enviar `Content-Type: application/pdf` e `X-Content-Type-Options: nosniff`; sem isso, um HTML ou SVG renomeado roda script ali.",
          "- `onReject` — chamado com `{ file, reason: 'type' | 'size' | 'max-files' }[]`.",
          "- `showRejections` — mostra, embaixo da dropzone, por que cada arquivo da última tentativa foi recusado (padrão `true`; os textos ficam em `labels`). Passe `false` quando `onReject` já avisa, com um toast por exemplo.",
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

export const AppendOnly: Story = {
  render: () => {
    const [files] = useState(() => [
      new File(["conteúdo"], "contrato.pdf", { type: "application/pdf" }),
    ])
    return (
      <div className="w-[460px]">
        <FileUpload multiple removable={false} value={files} label="Anexos do processo" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`removable={false}` esconde o botão de remover (append-only): a linha continua abrível e o dropzone aceita novos arquivos.",
      },
    },
  },
}

export const ReadOnly: Story = {
  render: () => {
    const [files] = useState(() => [
      new File(["conteúdo"], "contrato.pdf", { type: "application/pdf" }),
    ])
    return (
      <form className="flex w-[460px] flex-col gap-6" onSubmit={(event) => event.preventDefault()}>
        <FileUpload
          readOnly
          multiple
          name="anexos"
          value={files}
          label="Anexos do processo"
          description="Enviados pelo cliente; só a equipe jurídica altera."
        />
        <FileUpload readOnly label="Comprovante de renda" />
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          '`readOnly`: sem dropzone, câmera ou botão de remover; os arquivos continuam abríveis e vão no formulário. Sem arquivos, aparece "Nenhum arquivo." (`labels.noFiles`).',
      },
    },
  },
}

export const WithDownload: Story = {
  render: () => {
    const [files] = useState(() => [new File(["x"], "foto.png", { type: "image/png" })])
    return (
      <div className="w-[460px]">
        <FileUpload downloadable accept="image/*" value={files} label="Evidências" />
        <Toaster />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`downloadable` exibe o botão de download no lightbox (`showSaveFilePicker` com fallback `<a download>`). Sem a prop, o lightbox é só visualização.",
      },
    },
  },
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
            <Button variant="ghost" onClick={() => setFiles([])}>
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
          showRejections={false}
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
          "Por padrão o componente já explica, embaixo da dropzone, por que um arquivo foi recusado. Para avisar de outro jeito, combine `onReject` com `toast` (distinguindo `type`, `size` e `max-files`) e desligue a mensagem embutida com `showRejections={false}`.",
      },
    },
  },
}

export const ExistingAttachments: Story = {
  render: () => {
    const [items, setItems] = useState<FileUploadItem[]>([
      { id: "a1", name: "contrato-assinado.pdf", size: 245_760, url: "/anexos/contrato.pdf" },
      { id: "a2", name: "planilha-de-custos.xlsx", size: 18_432, url: "/anexos/custos.xlsx" },
      { id: "a3", name: "matricula.pdf", status: "error", error: "O servidor recusou o arquivo" },
    ])

    // Simula o envio: cada arquivo escolhido vira um item que avança até
    // "done". Numa tela real, o progresso vem do upload.
    useEffect(() => {
      if (!items.some((item) => item.status === "uploading")) return
      const timer = setTimeout(() => {
        setItems((current) =>
          current.map((item) => {
            if (item.status !== "uploading") return item
            const progress = (item.progress ?? 0) + 25
            return progress >= 100
              ? { ...item, status: "done", progress: undefined }
              : { ...item, progress }
          }),
        )
      }, 600)
      return () => clearTimeout(timer)
    }, [items])

    return (
      <div className="w-[460px]">
        <FileUpload
          multiple
          maxFiles={6}
          label="Documentos do processo"
          items={items}
          onRemoveItem={(id) => setItems((current) => current.filter((item) => item.id !== id))}
          value={[]}
          onValueChange={(files) =>
            setItems((current) => [
              ...current,
              ...files.map((file) => ({
                id: `${file.name}-${file.lastModified}`,
                name: file.name,
                size: file.size,
                status: "uploading" as const,
                progress: 0,
              })),
            ])
          }
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "`items` mostra, na mesma lista, o que o componente não escolheu: anexos que já estão no servidor (com `url`, um PDF abre em outra aba e o resto é baixado) e envios em andamento ou com falha. O fluxo usual: receber o arquivo em `onValueChange`, começar o envio e passar o arquivo para `items`. `onRemoveItem(id)` recebe a remoção; os itens contam para `maxFiles`.",
      },
    },
  },
}

export const NativeForm: Story = {
  render: () => {
    const [sent, setSent] = useState<string | null>(null)
    return (
      <form
        className="flex w-[460px] flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          const names = new FormData(e.currentTarget)
            .getAll("anexos")
            .map((entry) => (entry instanceof File ? entry.name : String(entry)))
            .filter((entry) => entry !== "")
          setSent(names.length > 0 ? names.join(", ") : "(nenhum arquivo)")
        }}
      >
        <FileUpload multiple name="anexos" required label="Anexar documentos" />
        <div className="flex items-center gap-3">
          <Button type="submit">Enviar</Button>
          <Button type="reset" variant="outline" onClick={() => setSent(null)}>
            Limpar
          </Button>
          <output data-testid="form-data" className="text-sm text-muted-foreground">
            {sent ?? ""}
          </output>
        </div>
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Num `<form>` nativo, `name` faz o `FormData` receber os arquivos da lista e `required` impede o envio com a lista vazia: o aviso aparece embaixo da dropzone e o foco vai para ela. O reset do formulário (o botão **Limpar**, `form.reset()` ou o reset que o React 19 faz depois de uma `action`) esvazia a lista, como num `<input type="file">`. `id` vai para a dropzone e `ref` aponta para ela.',
      },
    },
  },
}

export const NativeFormControlled: Story = {
  render: () => {
    const [files, setFiles] = useState<File[]>([])
    const [sent, setSent] = useState<string | null>(null)
    return (
      <form
        className="flex w-[460px] flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          const names = new FormData(e.currentTarget)
            .getAll("anexos")
            .map((entry) => (entry instanceof File ? entry.name : String(entry)))
            .filter((entry) => entry !== "")
          setSent(names.length > 0 ? names.join(", ") : "(nenhum arquivo)")
        }}
      >
        <FileUpload
          multiple
          name="anexos"
          label="Anexar documentos"
          value={files}
          onValueChange={setFiles}
        />
        <div className="flex items-center gap-3">
          <Button type="submit">Enviar</Button>
          <Button type="reset" variant="outline">
            Redefinir outros campos
          </Button>
          <output data-testid="form-data" className="text-sm text-muted-foreground">
            {sent ?? ""}
          </output>
        </div>
      </form>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          "Controlado num `<form>` nativo: a lista é do app. Um reset do formulário não a apaga, e o `FormData` continua recebendo os arquivos que estão na tela.",
      },
    },
  },
}
