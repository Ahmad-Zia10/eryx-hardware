import Link from 'next/link';
import { getPublishedPosts } from '@/lib/db/blog';

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam || '1') || 1, 1);
  const posts = await getPublishedPosts(PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  const visiblePosts = posts.slice(0, PAGE_SIZE);
  const hasNextPage = posts.length > PAGE_SIZE;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-extrabold tracking-[-0.02em] text-3xl text-ink">Blog</h1>
        <p className="text-sm text-ink-muted mt-2">
          Guides, inspiration, and tips for your home.
        </p>
      </div>

      {visiblePosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-muted">
            Coming soon. We&apos;re working on helpful guides and inspiration for your home.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visiblePosts.map((post) => (
            <article
              key={post.id}
              className="bg-surface-raised border border-line-strong overflow-hidden flex flex-col"
            >
              {post.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="w-full h-48 object-cover grayscale contrast-[1.06]"
                />
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-ink-faint mb-2">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </p>
                <h2 className="font-semibold text-lg text-ink mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-ink-muted mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-gold-deep hover:text-gold transition duration-200 ease-in-out"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {(page > 1 || hasNextPage) && (
        <div className="flex justify-center gap-3 mt-10">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="border border-line-strong px-4 py-2 text-sm text-ink-muted hover:border-gold hover:text-gold-deep transition duration-200"
            >
              Previous
            </Link>
          )}
          {hasNextPage && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="border border-line-strong px-4 py-2 text-sm text-ink-muted hover:border-gold hover:text-gold-deep transition duration-200"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
