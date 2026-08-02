"use client"

import { useCallback, useState } from "react"
import Image from "next/image"

type SmartProductImageProps = {
  src: string
  alt: string
  sizes?: string
  priority?: boolean
  /** Container aspect ratio (width / height). Cards use 4/3 */
  containerAspect?: number
  /** Prefer showing the full product (detail modal, etc.) */
  preferContain?: boolean
  className?: string
}

/**
 * Picks cover vs contain from image dimensions so tall/wide photos
 * are not over-cropped, while square product shots still fill the frame.
 */
function pickObjectFit(
  naturalWidth: number,
  naturalHeight: number,
  containerAspect: number,
  preferContain: boolean,
): "cover" | "contain" {
  if (preferContain || !naturalWidth || !naturalHeight) return "contain"

  const imageAspect = naturalWidth / naturalHeight
  const ratio = imageAspect / containerAspect

  if (ratio < 0.78 || ratio > 1.42) return "contain"
  return "cover"
}

export function SmartProductImage({
  src,
  alt,
  sizes = "100vw",
  priority,
  containerAspect = 4 / 3,
  preferContain = false,
  className = "",
}: SmartProductImageProps) {
  const [fit, setFit] = useState<"cover" | "contain">(
    preferContain ? "contain" : "contain",
  )

  const onLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget
      setFit(
        pickObjectFit(
          img.naturalWidth,
          img.naturalHeight,
          containerAspect,
          preferContain,
        ),
      )
    },
    [containerAspect, preferContain],
  )

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={src.startsWith("data:image/")}
      sizes={sizes}
      priority={priority}
      onLoad={onLoad}
      className={`object-center transition-[object-fit] duration-300 group-hover:scale-[1.02] ${
        fit === "cover" ? "object-cover" : "object-contain"
      } ${className}`}
    />
  )
}
