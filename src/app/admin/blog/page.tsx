import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/ui/StatusBadge';

export const revalidate = 0;

export default async function AdminBlogPage() {
  const { data: posts } = await supabaseAdmin
    .from('blog_posts')
    .select('id, title, slug, status, published_at, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Blog</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Create and manage blog posts.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2.5 text-sm transition duration-200 rounded-sm"
        >
          New Post
        </Link>
      </div>

      <div className="w-full border border-[#2A2A2A] rounded-sm overflow-hidden bg-[#0A0A0A]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A]">
            <thead className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
              <tr>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Title</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Status</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Published</th>
                <th className="px-6 py-3 text-left text-xs tracking-widest uppercase text-[#9A9A9A]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {posts?.map((post) => (
                <tr key={post.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#F5F5F5]">{post.title}</div>
                    <div className="text-xs text-[#9A9A9A] mt-0.5">/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-[#9A9A9A]">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-sm text-[#D4A017] hover:text-[#E8B820] transition duration-200"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {(!posts || posts.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#9A9A9A]">
                    No blog posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
