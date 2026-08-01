"use client"

import { useRef } from "react"
import { Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { compressImage } from "@/lib/utils/compress-image"

type ProductImageInputProps = {
  value: string
  onChange: (value: string) => void
  onError?: (message: string) => void
}

export function ProductImageInput({ value, onChange, onError }: ProductImageInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File | null) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      onError?.("Please upload an image file (JPG, PNG, WebP)")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      onError?.("Image must be under 8MB")
      return
    }

    try {
      const compressed = await compressImage(file)
      onChange(compressed)
      onError?.("")
    } catch {
      onError?.("Failed to process image")
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <Input
          value={value.startsWith("data:image/") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image link (Instagram, CDN, etc.)"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            void handleUpload(e.target.files?.[0] ?? null)
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
          Upload from device
        </Button>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP · max 8MB</p>
      </div>

      {value && (
        <div className="flex items-start gap-3">
          <img
            src={value}
            alt="Product preview"
            className="w-32 h-32 object-contain bg-white border border-border rounded-lg"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onChange("")}
          >
            <X className="w-4 h-4 mr-1" />
            Remove image
          </Button>
        </div>
      )}
    </div>
  )
}
