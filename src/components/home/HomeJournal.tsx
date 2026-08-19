import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { BlogPostSummary } from "@/lib/db/blog";

// ─────────────────────────────────────────────────────────────────────
// Journal — rebuilt blog teaser (home-only, Modernist).
//
// Two published posts, ruled header, colour covers with a hover arrow.
// Hidden when there are no posts. Rebuilt for the new home page — the
// shipped BlogTeaser is only used here.
// ─────────────────────────────────────────────────────────────────────

export default function HomeJournal({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface-sunken border-t-2 border-line-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-line-strong pb-3.5 mb-8">
          <div className="flex items-baseline gap-4">
            <span className="text-sm font-extrabold text-gold">05</span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-[-0.01em] text-ink">
              From the journal
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-bold text-gold-deep hover:text-gold inline-flex items-center gap-1 transition-colors duration-200"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-surface-raised border border-line hover:border-gold transition-colors duration-200 overflow-hidden flex flex-col"
            >
              {post.cover_image_url && (
                <div className="relative overflow-hidden aspect-[16/9]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xs text-ink-faint mb-2">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
                <h3 className="text-xl font-extrabold tracking-[-0.01em] text-ink group-hover:text-gold-deep transition-colors duration-200 flex items-start justify-between gap-3">
                  <span>{post.title}</span>
                  <ArrowUpRight
                    size={20}
                    className="shrink-0 text-ink-faint group-hover:text-gold transition-colors mt-0.5"
                  />
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-ink-muted line-clamp-2 mt-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
