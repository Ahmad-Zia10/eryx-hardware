import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { sendStoreNotification } from "@/lib/server/notifications";
import { UploadError, uploadSharedFile, validateUploadFile } from "@/lib/server/storage";

const schema = z.object({
  order_id: z.string().uuid(),
  order_item_id: z.string().uuid().optional().nullable(),
  reason: z.enum(["order_not_received", "wrong_item", "damaged_product", "refund_return", "other"]),
  message: z.string().min(10).max(2000),
});

function read(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const parsed = schema.safeParse({
      order_id: read(formData, "order_id"),
      order_item_id: read(formData, "order_item_id") || null,
      reason: read(formData, "reason"),
      message: read(formData, "message"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the support request fields." }, { status: 400 });
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, customer_email")
      .eq("id", parsed.data.order_id)
      .eq("customer_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let attachmentUrl: string | null = null;
    const file = formData.get("attachment");
    if (file instanceof File && file.size > 0) {
      validateUploadFile(file, { kind: "image", maxSizeMb: 5 });
      attachmentUrl = (await uploadSharedFile(file, "support")).publicUrl;
    }

    const { data: request, error } = await supabaseAdmin
      .from("support_requests")
      .insert({
        user_id: user.id,
        order_id: parsed.data.order_id,
        order_item_id: parsed.data.order_item_id || null,
        reason: parsed.data.reason,
        message: parsed.data.message,
        attachment_url: attachmentUrl,
      })
      .select("id")
      .single();

    if (error || !request) {
      throw new Error(error?.message || "Failed to create support request");
    }

    await sendStoreNotification({
      subject: `New support request ${request.id}`,
      replyTo: user.email || order.customer_email,
      text: `Request: ${request.id}\nOrder: ${parsed.data.order_id}\nReason: ${parsed.data.reason}\n\n${parsed.data.message}\n\nAttachment: ${attachmentUrl || "-"}`,
    });

    return NextResponse.json({ ok: true, id: request.id });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Support request error:", error);
    return NextResponse.json({ error: "Could not submit support request" }, { status: 500 });
  }
}
