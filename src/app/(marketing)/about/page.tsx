import { supabase } from "@/lib/supabase";

export const revalidate = 60;

export default async function AboutPage() {
  const { data: sections } = await supabase
    .from("about_page_sections")
    .select("id, section_key, title, content_html, image_url, display_order")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  const visibleSections = (sections || []).filter((section) => section.content_html || section.image_url);

  return (
    <main>
      <section className="bg-[#0A0A0A] text-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-serif text-4xl md:text-5xl">About Eryx Hardware</h1>
          <p className="mt-4 max-w-2xl text-[#D4D4D4]">
            Precision hardware for modern Indian homes, shaped by practical engineering and thoughtful design.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {visibleSections.length === 0 ? (
          <div className="text-center py-20 text-[#555555] dark:text-[#9A9A9A]">
            Our story is coming soon.
          </div>
        ) : (
          visibleSections.map((section, index) => (
            <section
              key={section.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}
            >
              <div>
                <h2 className="font-serif text-3xl text-[#0A0A0A] dark:text-[#F5F5F5] mb-4">{section.title}</h2>
                {section.content_html && (
                  <div
                    className="prose prose-neutral dark:prose-invert max-w-none text-[#555555] dark:text-[#D4D4D4]"
                    dangerouslySetInnerHTML={{ __html: section.content_html }}
                  />
                )}
              </div>
              {section.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={section.image_url} alt="" className="w-full rounded-sm object-cover max-h-[420px]" />
              )}
            </section>
          ))
        )}
      </div>
    </main>
  );
}
