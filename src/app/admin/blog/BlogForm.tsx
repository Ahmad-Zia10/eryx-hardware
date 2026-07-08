'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePost, savePost } from '@/app/admin/actions';
import RichTextEditor from '@/components/admin/RichTextEditor';

const EMPTY_TIPTAP_DOCUMENT = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  content_json: any | null;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  author: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toDateTimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function BlogForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    cover_image_url: post?.cover_image_url || '',
    content_json: post?.content_json || EMPTY_TIPTAP_DOCUMENT,
    status: post?.status || 'draft',
    published_at: toDateTimeLocal(post?.published_at || null),
    author: post?.author || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
  });

  const previewSlug = useMemo(
    () => formData.slug || slugify(formData.title),
    [formData.slug, formData.title]
  );

  const handleTitleChange = (title: string) => {
    setFormData((current) => ({
      ...current,
      title,
      slug: slugEdited ? current.slug : slugify(title),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await savePost(post?.id || null, {
        title: formData.title.trim(),
        slug: previewSlug,
        excerpt: formData.excerpt.trim() || null,
        cover_image_url: formData.cover_image_url.trim() || null,
        content_json: formData.content_json,
        status: formData.status as 'draft' | 'published',
        published_at: formData.published_at
          ? new Date(formData.published_at).toISOString()
          : null,
        author: formData.author.trim() || null,
        meta_title: formData.meta_title.trim() || null,
        meta_description: formData.meta_description.trim() || null,
      });
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
      setIsSubmitting(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    setError(null);
    setIsUploadingCover(true);
    try {
      const upload = new FormData();
      upload.append('file', file);
      upload.append('folder', 'blog');

      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        body: upload,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Cover upload failed');
      }

      setFormData((current) => ({ ...current, cover_image_url: data.url }));
    } catch (err: any) {
      setError(err.message || 'Cover upload failed');
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm('Delete this blog post?')) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deletePost(post.id);
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(event) => handleTitleChange(event.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
        </div>

        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">Slug *</label>
          <input
            type="text"
            required
            value={formData.slug}
            placeholder={previewSlug}
            onChange={(event) => {
              setSlugEdited(true);
              setFormData({ ...formData, slug: slugify(event.target.value) });
            }}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[#F5F5F5] mb-2">Excerpt</label>
        <textarea
          rows={3}
          value={formData.excerpt}
          onChange={(event) => setFormData({ ...formData, excerpt: event.target.value })}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
        />
      </div>

      <div>
        <label className="block text-sm text-[#F5F5F5] mb-2">Cover Image URL</label>
        <div className="flex gap-3">
          <input
            type="url"
            value={formData.cover_image_url}
            onChange={(event) => setFormData({ ...formData, cover_image_url: event.target.value })}
            className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={isUploadingCover}
            className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm transition duration-200 rounded-sm disabled:opacity-50"
          >
            {isUploadingCover ? 'Uploading...' : 'Upload'}
          </button>
        </div>
        {formData.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={formData.cover_image_url} alt="" className="mt-3 h-32 w-full object-cover rounded-sm border border-[#2A2A2A]" />
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleCoverUpload(file);
          }}
        />
      </div>

      <div>
        <label className="block text-sm text-[#F5F5F5] mb-2">Content *</label>
        <RichTextEditor
          value={formData.content_json}
          onChange={(content_json) => setFormData({ ...formData, content_json })}
          placeholder="Write the post content..."
          uploadFolder="blog"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">Author</label>
          <input
            type="text"
            value={formData.author}
            onChange={(event) => setFormData({ ...formData, author: event.target.value })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
        </div>

        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(event) => setFormData({ ...formData, status: event.target.value as 'draft' | 'published' })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">Published At</label>
          <input
            type="datetime-local"
            value={formData.published_at}
            onChange={(event) => setFormData({ ...formData, published_at: event.target.value })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
        </div>

        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">SEO Meta Title</label>
          <input
            type="text"
            value={formData.meta_title}
            onChange={(event) => setFormData({ ...formData, meta_title: event.target.value })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[#F5F5F5] mb-2">SEO Meta Description</label>
        <textarea
          rows={2}
          value={formData.meta_description}
          onChange={(event) => setFormData({ ...formData, meta_description: event.target.value })}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
        />
      </div>

      <div className="pt-4 flex gap-3 justify-between border-t border-[#2A2A2A]">
        <div>
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 text-sm transition duration-200 rounded-sm disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          disabled={isSubmitting}
          className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm transition duration-200 rounded-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm transition duration-200 rounded-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Post'}
        </button>
        </div>
      </div>
    </form>
  );
}
