import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

const BUCKET = 'product-images';
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { user };
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

function storagePathFromPublicUrl(imageUrl: string) {
  const marker = `/${BUCKET}/`;
  const [, path] = imageUrl.split(marker);
  return path ? decodeURIComponent(path) : null;
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const productId = formData.get('product_id');

    if (!(file instanceof File) || typeof productId !== 'string' || !productId) {
      return NextResponse.json({ error: 'File and product_id are required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image must be 5MB or smaller' }, { status: 400 });
    }

    const { count, error: countError } = await supabaseAdmin
      .from('product_images')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId);

    if (countError) {
      return NextResponse.json({ error: 'Failed to check image count' }, { status: 500 });
    }

    const currentCount = count ?? 0;
    if (currentCount >= MAX_IMAGES) {
      return NextResponse.json({ error: 'Maximum 5 images per product' }, { status: 400 });
    }

    const filename = `${productId}/${Date.now()}-${sanitizeFilename(file.name)}`;

    // Supabase dashboard setup required:
    // public bucket named "product-images"; anon can read; service_role can upload/delete.
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    const { data: image, error: insertError } = await supabaseAdmin
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: publicUrlData.publicUrl,
        display_order: currentCount,
        is_primary: currentCount === 0,
      })
      .select('id, image_url, display_order, is_primary')
      .single();

    if (insertError) {
      await supabaseAdmin.storage.from(BUCKET).remove([filename]);
      return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 });
    }

    revalidatePath('/admin/products');
    revalidatePath('/kitchen');
    return NextResponse.json({ image });
  } catch (error) {
    console.error('Product image upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { action, image_id, product_id } = await req.json();

    if (action !== 'set_primary' || !image_id || !product_id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.rpc('set_primary_product_image', {
      p_product_id: product_id,
      p_image_id: image_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/admin/products');
    revalidatePath('/kitchen');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set primary image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { image_url, product_image_id } = await req.json();

    if (!image_url || !product_image_id) {
      return NextResponse.json({ error: 'image_url and product_image_id are required' }, { status: 400 });
    }

    const path = storagePathFromPublicUrl(image_url);
    if (!path) {
      return NextResponse.json({ error: 'Invalid product image URL' }, { status: 400 });
    }

    const { error: deleteRecordError } = await supabaseAdmin.rpc('delete_product_image_and_reassign', {
      p_image_id: product_image_id,
    });

    if (deleteRecordError) {
      return NextResponse.json({ error: deleteRecordError.message }, { status: 500 });
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove([path]);

    if (storageError) {
      console.error('Failed to remove product image from storage:', storageError);
      return NextResponse.json({ success: true, warning: 'Image row deleted, but storage cleanup failed' });
    }

    revalidatePath('/admin/products');
    revalidatePath('/kitchen');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
