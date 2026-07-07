import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import BlogForm from '../../BlogForm';

export const revalidate = 0;

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, excerpt, content, cover_image_url, status, published_at')
    .eq('id', id)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Edit Blog Post</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">{post.title}</p>
      </div>
      <BlogForm post={post as any} />
    </div>
  );
}
