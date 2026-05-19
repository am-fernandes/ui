"use client"

import { Camera, File as FileIcon, ImageIcon, Loader2, UploadCloud, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { Dialog } from "../overlays/dialog"
import { Button } from "../primitives/button"

export type FileUploadRejectionReason = "type" | "size" | "max-files"

export interface FileUploadRejection {
  file: File
  reason: FileUploadRejectionReason
}

export interface FileUploadProps {
  /** MIME pattern(s) accepted by the picker. Examples: `"image/*"`, `["image/png", "application/pdf"]`. Same syntax as native `<input accept>`. */
  accept?: string | string[]
  /** Allow selecting more than one file. Default `false`. */
  multiple?: boolean
  /** Maximum bytes per file. Files larger than this are rejected. Compose with the `kb()` / `mb()` / `gb()` helpers from `@am-fernandes/ui`. */
  maxSize?: number
  /** Maximum number of files when `multiple`. Extra files are rejected. */
  maxFiles?: number
  /** How to display selected files. `"thumbnail"` (default) shows an image preview tile (clickable: image opens fullscreen, document opens in a new tab). `"none"` hides previews. */
  preview?: "thumbnail" | "none"
  /** Show an extra "Capturar foto" button that opens the device camera and snapshots a photo as `image/jpeg`. Requires HTTPS or localhost (`getUserMedia`). */
  camera?: boolean
  /** Controlled list of files. Pair with `onValueChange`. If omitted, the component manages its own state. */
  value?: File[]
  /** Called whenever the accepted file list changes. */
  onValueChange?: (files: File[]) => void
  /** Called when one or more files were dropped/selected but did not pass `accept`, `maxSize`, or `maxFiles`. */
  onReject?: (rejections: FileUploadRejection[]) => void
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function defaultDescription(accept?: string | string[], maxSize?: number) {
  const parts: string[] = []
  if (accept != null) {
    const patterns = Array.isArray(accept) ? accept : accept.split(",").map((s) => s.trim())
    parts.push(patterns.join(", "))
  }
  if (maxSize != null) parts.push(`até ${formatBytes(maxSize)}`)
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
  onReject,
  disabled = false,
  error,
  label = multiple
    ? "Arraste arquivos ou clique para selecionar"
    : "Arraste um arquivo ou clique para selecionar",
  description,
  className,
  dropzoneClassName,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [internal, setInternal] = React.useState<File[]>([])
  const [isDragging, setDragging] = React.useState(false)
  const [cameraOpen, setCameraOpen] = React.useState(false)
  const [lightboxFile, setLightboxFile] = React.useState<File | null>(null)

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
        next = [...files, ...accepted]
        if (maxFiles != null && next.length > maxFiles) {
          const overflow = next.slice(maxFiles)
          for (const file of overflow) rejections.push({ file, reason: "max-files" })
          next = next.slice(0, maxFiles)
        }
      } else {
        next = accepted.length > 0 ? [accepted[0] as File] : files
        if (accepted.length > 1) {
          for (const file of accepted.slice(1)) rejections.push({ file, reason: "max-files" })
        }
      }

      if (rejections.length > 0) onReject?.(rejections)
      if (next !== files) setFiles(next)
    },
    [accept, files, maxFiles, maxSize, multiple, onReject, setFiles],
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
    description !== undefined ? description : defaultDescription(accept, maxSize)

  const hasError = error != null && error !== ""

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
          aria-label={typeof label === "string" ? label : "Selecionar arquivos"}
          className={cn(
            "flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-transparent px-4 py-6 text-sm transition-colors cursor-pointer",
            "hover:bg-accent/40",
            "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring",
            isDragging && "border-primary bg-accent/60",
            hasError && "border-destructive",
            disabled && "cursor-not-allowed opacity-50",
            dropzoneClassName,
          )}
        >
          <UploadCloud className="size-6 text-muted-foreground" aria-hidden />
          <span className="font-medium">{label}</span>
          {renderedDescription ? (
            <span className="text-xs text-muted-foreground">{renderedDescription}</span>
          ) : null}
        </button>
        {camera ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => setCameraOpen(true)}
            className="sm:h-auto sm:min-h-[6.5rem] sm:flex-col sm:gap-2 sm:px-6"
          >
            <Camera className="size-5" aria-hidden />
            <span>Capturar foto</span>
          </Button>
        ) : null}
      </div>
      {hasError ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={normalizeAccept(accept)}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          ingest(e.target.files)
          e.target.value = ""
        }}
      />
      {preview === "thumbnail" && files.length > 0 ? (
        <ul className="space-y-2" aria-label="Arquivos selecionados">
          {files.map((file, index) => (
            <FileRow
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              disabled={disabled}
              onRemove={() => removeAt(index)}
              onOpenImage={() => setLightboxFile(file)}
            />
          ))}
        </ul>
      ) : null}
      {camera ? (
        <CameraDialog
          open={cameraOpen}
          onOpenChange={setCameraOpen}
          onCapture={(file) => ingest([file])}
        />
      ) : null}
      <ImageLightbox file={lightboxFile} onOpenChange={() => setLightboxFile(null)} />
    </div>
  )
}

function FileRow({
  file,
  disabled,
  onRemove,
  onOpenImage,
}: {
  file: File
  disabled: boolean
  onRemove: () => void
  onOpenImage: () => void
}) {
  const isImage = file.type.startsWith("image/")
  const [thumb, setThumb] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isImage) return
    const url = URL.createObjectURL(file)
    setThumb(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  function openInNewTab() {
    const url = URL.createObjectURL(file)
    window.open(url, "_blank", "noopener,noreferrer")
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  return (
    <li className="flex items-center gap-3 rounded-md border bg-background px-2 py-1.5 text-sm">
      <button
        type="button"
        onClick={isImage ? onOpenImage : openInNewTab}
        disabled={disabled}
        aria-label={isImage ? `Ampliar ${file.name}` : `Abrir ${file.name} em nova aba`}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground cursor-pointer transition-opacity",
          "hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {thumb ? (
          <img src={thumb} alt={file.name} className="size-full object-cover" />
        ) : isImage ? (
          <ImageIcon className="size-4" />
        ) : (
          <FileIcon className="size-4" />
        )}
      </button>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{file.name}</span>
        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Remover ${file.name}`}
      >
        <X className="size-4" />
      </Button>
    </li>
  )
}

function ImageLightbox({
  file,
  onOpenChange,
}: {
  file: File | null
  onOpenChange: (open: boolean) => void
}) {
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!file) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(file)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [file])

  return (
    <Dialog
      open={file != null}
      onOpenChange={onOpenChange}
      title={<span className="sr-only">{file?.name ?? "Imagem"}</span>}
      size="xl"
      className="border-0 bg-transparent p-0"
      hideCloseButton
    >
      {url ? (
        <img
          src={url}
          alt={file?.name ?? ""}
          className="h-auto max-h-[85vh] w-full rounded-md object-contain"
        />
      ) : null}
    </Dialog>
  )
}

function CameraDialog({
  open,
  onOpenChange,
  onCapture,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCapture: (file: File) => void
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
      setErrorMsg("Câmera não disponível neste navegador.")
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
        setErrorMsg("Não foi possível acessar a câmera. Verifique as permissões do navegador.")
      })

    return () => {
      cancelled = true
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop()
        streamRef.current = null
      }
    }
  }, [open])

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
      title="Capturar foto"
      description="Posicione o documento ou objeto na câmera e toque em &quot;Tirar foto&quot;."
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={takePhoto} disabled={errorMsg != null || !isReady}>
            Tirar foto
          </Button>
        </>
      }
    >
      {errorMsg ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </p>
      ) : (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
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
            <div
              role="status"
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <Loader2 className="size-6 animate-spin" aria-hidden />
              <span>Iniciando câmera…</span>
            </div>
          ) : null}
        </div>
      )}
    </Dialog>
  )
}

export { FileUpload }
