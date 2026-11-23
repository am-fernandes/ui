"use client"

import {
  Camera,
  Download,
  File as FileIcon,
  ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react"
import * as React from "react"

import { DEFAULT_ALLOWED_RESOURCE_PROTOCOLS, isAllowedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { Dialog } from "../overlays/dialog"
import { Progress } from "../overlays/progress"
import { toast } from "../overlays/sonner"
import { Button } from "../primitives/button"

export type FileUploadRejectionReason = "type" | "size" | "max-files"

export interface FileUploadRejection {
  file: File
  reason: FileUploadRejectionReason
}

/**
 * A file the component did not pick itself: an attachment that already exists
 * on the server, or one that is on its way there.
 */
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
  /** Part of the default hint that tells the size limit; `limit` is formatted. */
  maxSizeHint?: (limit: string) => string
  /**
   * Unit texts of every size shown (list, hint, refusal). The number is
   * always written the Brazilian way: `1,5 MB`.
   */
  sizeUnits?: FileSizeUnits
}

/** Unit texts of the sizes `FileUpload` shows. */
export interface FileSizeUnits {
  bytes: string
  kilobytes: string
  megabytes: string
  gigabytes: string
}

type ResolvedFileUploadLabels = Required<FileUploadLabels>

export const defaultFileUploadLabels: ResolvedFileUploadLabels = {
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
  maxSizeHint: (limit) => `até ${limit}`,
  sizeUnits: { bytes: "B", kilobytes: "KB", megabytes: "MB", gigabytes: "GB" },
}

export interface FileUploadProps {
  /** MIME pattern(s) accepted by the picker. Examples: `"image/*"`, `["image/png", "application/pdf"]`. Same syntax as native `<input accept>`. */
  accept?: string | string[]
  /** Allow selecting more than one file. Default `false`. */
  multiple?: boolean
  /** Maximum bytes per file. Files larger than this are rejected. Compose with the `kb()` / `mb()` / `gb()` helpers from `@amfernandesinc/ui`. */
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
}

function normalizeAccept(accept?: string | string[]): string | undefined {
  if (accept == null) return undefined
  return Array.isArray(accept) ? accept.join(",") : accept
}

function fileMatchesAccept(file: File, accept?: string | string[]): boolean {
  if (accept == null) return true
  const patterns = Array.isArray(accept) ? accept : accept.split(",").map((s) => s.trim())
  if (patterns.length === 0) return true
  return patterns.some((pattern) => {
    if (!pattern) return false
    if (pattern.startsWith(".")) {
      const name = file.name.toLowerCase()
      const ext = pattern.toLowerCase()
      // Require a stem before the extension — files literally named ".pdf" should not match ".pdf".
      return name.length > ext.length && name.endsWith(ext)
    }
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1)
      return file.type.startsWith(prefix)
    }
    return file.type === pattern
  })
}

const sizeNumber = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** `1536` → `"1,5 KB"`; whole bytes below 1 KB (`"10 B"`). */
function formatBytes(bytes: number, units: FileSizeUnits): string {
  if (bytes < 1024) return `${bytes} ${units.bytes}`
  const scale = [units.kilobytes, units.megabytes, units.gigabytes]
  let value = bytes / 1024
  let unit = 0
  // Move up while the rounded number would read 1.024 or more of a unit.
  while (unit < scale.length - 1 && Math.round(value * 10) / 10 >= 1024) {
    value /= 1024
    unit += 1
  }
  return `${sizeNumber.format(value)} ${scale[unit]}`
}

/** What tells two picks of the same file on disk apart from two different files. */
function fileKey(file: File) {
  return `${file.name}\u0000${file.size}\u0000${file.lastModified}\u0000${file.type}`
}

function defaultDescription(
  labels: ResolvedFileUploadLabels,
  accept?: string | string[],
  maxSize?: number,
) {
  const parts: string[] = []
  if (accept != null) {
    const patterns = Array.isArray(accept) ? accept : accept.split(",").map((s) => s.trim())
    parts.push(patterns.join(", "))
  }
  if (maxSize != null) parts.push(labels.maxSizeHint(formatBytes(maxSize, labels.sizeUnits)))
  return parts.length > 0 ? parts.join(" · ") : null
}

function FileUpload({
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  preview = "thumbnail",
  camera = false,
  value,
  onValueChange,
  items = NO_ITEMS,
  onRemoveItem,
  onReject,
  showRejections = true,
  disabled = false,
  error,
  label,
  description,
  className,
  dropzoneClassName,
  removable = true,
  downloadable = false,
  labels,
}: FileUploadProps) {
  const mergedLabels: ResolvedFileUploadLabels = { ...defaultFileUploadLabels, ...labels }
  const resolvedLabel: React.ReactNode =
    label ?? (multiple ? mergedLabels.dropzoneMultiple : mergedLabels.dropzoneSingle)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const baseId = React.useId()
  const labelId = `${baseId}-label`
  const hintId = `${baseId}-hint`
  const errorId = `${baseId}-error`
  const rejectionsId = `${baseId}-rejections`
  const [internal, setInternal] = React.useState<File[]>([])
  // What the last attempt refused: shown until the next one.
  const [rejected, setRejected] = React.useState<FileUploadRejection[]>([])
  const [isDragging, setDragging] = React.useState(false)
  const [cameraOpen, setCameraOpen] = React.useState(false)
  const [lightbox, setLightbox] = React.useState<LightboxImage | null>(null)

  const isControlled = value !== undefined
  const files = isControlled ? value : internal

  const setFiles = React.useCallback(
    (next: File[]) => {
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const ingest = React.useCallback(
    (incoming: FileList | File[] | null) => {
      if (!incoming) return
      const incomingArr = Array.from(incoming)
      const rejections: FileUploadRejection[] = []
      const accepted: File[] = []

      for (const file of incomingArr) {
        if (!fileMatchesAccept(file, accept)) {
          rejections.push({ file, reason: "type" })
          continue
        }
        if (maxSize != null && file.size > maxSize) {
          rejections.push({ file, reason: "size" })
          continue
        }
        accepted.push(file)
      }

      let next: File[]
      if (multiple) {
        // A file already in the list (picked again, or twice in one drop) is
        // left out quietly: it is there to see, and would be sent twice.
        const seen = new Set(files.map(fileKey))
        const fresh = accepted.filter((file) => {
          const key = fileKey(file)
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        next = fresh.length === 0 ? files : [...files, ...fresh]
        // The items already take part of the room.
        const room = maxFiles == null ? next.length : Math.max(0, maxFiles - items.length)
        if (next.length > room) {
          const overflow = next.slice(room)
          for (const file of overflow) rejections.push({ file, reason: "max-files" })
          next = next.slice(0, room)
        }
      } else {
        next = accepted.length > 0 ? [accepted[0] as File] : files
        if (accepted.length > 1) {
          for (const file of accepted.slice(1)) rejections.push({ file, reason: "max-files" })
        }
      }

      setRejected(rejections)
      if (rejections.length > 0) onReject?.(rejections)
      if (next !== files) setFiles(next)
    },
    [accept, files, items.length, maxFiles, maxSize, multiple, onReject, setFiles],
  )

  const removeAt = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
  }

  const openPicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const renderedDescription =
    description !== undefined ? description : defaultDescription(mergedLabels, accept, maxSize)

  const hasError = error != null && error !== ""
  const hasHint = renderedDescription != null && renderedDescription !== ""
  const hasRejections = showRejections && rejected.length > 0
  // The label names the dropzone; the type and size hint, the error and the
  // reasons of the last refusal describe it, so a screen reader hears them.
  const describedBy = [
    hasHint ? hintId : null,
    hasError ? errorId : null,
    hasRejections ? rejectionsId : null,
  ]
    .filter((id) => id !== null)
    .join(" ")

  const rejectionMessage = ({ file, reason }: FileUploadRejection) => {
    if (reason === "type") return mergedLabels.rejectedType(file.name)
    if (reason === "size")
      return mergedLabels.rejectedSize(file.name, formatBytes(maxSize ?? 0, mergedLabels.sizeUnits))
    return mergedLabels.rejectedMaxFiles(file.name, multiple ? (maxFiles ?? 1) : 1)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} data-slot="file-upload">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <button
          type="button"
          onClick={openPicker}
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            if (disabled) return
            ingest(e.dataTransfer.files)
          }}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-describedby={describedBy === "" ? undefined : describedBy}
          className={cn(
            "flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-element border border-dashed border-input bg-transparent px-4 py-6 text-sm transition-colors cursor-pointer",
            "state-layer",
            "focus-visible:focus-outline",
            isDragging && "border-primary bg-accent/60",
            hasError && "border-destructive-text",
            disabled && "cursor-default opacity-50",
            dropzoneClassName,
          )}
        >
          <UploadCloud className="size-6 text-muted-foreground" aria-hidden />
          <span id={labelId} className="font-medium">
            {resolvedLabel}
          </span>
          {hasHint ? (
            <span id={hintId} className="text-xs text-muted-foreground">
              {renderedDescription}
            </span>
          ) : null}
        </button>
        {camera ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => setCameraOpen(true)}
            className="sm:h-auto sm:min-h-26 sm:flex-col sm:gap-2 sm:px-6"
          >
            <Camera className="size-5" aria-hidden />
            <span>{mergedLabels.cameraButton}</span>
          </Button>
        ) : null}
      </div>
      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-destructive-text">
          {error}
        </p>
      ) : null}
      {hasRejections ? (
        // The alert wraps the list: on the <ul> itself the role would replace
        // "list" and leave the items without one.
        <div
          id={rejectionsId}
          role="alert"
          data-slot="file-upload-rejections"
          className="text-xs text-destructive-text"
        >
          <ul className="flex flex-col gap-1">
            {rejected.map((rejection, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the list is replaced as a whole on every attempt, and two refused files can share a name.
              <li key={index}>{rejectionMessage(rejection)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {/* Only the dropzone is operated: the native input is a hidden helper
          that opens the picker, so it is out of the tab order and of the
          accessibility tree. */}
      <input
        ref={inputRef}
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        accept={normalizeAccept(accept)}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          ingest(e.target.files)
          e.target.value = ""
        }}
      />
      {preview === "thumbnail" && items.length + files.length > 0 ? (
        <ul className="space-y-2" aria-label={mergedLabels.fileListAriaLabel}>
          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              disabled={disabled}
              onRemove={removable && onRemoveItem ? () => onRemoveItem(item.id) : undefined}
              onOpenImage={(url) => setLightbox({ name: item.name, url })}
              labels={mergedLabels}
            />
          ))}
          {files.map((file, index) => (
            <FileRow
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              disabled={disabled}
              removable={removable}
              onRemove={() => removeAt(index)}
              onOpenImage={() => setLightbox({ name: file.name, file })}
              labels={mergedLabels}
            />
          ))}
        </ul>
      ) : null}
      {camera ? (
        <CameraDialog
          open={cameraOpen}
          onOpenChange={setCameraOpen}
          onCapture={(file) => ingest([file])}
          labels={mergedLabels}
        />
      ) : null}
      <ImageLightbox
        image={lightbox}
        onOpenChange={() => setLightbox(null)}
        downloadable={downloadable}
        labels={mergedLabels}
      />
    </div>
  )
}

function FileRow({
  file,
  disabled,
  removable,
  onRemove,
  onOpenImage,
  labels,
}: {
  file: File
  disabled: boolean
  removable: boolean
  onRemove: () => void
  onOpenImage: () => void
  labels: ResolvedFileUploadLabels
}) {
  const isImage = file.type.startsWith("image/")
  const isPdf = file.type === "application/pdf"
  const [thumb, setThumb] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isImage) return
    const url = URL.createObjectURL(file)
    setThumb(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  // Only a PDF is opened in a tab. A blob URL belongs to the page's origin:
  // an .html (or .svg, .xml…) opened this way would run its script with the
  // application's cookies and storage. A blob URL is served with the blob's
  // own type, so this tab can only ever show the PDF viewer.
  function openPdfInNewTab() {
    const url = URL.createObjectURL(file)
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_REVOKE_MS)
  }

  function download() {
    downloadWithAnchor(file, resolveDownloadName(file, labels.fileFallbackName))
  }

  const action = isImage
    ? { run: onOpenImage, label: labels.zoomImage(file.name) }
    : isPdf
      ? { run: openPdfInNewTab, label: labels.openFile(file.name) }
      : { run: download, label: labels.downloadFile(file.name) }

  return (
    <li className="flex items-center gap-3 rounded-element border bg-card px-2 py-1.5 text-sm">
      <button
        type="button"
        onClick={action.run}
        disabled={disabled}
        aria-label={action.label}
        title={action.label}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-element bg-muted text-muted-foreground cursor-pointer transition-opacity",
          "hover:opacity-80 focus-visible:focus-outline",
          disabled && "cursor-default opacity-50",
        )}
      >
        {thumb ? (
          <img src={thumb} alt={file.name} className="size-full object-cover" />
        ) : isImage ? (
          <ImageIcon className="size-4" />
        ) : isPdf ? (
          <FileIcon className="size-4" />
        ) : (
          <Download className="size-4" />
        )}
      </button>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatBytes(file.size, labels.sizeUnits)}
        </span>
      </span>
      {removable ? (
        <Button
          type="button"
          variant="ghost"
          className="size-9 p-0"
          disabled={disabled}
          onClick={onRemove}
          aria-label={labels.removeFile(file.name)}
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </li>
  )
}

const IMAGE_EXTENSION = /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i

/** A file the component did not pick: a saved attachment or an upload in progress. */
function ItemRow({
  item,
  disabled,
  onRemove,
  onOpenImage,
  labels,
}: {
  item: FileUploadItem
  disabled: boolean
  onRemove?: () => void
  onOpenImage: (url: string) => void
  labels: ResolvedFileUploadLabels
}) {
  const status = item.status ?? "done"
  // A URL that is not http(s) or relative is dropped: `javascript:` here
  // would run on a click.
  const url =
    item.url != null && isAllowedUrl(item.url, DEFAULT_ALLOWED_RESOURCE_PROTOCOLS)
      ? item.url
      : undefined
  const isImage = url != null && IMAGE_EXTENSION.test(item.name)
  const isPdf = /\.pdf$/i.test(item.name)
  const tileClass =
    "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-element bg-muted text-muted-foreground"

  let tile: React.ReactNode
  if (isImage && url != null) {
    tile = (
      <button
        type="button"
        onClick={() => onOpenImage(url)}
        disabled={disabled}
        aria-label={labels.zoomImage(item.name)}
        title={labels.zoomImage(item.name)}
        className={cn(
          tileClass,
          "cursor-pointer transition-opacity hover:opacity-80 focus-visible:focus-outline",
          disabled && "cursor-default opacity-50",
        )}
      >
        <img src={url} alt={item.name} loading="lazy" className="size-full object-cover" />
      </button>
    )
  } else if (url != null && !disabled) {
    // Like a chosen file: a PDF opens in a new tab and anything else is
    // downloaded. A server on another origin may still decide to show it,
    // but never inside the application's origin.
    const linkLabel = isPdf ? labels.openFile(item.name) : labels.downloadFile(item.name)
    tile = (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        download={isPdf ? undefined : item.name}
        aria-label={linkLabel}
        title={linkLabel}
        className={cn(
          tileClass,
          "cursor-pointer transition-opacity hover:opacity-80 focus-visible:focus-outline",
        )}
      >
        {isPdf ? (
          <FileIcon className="size-4" aria-hidden />
        ) : (
          <Download className="size-4" aria-hidden />
        )}
      </a>
    )
  } else {
    tile = (
      <span className={cn(tileClass, disabled && "opacity-50")}>
        {status === "uploading" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <FileIcon className="size-4" aria-hidden />
        )}
      </span>
    )
  }

  return (
    <li
      data-slot="file-upload-item"
      data-status={status}
      className="flex items-center gap-3 rounded-element border bg-card px-2 py-1.5 text-sm"
    >
      {tile}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium">{item.name}</span>
        {status === "uploading" ? (
          <>
            <span className="text-xs text-muted-foreground">{labels.uploading(item.progress)}</span>
            {item.progress != null ? (
              <Progress
                value={item.progress}
                aria-label={labels.uploadProgress(item.name)}
                className="h-1"
              />
            ) : (
              // Progress unknown: a bar without a value, so a screen reader
              // does not announce 0%.
              <ProgressPrimitive.Root
                value={null}
                aria-label={labels.uploadProgress(item.name)}
                data-slot="progress"
                className="relative h-1 w-full overflow-hidden rounded-inner bg-primary/20"
              >
                <ProgressPrimitive.Indicator className="h-full w-full bg-primary/60 motion-safe:animate-pulse" />
              </ProgressPrimitive.Root>
            )}
          </>
        ) : status === "error" ? (
          <span role="alert" className="text-xs text-destructive-text">
            {item.error || labels.uploadFailed}
          </span>
        ) : item.size != null ? (
          <span className="text-xs text-muted-foreground">
            {formatBytes(item.size, labels.sizeUnits)}
          </span>
        ) : null}
      </span>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          className="size-9 p-0"
          disabled={disabled}
          onClick={onRemove}
          aria-label={labels.removeFile(item.name)}
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </li>
  )
}

/** What the lightbox shows: a chosen file, or the URL of a saved image. */
interface LightboxImage {
  name: string
  file?: File
  url?: string
}

/** One array for "no items", so the list of dependencies of `ingest` is stable. */
const NO_ITEMS: FileUploadItem[] = []

type SaveFilePicker = (options: { suggestedName?: string }) => Promise<{
  createWritable: () => Promise<{
    write: (data: Blob) => Promise<void>
    close: () => Promise<void>
    abort: () => Promise<void>
  }>
}>

const OBJECT_URL_REVOKE_MS = 60_000

function downloadWithAnchor(file: File, name: string) {
  const objectUrl = URL.createObjectURL(file)
  const a = document.createElement("a")
  a.href = objectUrl
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(objectUrl), OBJECT_URL_REVOKE_MS)
}

function downloadUrlWithAnchor(url: string, name: string) {
  const a = document.createElement("a")
  a.href = url
  a.download = name
  a.rel = "noopener noreferrer"
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** Download name for nameless files: falls back to `<fallback>.<ext from MIME>` so the OS keeps an extension. */
function resolveDownloadName(file: File, fallback: string) {
  if (file.name) return file.name
  const ext = file.type.split("/")[1]?.split("+")[0]
  return ext ? `${fallback}.${ext}` : fallback
}

async function writeWithPicker(picker: SaveFilePicker, file: File, name: string) {
  const handle = await picker({ suggestedName: name })
  const writable = await handle.createWritable()
  try {
    await writable.write(file)
    await writable.close()
  } catch (err) {
    await writable.abort()
    throw err
  }
}

function ImageLightbox({
  image,
  onOpenChange,
  downloadable,
  labels,
}: {
  image: LightboxImage | null
  onOpenChange: (open: boolean) => void
  downloadable: boolean
  labels: ResolvedFileUploadLabels
}) {
  const file = image?.file ?? null
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (!file) {
      setObjectUrl(null)
      return
    }
    const u = URL.createObjectURL(file)
    setObjectUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  // A chosen file is shown through its object URL; a saved image, by its own.
  const url = file ? objectUrl : (image?.url ?? null)

  async function handleDownload() {
    if (!image || saving) return
    if (!file) {
      // A saved image: the browser fetches it from where it lives.
      if (image.url) downloadUrlWithAnchor(image.url, image.name || labels.imageFallbackName)
      return
    }
    setSaving(true)
    const name = resolveDownloadName(file, labels.imageFallbackName)
    const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker }).showSaveFilePicker
    try {
      if (!picker) {
        downloadWithAnchor(file, name)
        return
      }
      await writeWithPicker(picker, file, name)
      toast.success(labels.imageDownloadSuccess)
    } catch (err) {
      const errorName = (err as Error | undefined)?.name
      if (errorName === "AbortError") return
      // Picker bloqueado por contexto (iframe sem permissão) ou política:
      // o download simples via anchor ainda funciona.
      if (errorName === "SecurityError" || errorName === "NotAllowedError") {
        downloadWithAnchor(file, name)
        return
      }
      toast.error(labels.imageDownloadError)
    } finally {
      setSaving(false)
    }
  }

  const closeButtonRef = React.useRef<HTMLButtonElement>(null)

  return (
    <Dialog
      open={image != null}
      onOpenChange={onOpenChange}
      title={<span className="sr-only">{image?.name || labels.imageFallbackName}</span>}
      size="xl"
      className="border-0 bg-transparent p-0"
      hideCloseButton
      // Enter/Espaço imediato não deve disparar o download: o foco inicial vai para Fechar.
      onOpenAutoFocus={(e) => {
        e.preventDefault()
        closeButtonRef.current?.focus()
      }}
    >
      <div className="flex items-center justify-end gap-2 pb-2">
        {downloadable ? (
          <Button type="button" variant="secondary" onClick={handleDownload} disabled={saving}>
            <Download className="size-4" />
            {labels.imageDownload}
          </Button>
        ) : null}
        <Button
          ref={closeButtonRef}
          type="button"
          variant="secondary"
          onClick={() => onOpenChange(false)}
        >
          {labels.imageClose}
        </Button>
      </div>
      {url ? (
        <img
          src={url}
          alt={image?.name ?? ""}
          className="h-auto max-h-[85vh] w-full rounded-container object-contain"
        />
      ) : null}
    </Dialog>
  )
}

function CameraDialog({
  open,
  onOpenChange,
  onCapture,
  labels,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
  labels: ResolvedFileUploadLabels
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [isReady, setReady] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setReady(false)
      return
    }
    let cancelled = false
    setErrorMsg(null)
    setReady(false)

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg(labels.cameraUnavailable)
      return
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop()
          return
        }
        streamRef.current = stream
        const v = videoRef.current
        if (v) {
          v.srcObject = stream
          const markReady = () => {
            if (!cancelled) setReady(true)
          }
          if (v.readyState >= 2) markReady()
          else v.addEventListener("loadeddata", markReady, { once: true })
        }
      })
      .catch(() => {
        setErrorMsg(labels.cameraAccessFailed)
      })

    return () => {
      cancelled = true
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop()
        streamRef.current = null
      }
    }
  }, [open, labels.cameraUnavailable, labels.cameraAccessFailed])

  function takePhoto() {
    const v = videoRef.current
    if (!v || !v.videoWidth) return
    const canvas = document.createElement("canvas")
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(v, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: "image/jpeg",
        })
        onCapture(file)
        onOpenChange(false)
      },
      "image/jpeg",
      0.92,
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={labels.cameraDialogTitle}
      description={labels.cameraDialogDescription}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {labels.cameraCancel}
          </Button>
          <Button type="button" onClick={takePhoto} disabled={errorMsg != null || !isReady}>
            {labels.cameraTakePhoto}
          </Button>
        </>
      }
    >
      {errorMsg ? (
        <p className="rounded-container border border-destructive-text px-3 py-2 text-sm text-destructive-text">
          {errorMsg}
        </p>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-container bg-muted">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-200",
              isReady ? "opacity-100" : "opacity-0",
            )}
          >
            <track kind="captions" />
          </video>
          {!isReady ? (
            // biome-ignore lint/a11y/useSemanticElements: <output> targets form calculation results; this is a generic camera-loading announcement, role="status" is the right ARIA role.
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-6 animate-spin" aria-hidden />
              <span>{labels.cameraStarting}</span>
            </div>
          ) : null}
        </div>
      )}
    </Dialog>
  )
}

FileUpload.displayName = "FileUpload"

export { FileUpload }
