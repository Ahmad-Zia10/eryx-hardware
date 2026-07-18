import { supabaseAdmin } from "@/lib/supabase/server";
import AboutSectionEditor from "./AboutSectionEditor";

export const revalidate = 0;

export default async function AdminAboutPage() {
  const { data } = await supabaseAdmin
    .from("about_page_sections")
    .select("id, section_key, title, content_json, image_url, display_order, is_visible")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">About Page</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">Edit public About Us sections without a deploy.</p>
        <p className="text-xs text-[#6B6B6B] mt-2 max-w-2xl">
          Note: Stats, timeline, values, and awards on <span className="text-[#D4A017]">/about</span> are managed in code for now — ask a developer to update them.
        </p>
      </div>
      <div className="space-y-5">
        {((data as any[]) || []).map((section) => (
          <AboutSectionEditor key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
