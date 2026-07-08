import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

const BUCKET = 'product-images';
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PRODUCT_LINES = new Set(['kitchen', 'wardrobe', 'hardware']);

class RequestError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new RequestError('Unauthorized', 401);
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new RequestError('Forbidden', 403);
  }
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function readNullableNumber(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return null;

  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new RequestError(`${key} must be a non-negative number`);
  }

  return number;
}

function readBoolean(formData: FormData, key: string) {
  return readString(formData, key) === 'true';
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

function validateImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new RequestError('Only JPEG, PNG, and WebP images are allowed');
  }

  if (file.size <= 0) {
    throw new RequestError('Image file is empty');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new RequestError('Each image must be 5MB or smaller');
  }
}

async function cleanup(productId: string | null, uploadedPaths: string[]) {
  if (uploadedPaths.length > 0) {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove(uploadedPaths);
    if (error) {
      console.error('Failed to clean up uploaded product images:', error);
    }
  }

  if (productId) {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Failed to roll back product creation:', error);
    }
  }
}

export async function POST(req: Request) {
  let productId: string | null = null;
  const uploadedPaths: string[] = [];

  try {
    await requireAdmin();

    const formData = await req.formData();
    const itemCode = readString(formData, 'item_code');
    const name = readString(formData, 'name');
    const category = readString(formData, 'category');
    const productLine = readString(formData, 'product_line');
    const imageEntries = formData.getAll('images');
    const images = imageEntries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const primaryImageIndex = Number(readString(formData, 'primary_image_index') || '0');

    if (!itemCode || !name || !category || !productLine) {
      throw new RequestError('Item code, product name, category, and product line are required');
    }

    if (!PRODUCT_LINES.has(productLine)) {
      throw new RequestError('Invalid product line');
    }

    if (images.length > MAX_IMAGES) {
      throw new RequestError('Maximum 5 images per product');
    }

    if (images.length > 0 && (!Number.isInteger(primaryImageIndex) || primaryImageIndex < 0 || primaryImageIndex >= images.length)) {
      throw new RequestError('Invalid primary image selection');
    }

    images.forEach(validateImage);

    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        item_code: itemCode,
        name,
        category,
        product_line: productLine,
        finish: readString(formData, 'finish') || null,
        material: readString(formData, 'material') || null,
        dimension_notes: readString(formData, 'dimension_notes') || null,
        mrp: readNullableNumber(formData, 'mrp'),
        description: readString(formData, 'description') || null,
        image_url: null,
        external_price_url: readString(formData, 'external_price_url') || null,
        is_active: readBoolean(formData, 'is_active'),
        is_featured: readBoolean(formData, 'is_featured'),
        is_on_sale: false,
        discount_price: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (productError || !product) {
      if (productError?.code === '23505') {
        throw new RequestError('Item code already exists', 409);
      }
      throw new Error(productError?.message || 'Failed to create product');
    }

    productId = product.id;

    const uploadedImages = [];
    for (const [index, file] of images.entries()) {
      const path = `${productId}/${Date.now()}-${index}-${sanitizeFilename(file.name)}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploadedPaths.push(path);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(path);

      uploadedImages.push({
        product_id: productId,
        image_url: publicUrlData.publicUrl,
        display_order: index,
        is_primary: index === primaryImageIndex,
      });
    }

    if (uploadedImages.length > 0) {
      const { error: imageInsertError } = await supabaseAdmin
        .from('product_images')
        .insert(uploadedImages);

      if (imageInsertError) {
        throw new Error(imageInsertError.message);
      }

      const primaryImageUrl = uploadedImages[primaryImageIndex]?.image_url || uploadedImages[0].image_url;
      const { error: fallbackError } = await supabaseAdmin
        .from('products')
        .update({
          image_url: primaryImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
    }

    revalidatePath('/admin/products');
    revalidatePath('/kitchen');
    return NextResponse.json({ id: productId });
  } catch (error: any) {
    if (productId) {
      await cleanup(productId, uploadedPaths);
    }

    if (error instanceof RequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
