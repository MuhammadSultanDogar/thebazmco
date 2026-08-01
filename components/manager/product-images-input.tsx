"use client"

import { useRef } from "react"
import { Upload, X, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { compressImage } from "@/lib/utils/compress-image"

type ProductImagesInputProps = {
  images: string[]
  onChange: (images: string[]) => void
  onError?: (message: string) => void
}

export function ProductImagesInput({ images, onChange, onError }: ProductImagesInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return

    const next = [...images]

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        onError?.("Please upload image files only (JPG, PNG, WebP)")
        continue
      }
      if (file.size > 8 * 1024 * 1024) {
        onError?.("Each image must be under 8MB")
        continue
      }

      try {
        const compressed = await compressImage(file, 1200, 0.82)
        next.push(compressed)
        onError?.("")
      } catch {
        onError?.("Failed to process one of the images")
      }
    }

    onChange(next)
  }

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const setPrimary = (index: number) => {
    if (index === 0) return
    const next = [...images]
    const [picked] = next.splice(index, 1)
    next.unshift(picked)
    onChange(next)
  }

  const addUrl = (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    onChange([...images, trimmed])
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Product Images</label>
        <p className="text-xs text-muted-foreground mb-3">
          First image is the cover photo. Upload multiple angles or details.
        </p>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {images.map((src, index) => (
              <div key={`${src.slice(0, 32)}-${index}`} className="relative group">
                <img
                  src={src}
                  alt={`Product ${index + 1}`}
                  className="w-full aspect-square object-cover bg-white border border-border rounded-xl"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    Cover
                  </span>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setPrimary(index)}
                      className="p-1.5 bg-white/95 rounded-lg shadow border border-border"
                      title="Set as cover"
                    >
                      <Star className="w-3.5 h-3.5 text-primary" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="p-1.5 bg-white/95 rounded-lg shadow border border-border text-red-600"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Input
          placeholder="Paste image URL and press Enter"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addUrl((e.target as HTMLInputElement).value)
              ;(e.target as HTMLInputElement).value = ""
            }
          }}
        />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleUpload(e.target.files)
          e.target.value = ""
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload images from device
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 8MB each · multiple allowed</p>
    </div>
  )
}
