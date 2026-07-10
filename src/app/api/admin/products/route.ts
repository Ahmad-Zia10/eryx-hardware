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

async function cleanup(
  variantId: string | null,
  parentId: string | null,
  uploadedPaths: string[]
) {
  if (uploadedPaths.length > 0) {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove(uploadedPaths);
    if (error) {
      console.error('Failed to clean up uploaded product images:', error);
    }
  }

  // Delete variant first (FK child), then parent
  if (variantId) {
    await supabaseAdmin.from('product_variants').delete().eq('id', variantId);
  }
  if (parentId) {
    await supabaseAdmin.from('products').delete().eq('id', parentId);
  }
}

async function cleanupMany(
  variantIds: string[],
  parentId: string | null,
  uploadedPaths: string[]
) {
  if (uploadedPaths.length > 0) {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove(uploadedPaths);
    if (error) {
      console.error('Failed to clean up uploaded product images:', error);
    }
  }

  if (variantIds.length > 0) {
    await supabaseAdmin.from('product_variants').delete().in('id', variantIds);
  }
  if (parentId) {
    await supabaseAdmin.from('products').delete().eq('id', parentId);
  }
}

function parseVariantRows(formData: FormData) {
  const raw = readString(formData, 'variants');
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new RequestError('Variants payload must be an array');
    }
    return parsed.map((variant, index) => ({
      index,
      item_code: String(variant.item_code || '').trim(),
      name: String(variant.name || '').trim(),
      finish: String(variant.finish || '').trim(),
      material: String(variant.material || '').trim(),
      dimension_notes: String(variant.dimension_notes || '').trim(),
      mrp: variant.mrp === '' || variant.mrp == null ? null : Number(variant.mrp),
      external_price_url: String(variant.external_price_url || '').trim(),
      is_default: Boolean(variant.is_default),
    }));
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError('Invalid variants payload');
  }
}

export async function POST(req: Request) {
  let parentId: string | null = null;
  let variantId: string | null = null;
  let createdVariantIds: string[] = [];
  const uploadedPaths: string[] = [];

  try {
    await requireAdmin();

    const formData = await req.formData();
    const hasVariants = readBoolean(formData, 'has_variants');
    const itemCode = readString(formData, 'item_code');
    const name = readString(formData, 'name');
    const category = readString(formData, 'category');
    const productLine = readString(formData, 'product_line');
    const imageEntries = formData.getAll('images');
    const images = imageEntries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const primaryImageIndex = Number(readString(formData, 'primary_image_index') || '0');

    if (!name || !category || !productLine) {
      throw new RequestError('Product name, category, and product line are required');
    }

    if (!PRODUCT_LINES.has(productLine)) {
      throw new RequestError('Invalid product line');
    }

    if (hasVariants) {
      const variants = parseVariantRows(formData);
      if (variants.length === 0) {
        throw new RequestError('At least one variant is required');
      }

      const codes = variants.map((variant) => variant.item_code);
      if (codes.some((code) => !code)) {
        throw new RequestError('Every variant needs an item code');
      }

      const uniqueCodes = new Set(codes.map((code) => code.toLowerCase()));
      if (uniqueCodes.size !== codes.length) {
        throw new RequestError('Variant item codes must be unique');
      }

      if (!variants.some((variant) => variant.is_default)) {
        variants[0].is_default = true;
      }

      for (const variant of variants) {
        if (variant.mrp !== null && (!Number.isFinite(variant.mrp) || variant.mrp < 0)) {
          throw new RequestError(`MRP must be a non-negative number for ${variant.item_code}`);
        }
      }

      const { count: existingCount } = await supabaseAdmin
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .in('item_code', codes);

      if ((existingCount || 0) > 0) {
        throw new RequestError('One or more variant item codes already exist', 409);
      }

      const { data: parent, error: parentError } = await supabaseAdmin
        .from('products')
        .insert({
          name,
          category,
          product_line: productLine,
          description: readString(formData, 'description') || null,
          is_active: readBoolean(formData, 'is_active'),
          is_featured: readBoolean(formData, 'is_featured'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (parentError || !parent) {
        throw new Error(parentError?.message || 'Failed to create parent product');
      }
      parentId = parent.id;

      for (const variant of variants) {
        const { data: created, error: variantError } = await supabaseAdmin
          .from('product_variants')
          .insert({
            product_id: parentId,
            item_code: variant.item_code,
            name: variant.name || name,
            category,
            product_line: productLine,
            finish: variant.finish || null,
            material: variant.material || null,
            dimension_notes: variant.dimension_notes || null,
            mrp: variant.mrp,
            description: readString(formData, 'description') || null,
            image_url: null,
            external_price_url: variant.external_price_url || null,
            is_active: readBoolean(formData, 'is_active'),
            is_featured: readBoolean(formData, 'is_featured'),
            is_on_sale: false,
            discount_price: null,
            is_default: variant.is_default,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (variantError || !created) {
          throw new Error(variantError?.message || `Failed to create variant ${variant.item_code}`);
        }

        createdVariantIds.push(created.id);

        const variantImageEntries = formData.getAll(`variant_${variant.index}_images`);
        const variantImages = variantImageEntries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
        const variantPrimaryIndex = Number(readString(formData, `variant_${variant.index}_primary_image_index`) || '0');

        if (variantImages.length > MAX_IMAGES) {
          throw new RequestError(`Maximum 5 images for ${variant.item_code}`);
        }
        if (variantImages.length > 0 && (!Number.isInteger(variantPrimaryIndex) || variantPrimaryIndex < 0 || variantPrimaryIndex >= variantImages.length)) {
          throw new RequestError(`Invalid primary image for ${variant.item_code}`);
        }
        variantImages.forEach(validateImage);

        const uploadedImages = [];
        for (const [imageIndex, file] of variantImages.entries()) {
          const path = `${created.id}/${Date.now()}-${imageIndex}-${sanitizeFilename(file.name)}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(path, file, { contentType: file.type, upsert: false });

          if (uploadError) throw new Error(uploadError.message);
          uploadedPaths.push(path);

          const { data: publicUrlData } = supabaseAdmin.storage
            .from(BUCKET)
            .getPublicUrl(path);

          uploadedImages.push({
            product_id: created.id,
            image_url: publicUrlData.publicUrl,
            display_order: imageIndex,
            is_primary: imageIndex === variantPrimaryIndex,
          });
        }

        if (uploadedImages.length > 0) {
          const { error: imageInsertError } = await supabaseAdmin
            .from('product_images')
            .insert(uploadedImages);

          if (imageInsertError) throw new Error(imageInsertError.message);

          const primaryImageUrl =
            uploadedImages[variantPrimaryIndex]?.image_url || uploadedImages[0].image_url;

          await supabaseAdmin
            .from('product_variants')
            .update({ image_url: primaryImageUrl, updated_at: new Date().toISOString() })
            .eq('id', created.id);
        }
      }

      revalidatePath('/admin/products');
      revalidatePath('/kitchen');
      return NextResponse.json({ id: createdVariantIds[0], parentId });
    }

    if (!itemCode) {
      throw new RequestError('Item code is required');
    }

    if (images.length > MAX_IMAGES) {
      throw new RequestError('Maximum 5 images per product');
    }

    if (images.length > 0 && (!Number.isInteger(primaryImageIndex) || primaryImageIndex < 0 || primaryImageIndex >= images.length)) {
      throw new RequestError('Invalid primary image selection');
    }

    images.forEach(validateImage);

    // 1. Insert parent product row
    const { data: parent, error: parentError } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        category,
        product_line: productLine,
        description: readString(formData, 'description') || null,
        is_active: readBoolean(formData, 'is_active'),
        is_featured: readBoolean(formData, 'is_featured'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (parentError || !parent) {
      throw new Error(parentError?.message || 'Failed to create parent product');
    }
    parentId = parent.id;

    // 2. Insert the variant (the purchasable SKU)
    const { data: variant, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .insert({
        product_id: parentId,
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
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (variantError || !variant) {
      if (variantError?.code === '23505') {
        throw new RequestError('Item code already exists', 409);
      }
      throw new Error(variantError?.message || 'Failed to create product variant');
    }
    variantId = variant.id;

    // 3. Upload images — path keyed by variantId
    const uploadedImages = [];
    for (const [index, file] of images.entries()) {
      const path = `${variantId}/${Date.now()}-${index}-${sanitizeFilename(file.name)}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error(uploadError.message);
      uploadedPaths.push(path);

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(path);

      uploadedImages.push({
        product_id: variantId,   // product_images.product_id → product_variants.id
        image_url: publicUrlData.publicUrl,
        display_order: index,
        is_primary: index === primaryImageIndex,
      });
    }

    if (uploadedImages.length > 0) {
      const { error: imageInsertError } = await supabaseAdmin
        .from('product_images')
        .insert(uploadedImages);

      if (imageInsertError) throw new Error(imageInsertError.message);

      const primaryImageUrl =
        uploadedImages[primaryImageIndex]?.image_url || uploadedImages[0].image_url;

      // Store fallback image_url on the variant row
      await supabaseAdmin
        .from('product_variants')
        .update({ image_url: primaryImageUrl, updated_at: new Date().toISOString() })
        .eq('id', variantId);
    }

    revalidatePath('/admin/products');
    revalidatePath('/kitchen');
    return NextResponse.json({ id: variantId, parentId });
  } catch (error: any) {
    if (createdVariantIds.length > 0) {
      await cleanupMany(createdVariantIds, parentId, uploadedPaths);
    } else if (variantId || parentId) {
      await cleanup(variantId, parentId, uploadedPaths);
    }

    if (error instanceof RequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
