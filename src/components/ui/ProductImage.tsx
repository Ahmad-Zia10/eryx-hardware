"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

export default function ProductImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-sunken text-ink-muted text-sm ${className}`}
      >
        Image unavailable
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setErrored(true)}
      className={`object-cover ${className}`}
    />
  );
}
