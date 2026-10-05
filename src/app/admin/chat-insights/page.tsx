import { supabaseAdmin } from "@/lib/supabase/server";
import ChatInsightsTable, { type ChatQueryRow } from "./ChatInsightsTable";

export const revalidate = 0;

// Bounded by design: one row per distinct question, pruned after 90 days
// of silence, so fetching the most-asked 500 covers everything useful.
const ROW_LIMIT = 500;

export default async function AdminChatInsightsPage() {
  const { data, error } = await supabaseAdmin
    .from("chat_queries")
    .select("id, kind, sample_query, last_page_path, hit_count, status, reviewed_at, first_seen_at, last_seen_at")
    .order("hit_count", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(ROW_LIMIT);

  if (error) {
    console.error("[admin/chat-insights] fetch failed:", error.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Chat Insights</h1>
        <p className="text-sm text-[#9A9A9A] mt-1 max-w-2xl">
          Questions Ryx couldn&apos;t answer, and product searches that found nothing — most-asked first.
          Write an FAQ for frequent questions, then mark them resolved. If a resolved question keeps
          coming back, it reappears here as new.
        </p>
      </div>
      <ChatInsightsTable rows={(data as ChatQueryRow[]) || []} loadFailed={Boolean(error)} />
    </div>
  );
}
