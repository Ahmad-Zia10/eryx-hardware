'use client';

import { useRef, useState, useEffect } from 'react';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { Toggle } from '@/components/ui/Toggle';
import { CATEGORIES } from '@/lib/catalogue-data';

interface AddProductModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

interface VariantDraft {
  item_code: string;
  name: string;
  finish: string;
  material: string;
  dimension_notes: string;
  mrp: string;
  external_price_url: string;
  images: SelectedImage[];
  primaryImageIndex: number;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function AddProductModal({ onClose, onSuccess }: AddProductModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [extraVariants, setExtraVariants] = useState<VariantDraft[]>([]);
  const [defaultVariantIndex, setDefaultVariantIndex] = useState(0);
  const selectedImagesRef = useRef<SelectedImage[]>([]);
  const extraVariantsRef = useRef<VariantDraft[]>([]);

  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    category: CATEGORIES[0],
    product_line: 'kitchen',
    finish: '',
    material: '',
    dimension_notes: '',
    mrp: '',
    description: '',
    external_price_url: '',
    is_active: true,
    is_featured: false,
  });

  // Escape key closes modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    extraVariantsRef.current = extraVariants;
  }, [extraVariants]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      extraVariantsRef.current.forEach((variant) => {
        variant.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      });
    };
  }, []);

  const handleImageSelect = (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const incoming = Array.from(files);
    if (selectedImages.length + incoming.length > MAX_IMAGES) {
      setError('You can upload up to 5 images per product.');
      return;
    }

    const validImages: SelectedImage[] = [];
    for (const file of incoming) {
      if (!ALLOWED_TYPES.has(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Each image must be 5MB or smaller.');
        return;
      }

      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setSelectedImages((current) => [...current, ...validImages]);
  };

  const makeVariantDraft = (): VariantDraft => ({
    item_code: '',
    name: '',
    finish: '',
    material: '',
    dimension_notes: '',
    mrp: '',
    external_price_url: '',
    images: [],
    primaryImageIndex: 0,
  });

  const updateExtraVariant = (index: number, patch: Partial<VariantDraft>) => {
    setExtraVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      )
    );
  };

  const handleVariantImageSelect = (variantIndex: number, files: FileList | null) => {
    if (!files) return;
    setError(null);

    const incoming = Array.from(files);
    const variant = extraVariants[variantIndex];
    if (!variant) return;

    if (variant.images.length + incoming.length > MAX_IMAGES) {
      setError('You can upload up to 5 images per variant.');
      return;
    }

    const validImages: SelectedImage[] = [];
    for (const file of incoming) {
      if (!ALLOWED_TYPES.has(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Each image must be 5MB or smaller.');
        return;
      }

      validImages.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    updateExtraVariant(variantIndex, { images: [...variant.images, ...validImages] });
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const variant = extraVariants[variantIndex];
    if (!variant) return;
    const image = variant.images[imageIndex];
    if (image) URL.revokeObjectURL(image.previewUrl);

    const nextImages = variant.images.filter((_, index) => index !== imageIndex);
    const nextPrimary =
      nextImages.length === 0
        ? 0
        : variant.primaryImageIndex === imageIndex
          ? 0
          : variant.primaryImageIndex > imageIndex
            ? variant.primaryImageIndex - 1
            : Math.min(variant.primaryImageIndex, nextImages.length - 1);

    updateExtraVariant(variantIndex, {
      images: nextImages,
      primaryImageIndex: nextPrimary,
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((current) => {
      const image = current[index];
      if (image) URL.revokeObjectURL(image.previewUrl);

      const next = current.filter((_, imageIndex) => imageIndex !== index);
      setPrimaryImageIndex((currentPrimary) => {
        if (next.length === 0) return 0;
        if (currentPrimary === index) return 0;
        if (currentPrimary > index) return currentPrimary - 1;
        return Math.min(currentPrimary, next.length - 1);
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, String(value));
      });
      payload.append('has_variants', String(hasVariants));

      if (hasVariants) {
        const variants = [
          {
            item_code: formData.item_code,
            name: formData.name,
            finish: formData.finish,
            material: formData.material,
            dimension_notes: formData.dimension_notes,
            mrp: formData.mrp,
            external_price_url: formData.external_price_url,
            is_default: defaultVariantIndex === 0,
          },
          ...extraVariants.map((variant, index) => ({
            item_code: variant.item_code,
            name: variant.name || formData.name,
            finish: variant.finish,
            material: variant.material,
            dimension_notes: variant.dimension_notes,
            mrp: variant.mrp,
            external_price_url: variant.external_price_url,
            is_default: defaultVariantIndex === index + 1,
          })),
        ];

        payload.append('variants', JSON.stringify(variants));
        payload.append('variant_0_primary_image_index', String(primaryImageIndex));
        selectedImages.forEach((image) => payload.append('variant_0_images', image.file));
        extraVariants.forEach((variant, index) => {
          payload.append(`variant_${index + 1}_primary_image_index`, String(variant.primaryImageIndex));
          variant.images.forEach((image) => payload.append(`variant_${index + 1}_images`, image.file));
        });
      } else {
        payload.append('primary_image_index', String(primaryImageIndex));
        selectedImages.forEach((image) => {
          payload.append('images', image.file);
        });
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add product');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-4xl w-full my-auto p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-xl text-[#F5F5F5]">Add New Product</h2>
          <p className="text-xs text-[#9A9A9A] mt-1">Create a new product listing in the catalogue.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Toggle
            checked={hasVariants}
            onChange={(value) => {
              setHasVariants(value);
              if (!value) setDefaultVariantIndex(0);
              if (value && extraVariants.length === 0) {
                setExtraVariants([makeVariantDraft()]);
              }
            }}
            label="This product has variants"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Item Code *</label>
              <input
                type="text"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Product Name *</label>
              <input
                type="text"
                required
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Category *</label>
              <select
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Product Line *</label>
              <select
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.product_line}
                onChange={(e) => setFormData({ ...formData, product_line: e.target.value })}
              >
                <option value="kitchen">Kitchen</option>
                <option value="wardrobe">Wardrobe</option>
                <option value="hardware">Hardware</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Finish</label>
              <input
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.finish}
                onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Material</label>
              <input
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">Dimensions (Notes)</label>
              <input
                type="text"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.dimension_notes}
                onChange={(e) => setFormData({ ...formData, dimension_notes: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">MRP (₹)</label>
              <input
                type="number"
                min="0"
                placeholder="Leave blank for 'Price on Request'"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Product Images</label>
            <p className="text-xs text-[#9A9A9A] mb-3">
              {hasVariants ? 'Images for the default variant.' : 'Add up to 5 images. Choose one image as the primary product image.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Array.from({ length: MAX_IMAGES }, (_, index) => {
                const image = selectedImages[index];

                return (
                  <div key={image?.previewUrl || `empty-${index}`} className="space-y-2">
                    {image ? (
                      <div className="relative border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#1A1A1A]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.previewUrl} alt="" className="w-full aspect-square object-cover" />
                        {primaryImageIndex === index && (
                          <span className="absolute top-2 left-2 bg-[#D4A017] text-[#0A0A0A] text-[10px] font-semibold px-2 py-0.5 rounded-sm">
                            Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white p-1.5 rounded-sm transition duration-200"
                          aria-label="Remove image"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full aspect-square border border-dashed border-[#555555] hover:border-[#D4A017] rounded-sm bg-[#1A1A1A] text-[#9A9A9A] hover:text-[#D4A017] flex flex-col items-center justify-center gap-2 transition duration-200 cursor-pointer">
                        <ImagePlus size={22} />
                        <span className="text-xs">Add Image</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={(event) => {
                            handleImageSelect(event.target.files);
                            event.currentTarget.value = '';
                          }}
                        />
                      </label>
                    )}

                    {image && (
                      <label className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                        <input
                          type="radio"
                          checked={primaryImageIndex === index}
                          onChange={() => setPrimaryImageIndex(index)}
                          className="accent-[#D4A017]"
                        />
                        Set as Primary
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {hasVariants && (
            <label className="inline-flex items-center gap-2 text-sm text-[#F5F5F5]">
              <input
                type="radio"
                name="default_variant"
                checked={defaultVariantIndex === 0}
                onChange={() => setDefaultVariantIndex(0)}
                className="accent-[#D4A017]"
              />
              Make the fields above the default variant
            </label>
          )}

          {hasVariants && (
            <div className="border border-[#2A2A2A] rounded-sm p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F5F5]">Additional Variants</h3>
                  <p className="text-xs text-[#9A9A9A] mt-1">The fields above become the default variant.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setExtraVariants((current) => [...current, makeVariantDraft()])}
                  className="text-sm text-[#D4A017] hover:text-[#E8B820]"
                >
                  + Add Variant
                </button>
              </div>

              {extraVariants.map((variant, variantIndex) => (
                <div key={variantIndex} className="border-t border-[#2A2A2A] pt-4 space-y-4">
                  <div className="flex justify-between gap-3">
                    <h4 className="text-xs tracking-widest uppercase text-[#9A9A9A]">Variant {variantIndex + 2}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        variant.images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
                        setDefaultVariantIndex((current) => {
                          const removedIndex = variantIndex + 1;
                          if (current === removedIndex) return 0;
                          return current > removedIndex ? current - 1 : current;
                        });
                        setExtraVariants((current) => current.filter((_, index) => index !== variantIndex));
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove Variant
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-[#F5F5F5]">
                      <input
                        type="radio"
                        name="default_variant"
                        checked={defaultVariantIndex === variantIndex + 1}
                        onChange={() => setDefaultVariantIndex(variantIndex + 1)}
                        className="accent-[#D4A017]"
                      />
                      Make this the default variant
                    </label>
                    <input
                      required={hasVariants}
                      placeholder="Item Code *"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
                      value={variant.item_code}
                      onChange={(e) => updateExtraVariant(variantIndex, { item_code: e.target.value })}
                    />
                    <input
                      placeholder="Variant Name (optional)"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
                      value={variant.name}
                      onChange={(e) => updateExtraVariant(variantIndex, { name: e.target.value })}
                    />
                    <input
                      placeholder="Finish"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
                      value={variant.finish}
                      onChange={(e) => updateExtraVariant(variantIndex, { finish: e.target.value })}
                    />
                    <input
                      placeholder="Dimensions"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
                      value={variant.dimension_notes}
                      onChange={(e) => updateExtraVariant(variantIndex, { dimension_notes: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="MRP"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
                      value={variant.mrp}
                      onChange={(e) => updateExtraVariant(variantIndex, { mrp: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="External price URL"
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm"
                      value={variant.external_price_url}
                      onChange={(e) => updateExtraVariant(variantIndex, { external_price_url: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Array.from({ length: MAX_IMAGES }, (_, imageIndex) => {
                      const image = variant.images[imageIndex];
                      return (
                        <div key={image?.previewUrl || `variant-${variantIndex}-empty-${imageIndex}`} className="space-y-2">
                          {image ? (
                            <div className="relative border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#1A1A1A]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={image.previewUrl} alt="" className="w-full aspect-square object-cover" />
                              <button
                                type="button"
                                onClick={() => removeVariantImage(variantIndex, imageIndex)}
                                className="absolute top-2 right-2 bg-black/70 hover:bg-red-500 text-white p-1.5 rounded-sm"
                                aria-label="Remove variant image"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full aspect-square border border-dashed border-[#555555] hover:border-[#D4A017] rounded-sm bg-[#1A1A1A] text-[#9A9A9A] hover:text-[#D4A017] flex flex-col items-center justify-center gap-2 cursor-pointer">
                              <ImagePlus size={20} />
                              <span className="text-xs">Add</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={(event) => {
                                  handleVariantImageSelect(variantIndex, event.target.files);
                                  event.currentTarget.value = '';
                                }}
                              />
                            </label>
                          )}

                          {image && (
                            <label className="flex items-center gap-2 text-xs text-[#9A9A9A]">
                              <input
                                type="radio"
                                checked={variant.primaryImageIndex === imageIndex}
                                onChange={() => updateExtraVariant(variantIndex, { primaryImageIndex: imageIndex })}
                                className="accent-[#D4A017]"
                              />
                              Primary
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
              <label className="block text-sm text-[#F5F5F5] mb-2">External Price Comparison URL</label>
              <input
                type="url"
                placeholder="https://example.com/product"
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#555555] rounded-sm transition duration-200 ease-in-out"
                value={formData.external_price_url}
                onChange={(e) => setFormData({ ...formData, external_price_url: e.target.value })}
              />
          </div>

          <div>
            <label className="block text-sm text-[#F5F5F5] mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none placeholder-[#9A9A9A] rounded-sm transition duration-200 ease-in-out"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 py-2">
            <Toggle 
              checked={formData.is_active} 
              onChange={(v) => setFormData({ ...formData, is_active: v })} 
              label="Is Active (visible on site)" 
            />
            <Toggle 
              checked={formData.is_featured} 
              onChange={(v) => setFormData({ ...formData, is_featured: v })} 
              label="Featured (Top Picks)" 
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-[#2A2A2A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm transition duration-200 ease-in-out rounded-sm disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm transition duration-200 ease-in-out rounded-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
