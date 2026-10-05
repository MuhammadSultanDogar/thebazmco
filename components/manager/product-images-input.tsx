"use client"

import { useRef, useState } from "react"
import { Link2, Upload, X, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { compressImage } from "@/lib/utils/compress-image"

type ProductImagesInputProps = {
  images: string[]
  onChange: (images: string[]) => void
  onError?: (message: string) => void
}

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export function ProductImagesInput({ images, onChange, onError }: ProductImagesInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [urlDraft, setUrlDraft] = useState("")

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

  const addUrl = () => {
    const trimmed = urlDraft.trim()
    if (!trimmed) return

    if (!isValidImageUrl(trimmed)) {
      onError?.("Enter a full image link starting with https://")
      return
    }

    onChange([...images, trimmed])
    setUrlDraft("")
    onError?.("")
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Product Images</label>
        <p className="text-xs text-muted-foreground mb-3">
          First image is the cover. Prefer <strong>image links</strong> (below) — they use less
          database bandwidth than uploading files here.
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

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
          <p className="text-xs font-semibold text-primary flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5" />
            Add image from link (recommended)
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Host your photo on a service that gives a <strong>direct https link</strong> (e.g.{" "}
            <a
              href="https://imgbb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              ImgBB
            </a>
            , Cloudinary, or your Vercel Blob URL), paste the link here, then click Add URL.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…/your-mascot-photo.jpg"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addUrl()
                }
              }}
            />
            <Button type="button" variant="secondary" className="shrink-0" onClick={addUrl}>
              Add URL
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-border" />
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
        Upload from device (uses more database storage)
      </Button>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP · max 8MB each · multiple allowed</p>
    </div>
  )
}
