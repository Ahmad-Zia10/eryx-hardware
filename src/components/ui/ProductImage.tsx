"use client";

import { useState } from "react";

interface ProductImageProps {
  src: string;
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

  if (errored) {
    return (
      <div
        className={`flex items-center justify-center bg-[#EBEBEB] dark:bg-[#1A1A1A] text-[#555555] dark:text-[#9A9A9A] text-sm ${className}`}
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