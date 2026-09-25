"use client"

import { useRef, useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import heic2any from "heic2any"
import { Upload, X, FileImage, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageDropFieldProps } from "@/lib/types"

export function ImageDropField({
  name,
  required = false,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".heic", ".heif"] },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  value = [],
  onChange,
  className,
  disabled = false,
}: ImageDropFieldProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const [converting, setConverting] = useState(false)

  const isHeic = (file: File) =>
    file.type === "image/heic" || file.type === "image/heif" ||
    /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)

  const convertHeic = async (file: File): Promise<File> => {
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 }) as Blob
    const jpgName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg")
    return new File([blob], jpgName, { type: "image/jpeg" })
  }

  const onDrop = useCallback(
    async (incomingFiles: File[]) => {
      setConverting(true)
      const converted: File[] = []
      for (const file of incomingFiles) {
        if (isHeic(file)) {
          converted.push(await convertHeic(file))
        } else {
          converted.push(file)
        }
      }
      setConverting(false)

      if (hiddenInputRef.current) {
        const dataTransfer = new DataTransfer()
        converted.forEach((file) => {
          dataTransfer.items.add(file)
        })
        hiddenInputRef.current.files = dataTransfer.files
      }
      onChange?.(converted)
    },
    [onChange]
  )

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = value.filter((_, i) => i !== index)
      if (hiddenInputRef.current) {
        const dataTransfer = new DataTransfer()
        newFiles.forEach((file) => {
          dataTransfer.items.add(file)
        })
        hiddenInputRef.current.files = dataTransfer.files
      }
      onChange?.(newFiles)
    },
    [value, onChange]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
    noClick: true,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "relative flex flex-col items-center justify-center p-6 transition-all cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5 border-solid"
            : "border-dashed hover:border-primary/50 hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <input
          type="file"
          name={name}
          required={required && value.length === 0}
          className="sr-only"
          ref={hiddenInputRef}
        />
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className={cn(
            "rounded-full p-3 transition-colors",
            isDragActive ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-6 w-6 transition-colors",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">
              {converting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Converting HEIC…
                </span>
              ) : isDragActive ? "Drop files here" : "Drag & drop files"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click the button below
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={open}
            disabled={disabled}
            className="mt-2"
          >
            Browse Files
          </Button>

          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs font-normal">
              {maxFiles > 1 ? `Max ${maxFiles} files` : "1 file"}
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              Max {Math.round(maxSize / 1024 / 1024)}MB
            </Badge>
          </div>
        </div>
      </Card>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex flex-row items-center gap-3 rounded-lg border p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <FileImage className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
