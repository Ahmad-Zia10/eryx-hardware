import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export type FaqTreeCategory = {
  id: string;
  name: string;
  questions: {
    id: string;
    question: string;
    answer: string;
  }[];
};

/**
 * Fetch every visible FAQ category with its visible questions, ordered
 * by display_order at both levels. Used by /faqs and the home teaser
 * so both surfaces agree on the tree they're rendering.
 *
 * Uses supabaseAdmin so the query bypasses RLS. The result is filtered
 * on `is_visible = true` explicitly at both levels — never trust the
 * "public reads visible" policy alone from server code that could
 * theoretically be reused for admin surfaces later.
 */
export async function getVisibleFaqTree(): Promise<FaqTreeCategory[]> {
  const { data, error } = await supabaseAdmin
    .from("faq_categories")
    .select(
      `id, name, display_order, is_visible,
       faqs (id, question, answer, display_order, is_visible)`
    )
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[getVisibleFaqTree] fetch failed:", error.message);
    return [];
  }

  return (data || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    questions: (cat.faqs || [])
      .filter((q: any) => q.is_visible)
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((q: any) => ({
        id: q.id,
        question: q.question,
        answer: q.answer,
      })),
  }));
}
