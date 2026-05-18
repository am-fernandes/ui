"use client"

import { File as FileIcon, ImageIcon, UploadCloud, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
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
  /** Maximum bytes per file. Files larger than this are rejected. */
  maxSize?: number
  /** Maximum number of files when `multiple`. Extra files are rejected. */
  maxFiles?: number
  /** How to display selected files. `"thumbnail"` renders image previews; `"list"` shows a textual list; `"none"` hides previews. Default `"thumbnail"`. */
  preview?: "thumbnail" | "list" | "none"
  /** Controlled list of files. Pair with `onValueChange`. If omitted, the component manages its own state. */
  value?: File[]
  /** Called whenever the accepted file list changes. */
  onValueChange?: (files: File[]) => void
  /** Called when one or more files were dropped/selected but did not pass `accept`, `maxSize`, or `maxFiles`. */
  onReject?: (rejections: FileUploadRejection[]) => void
  /** Disable user interaction. */
  disabled?: boolean
  /** Show error styling on the dropzone border. */
  error?: boolean
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
      return file.name.toLowerCase().endsWith(pattern.toLowerCase())
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
  value,
  onValueChange,
  onReject,
  disabled = false,
  error = false,
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

  return (
    <div className={cn("space-y-3", className)} data-slot="file-upload">
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
          "flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input bg-transparent px-4 py-6 text-sm transition-colors cursor-pointer",
          "hover:bg-accent/40",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring",
          isDragging && "border-primary bg-accent/60",
          error && "border-destructive",
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
      {preview !== "none" && files.length > 0 ? (
        <ul className="space-y-2" aria-label="Arquivos selecionados">
          {files.map((file, index) => (
            <FileRow
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              preview={preview}
              disabled={disabled}
              onRemove={() => removeAt(index)}
            />
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function FileRow({
  file,
  preview,
  disabled,
  onRemove,
}: {
  file: File
  preview: "thumbnail" | "list"
  disabled: boolean
  onRemove: () => void
}) {
  const isImage = file.type.startsWith("image/")
  const [thumb, setThumb] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (preview !== "thumbnail" || !isImage) return
    const url = URL.createObjectURL(file)
    setThumb(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage, preview])

  return (
    <li className="flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm">
      <span
        className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground"
        aria-hidden
      >
        {thumb ? (
          // biome-ignore lint/a11y/useAltText: decorative thumbnail; filename is rendered next to it.
          <img src={thumb} alt="" className="size-full object-cover" />
        ) : isImage ? (
          <ImageIcon className="size-4" />
        ) : (
          <FileIcon className="size-4" />
        )}
      </span>
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

export { FileUpload }
