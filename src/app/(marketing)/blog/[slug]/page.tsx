import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/db/blog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {post.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt=""
          className="w-full h-64 md:h-80 object-cover rounded-sm mb-8"
        />
      )}
      <header className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5] mb-3">
          {post.title}
        </h1>
        {post.published_at && (
          <time
            dateTime={post.published_at}
            className="text-sm text-[#555555] dark:text-[#9A9A9A]"
          >
            {new Date(post.published_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        )}
        {post.author && (
          <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-2">
            By {post.author}
          </p>
        )}
      </header>
      <div
        className="prose prose-neutral dark:prose-invert max-w-none text-[#0A0A0A] dark:text-[#F5F5F5] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
