import { NextResponse } from "next/server";
import { getVisibleFaqTree } from "@/lib/db/faqs";

// Read-only feed for the Ryx chat assistant. Statically cached and
// regenerated at most every 5 minutes; FAQ edits in /admin/faqs also
// revalidate this path immediately (see revalidateFaqSurfaces).
export const dynamic = "force-static";
export const revalidate = 300;

export async function GET() {
  const categories = await getVisibleFaqTree();
  return NextResponse.json({ categories });
}
