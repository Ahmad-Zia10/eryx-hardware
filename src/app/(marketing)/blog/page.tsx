import Link from 'next/link';
import { getPublishedPosts } from '@/lib/db/blog';

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-[#0A0A0A] dark:text-[#F5F5F5]">Blog</h1>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-2">
          Guides, inspiration, and tips for your home.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#555555] dark:text-[#9A9A9A]">
            Coming soon. We&apos;re working on helpful guides and inspiration for your home.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-[#141414] border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm overflow-hidden flex flex-col"
            >
              {post.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs text-[#9A9A9A] mb-2">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </p>
                <h2 className="font-semibold text-lg text-[#0A0A0A] dark:text-[#F5F5F5] mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mb-4 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm text-[#D4A017] hover:text-[#E8B820] transition duration-200 ease-in-out"
                >
                  Read More →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
