import { supabase } from "@/lib/supabase";

export interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  author?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  content_json?: any | null;
}

export async function getPublishedPosts(limit?: number, offset = 0): Promise<BlogPostSummary[]> {
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, published_at, author, meta_title, meta_description")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getPublishedPosts failed:", error.message);
    return [];
  }

  return data || [];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, content_json, cover_image_url, published_at, author, meta_title, meta_description")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
