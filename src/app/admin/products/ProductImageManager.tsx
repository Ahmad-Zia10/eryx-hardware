'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

export interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

interface ProductImageManagerProps {
  productId: string;
  initialImages: ProductImage[];
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function ProductImageManager({ productId, initialImages }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState(
    [...initialImages].sort((a, b) => a.display_order - b.display_order)
  );
  const [isUploading, setIsUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be 5MB or smaller.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_id', productId);

      const response = await fetch('/api/admin/product-images', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      setImages((current) =>
        [...current, data.image].sort((a, b) => a.display_order - b.display_order)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const previousImages = images;
    setError(null);
    setUpdatingId(imageId);
    setImages((current) =>
      current.map((image) => ({
        ...image,
        is_primary: image.id === imageId,
      }))
    );

    try {
      const response = await fetch('/api/admin/product-images', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_primary',
          image_id: imageId,
          product_id: productId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set primary image');
      }
    } catch (err: any) {
      setImages(previousImages);
      setError(err.message || 'Failed to set primary image');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    if (!window.confirm('Delete this image?')) return;

    const previousImages = images;
    const deletedImage = images.find((image) => image.id === imageId);
    setError(null);
    setUpdatingId(imageId);
    setImages((current) => {
      const remaining = current.filter((image) => image.id !== imageId);
      if (deletedImage?.is_primary && remaining.length > 0) {
        return remaining.map((image, index) => ({
          ...image,
          is_primary: index === 0,
        }));
      }
      return remaining;
    });

    try {
      const response = await fetch('/api/admin/product-images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          product_image_id: imageId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete image');
      }

      if (data.warning) {
        setError(data.warning);
      }
    } catch (err: any) {
      setImages(previousImages);
      setError(err.message || 'Failed to delete image');
    } finally {
      setUpdatingId(null);
    }
  };

  const slots = Array.from({ length: MAX_IMAGES }, (_, index) => images[index] || null);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-[#F5F5F5]">Product Images</h3>
        <p className="text-xs text-[#9A9A9A] mt-1">Upload up to 5 JPEG, PNG, or WebP images.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-xs">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {slots.map((image, index) => (
          <div key={image?.id || `empty-${index}`} className="space-y-2">
            {image ? (
              <div className="relative border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#1A1A1A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.image_url}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
                {image.is_primary && (
                  <span className="absolute top-2 left-2 bg-[#D4A017] text-[#0A0A0A] text-[10px] font-semibold px-2 py-0.5 rounded-sm">
                    Primary
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(image.id, image.image_url)}
                  disabled={updatingId === image.id}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white p-1.5 rounded-sm transition duration-200 disabled:opacity-50"
                  aria-label="Delete image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isUploading || images.length >= MAX_IMAGES}
                className="w-full aspect-square border border-dashed border-[#555555] hover:border-[#D4A017] rounded-sm bg-[#1A1A1A] text-[#9A9A9A] hover:text-[#D4A017] flex flex-col items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
              >
                <ImagePlus size={22} />
                <span className="text-xs">{isUploading ? 'Uploading...' : 'Add Image'}</span>
              </button>
            )}

            {image && (
              <label className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                <input
                  type="radio"
                  checked={image.is_primary}
                  disabled={updatingId === image.id}
                  onChange={() => handleSetPrimary(image.id)}
                  className="accent-[#D4A017]"
                />
                Set as Primary
              </label>
            )}
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleUpload(file);
        }}
      />
    </div>
  );
}
