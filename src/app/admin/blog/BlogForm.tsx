'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePost } from '@/app/admin/actions';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(Boolean(post));
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    cover_image_url: post?.cover_image_url || '',
    content: post?.content || '',
    status: post?.status || 'draft',
    published_at: toDateTimeLocal(post?.published_at || null),
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
        content: formData.content,
        status: formData.status as 'draft' | 'published',
        published_at: formData.published_at
          ? new Date(formData.published_at).toISOString()
          : null,
      });
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
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
        <input
          type="url"
          value={formData.cover_image_url}
          onChange={(event) => setFormData({ ...formData, cover_image_url: event.target.value })}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
        />
      </div>

      <div>
        <label className="block text-sm text-[#F5F5F5] mb-2">Content HTML *</label>
        <textarea
          rows={16}
          required
          value={formData.content}
          onChange={(event) => setFormData({ ...formData, content: event.target.value })}
          className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200 font-mono"
          placeholder="<p>Write the post content as HTML.</p>"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        <div>
          <label className="block text-sm text-[#F5F5F5] mb-2">Published At</label>
          <input
            type="datetime-local"
            value={formData.published_at}
            onChange={(event) => setFormData({ ...formData, published_at: event.target.value })}
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 focus:border-[#D4A017] focus:outline-none rounded-sm transition duration-200"
          />
        </div>
      </div>

      <div className="pt-4 flex gap-3 justify-end border-t border-[#2A2A2A]">
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
    </form>
  );
}
