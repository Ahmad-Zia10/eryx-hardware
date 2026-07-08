import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendStoreNotification } from "@/lib/server/notifications";
import { UploadError, uploadSharedFile, validateUploadFile } from "@/lib/server/storage";

const schema = z.object({
  contact_name: z.string().min(2).max(120),
  company_name: z.string().min(2).max(160),
  email: z.string().email().max(200),
  phone: z.string().regex(/^[0-9+\-\s()]{8,20}$/),
  address_line: z.string().min(5).max(240),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().regex(/^[0-9A-Za-z\-\s]{4,12}$/),
  country: z.string().min(2).max(100),
  message: z.string().max(2000).optional(),
  website: z.string().optional(),
});

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const parsed = schema.safeParse({
      contact_name: read(formData, "contact_name"),
      company_name: read(formData, "company_name"),
      email: read(formData, "email"),
      phone: read(formData, "phone"),
      address_line: read(formData, "address_line"),
      city: read(formData, "city"),
      state: read(formData, "state"),
      pincode: read(formData, "pincode"),
      country: read(formData, "country") || "India",
      message: read(formData, "message"),
      website: read(formData, "website"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the dealer enquiry fields." }, { status: 400 });
    }
    if (parsed.data.website) return NextResponse.json({ ok: true });

    let visitingCardUrl: string | null = null;
    const file = formData.get("visiting_card");
    if (file instanceof File && file.size > 0) {
      validateUploadFile(file, { kind: "image-or-pdf", maxSizeMb: 8 });
      visitingCardUrl = (await uploadSharedFile(file, "dealer")).publicUrl;
    }

    const { website, ...payload } = parsed.data;
    const { error } = await supabaseAdmin.from("dealer_enquiries").insert({
      ...payload,
      message: payload.message || null,
      visiting_card_url: visitingCardUrl,
    });

    if (error) {
      console.error("Dealer enquiry insert failed:", error);
      return NextResponse.json({ error: "Could not submit dealer enquiry" }, { status: 500 });
    }

    await sendStoreNotification({
      subject: "New dealer enquiry",
      replyTo: payload.email,
      text: `${payload.contact_name}\n${payload.company_name}\n${payload.email}\n${payload.phone}\n${payload.city}, ${payload.state} ${payload.pincode}\n\n${payload.message || ""}\n\nVisiting card: ${visitingCardUrl || "-"}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Dealer enquiry error:", error);
    return NextResponse.json({ error: "Could not submit dealer enquiry" }, { status: 500 });
  }
}
