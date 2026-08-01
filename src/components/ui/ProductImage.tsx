"use client";

import { useState } from "react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  // "contain" shows the full product (mixed-crop source shots render
  // uniformly); default "cover" fills the frame.
  fit?: "cover" | "contain";
  // Modernist imagery policy: EDITORIAL/brand imagery renders grayscale,
  // but any place a specific SKU is shown stays in COLOR (the default)
  // so mobile — where there's no hover — shows the true finish. Pure CSS
  // filter, so lazy-loading/optimization are unaffected.
  grayscale?: boolean;
}

export default function ProductImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  fit = "cover",
  grayscale = false,
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
      style={grayscale ? { filter: "grayscale(1) contrast(1.06)" } : undefined}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}
