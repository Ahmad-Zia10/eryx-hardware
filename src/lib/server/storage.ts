import { supabaseAdmin } from "@/lib/supabase/server";

export const SHARED_UPLOAD_BUCKET = "product-images";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set(["application/pdf"]);

export type UploadKind = "image" | "image-or-pdf";

export class UploadError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export function storagePathFromPublicUrl(url: string, bucket = SHARED_UPLOAD_BUCKET) {
  const marker = `/${bucket}/`;
  const [, path] = url.split(marker);
  return path ? decodeURIComponent(path) : null;
}

export function validateUploadFile(
  file: File,
  options: { kind?: UploadKind; maxSizeMb?: number } = {}
) {
  const kind = options.kind || "image";
  const maxSize = (options.maxSizeMb || 5) * 1024 * 1024;
  const allowedTypes = kind === "image" ? IMAGE_TYPES : new Set([...IMAGE_TYPES, ...DOCUMENT_TYPES]);

  if (file.size <= 0) {
    throw new UploadError("File is empty");
  }

  if (file.size > maxSize) {
    throw new UploadError(`File must be ${options.maxSizeMb || 5}MB or smaller`);
  }

  if (!allowedTypes.has(file.type)) {
    throw new UploadError(kind === "image" ? "Only JPEG, PNG, and WebP images are allowed" : "Only images and PDF files are allowed");
  }
}

export async function uploadSharedFile(file: File, folder: string) {
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

  const { error } = await supabaseAdmin.storage
    .from(SHARED_UPLOAD_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new UploadError(error.message, 500);
  }

  const { data } = supabaseAdmin.storage.from(SHARED_UPLOAD_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function removeSharedFiles(paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabaseAdmin.storage.from(SHARED_UPLOAD_BUCKET).remove(paths);
  if (error) {
    console.error("Shared storage cleanup failed:", error);
  }
}
