"use client"

import { useState } from "react"
import Image from "next/image"

interface PokemonSpriteProps {
  src: string | null
  alt: string
  size?: number
}

export function PokemonSprite({ src, alt, size = 48 }: PokemonSpriteProps) {
  const [imageError, setImageError] = useState(false)

  if (!src || imageError) {
    return (
      <div
        className="bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs font-medium"
        style={{ width: size, height: size }}
      >
        No Image
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        className="object-contain rounded-lg"
        onError={() => setImageError(true)}
        sizes={`${size}px`}
      />
    </div>
  )
}
