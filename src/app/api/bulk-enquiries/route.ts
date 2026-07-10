import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendCustomerConfirmation, sendStoreNotification } from "@/lib/server/notifications";

const schema = z.object({
  customer_name: z.string().min(2).max(120),
  company_name: z.string().max(160).optional(),
  email: z.string().email().max(200),
  phone: z.string().regex(/^[0-9+\-\s()]{8,20}$/),
  message: z.string().max(2000).optional(),
  website: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive().max(9999),
    note: z.string().max(500).optional(),
  })).min(1).max(25),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the enquiry details." }, { status: 400 });
    }
    if (parsed.data.website) return NextResponse.json({ ok: true });

    const variantIds = parsed.data.items.map((item) => item.product_id);
    const { data: variants, error: variantError } = await supabaseAdmin
      .from("product_variants")
      .select("id, item_code, name, product:products(name)")
      .in("id", variantIds);

    if (variantError) {
      throw new Error(variantError.message);
    }

    const productNameById = new Map(
      (variants || []).map((variant: any) => [
        variant.id,
        `${variant.product?.name || variant.name} (${variant.item_code})`,
      ])
    );

    const { data: enquiry, error: enquiryError } = await supabaseAdmin
      .from("bulk_enquiries")
      .insert({
        customer_name: parsed.data.customer_name,
        company_name: parsed.data.company_name || null,
        email: parsed.data.email,
        phone: parsed.data.phone,
        message: parsed.data.message || null,
      })
      .select("id")
      .single();

    if (enquiryError || !enquiry) {
      throw new Error(enquiryError?.message || "Failed to create enquiry");
    }

    const { error: itemError } = await supabaseAdmin.from("bulk_enquiry_items").insert(
      parsed.data.items.map((item) => ({
        bulk_enquiry_id: enquiry.id,
        product_id: item.product_id,
        product_name_snapshot: productNameById.get(item.product_id) || "Unknown product",
        quantity: item.quantity,
        note: item.note || null,
      }))
    );

    if (itemError) {
      await supabaseAdmin.from("bulk_enquiries").delete().eq("id", enquiry.id);
      throw new Error(itemError.message);
    }

    const itemSummary = parsed.data.items
      .map((item) => `${productNameById.get(item.product_id) || item.product_id} x ${item.quantity}`)
      .join("\n");

    await sendStoreNotification({
      subject: "New bulk enquiry",
      replyTo: parsed.data.email,
      text: `${parsed.data.customer_name}\n${parsed.data.email}\n${parsed.data.phone}\n\n${itemSummary}\n\n${parsed.data.message || ""}`,
    });
    await sendCustomerConfirmation({
      to: parsed.data.email,
      subject: "We received your Eryx bulk enquiry",
      text: `Thanks ${parsed.data.customer_name},\n\nWe received your bulk enquiry and will contact you soon.\n\n${itemSummary}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bulk enquiry error:", error);
    return NextResponse.json({ error: "Could not submit enquiry" }, { status: 500 });
  }
}
