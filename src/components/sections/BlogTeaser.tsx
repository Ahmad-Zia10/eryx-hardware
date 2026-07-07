import Link from 'next/link';
import type { BlogPostSummary } from '@/lib/db/blog';

export default function BlogTeaser({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-2xl text-[#0A0A0A] dark:text-[#F5F5F5]">
          From Our Blog
        </h2>
        <Link
          href="/blog"
          className="text-sm text-[#D4A017] hover:text-[#E8B820] transition duration-200 ease-in-out"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm overflow-hidden hover:border-[#D4A017] transition duration-200 ease-in-out"
          >
            {post.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.cover_image_url}
                alt=""
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-5">
              <p className="text-xs text-[#9A9A9A] mb-2">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''}
              </p>
              <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] group-hover:text-[#D4A017] transition duration-200 mb-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-[#555555] dark:text-[#9A9A9A] line-clamp-2">
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
