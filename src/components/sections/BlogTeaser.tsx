import Link from 'next/link';
import type { BlogPostSummary } from '@/lib/db/blog';

export default function BlogTeaser({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Ruled section header, Modernist. */}
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-line-strong pb-3.5 mb-7">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-[-0.02em] text-ink">
          From our blog
        </h2>
        <Link
          href="/blog"
          className="text-sm font-bold text-gold-deep hover:text-gold transition duration-200 ease-in-out"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-surface-raised border border-line overflow-hidden hover:border-gold transition duration-200 ease-in-out"
          >
            {post.cover_image_url && (
              // Blog covers are EDITORIAL imagery → grayscale (Modernist).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image_url}
                alt=""
                className="w-full h-48 object-cover grayscale contrast-[1.06]"
              />
            )}
            <div className="p-5">
              <p className="text-xs text-ink-faint mb-2">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''}
              </p>
              <h3 className="font-bold text-ink group-hover:text-gold-deep transition duration-200 mb-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-ink-muted line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
