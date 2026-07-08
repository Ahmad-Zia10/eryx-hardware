import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendStoreNotification } from "@/lib/server/notifications";

const submissionsByIp = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5;

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().regex(/^[0-9+\-\s()]{8,20}$/),
  subject: z.enum(["general", "order_support", "product_question", "partnership", "other"]),
  message: z.string().min(10).max(2000),
  order_reference: z.string().max(120).optional().nullable(),
  website: z.string().optional(),
});

function checkRateLimit(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const previous = submissionsByIp.get(ip)?.filter((timestamp) => now - timestamp < WINDOW_MS) || [];
  if (previous.length >= LIMIT) return false;
  submissionsByIp.set(ip, [...previous, now]);
  return true;
}

export async function POST(req: Request) {
  try {
    if (!checkRateLimit(req)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please check the form fields and try again." }, { status: 400 });
    }

    if (parsed.data.website) {
      return NextResponse.json({ ok: true });
    }

    const { website, ...payload } = parsed.data;
    const { error } = await supabaseAdmin.from("contact_submissions").insert({
      ...payload,
      order_reference: payload.subject === "order_support" ? payload.order_reference || null : null,
    });

    if (error) {
      console.error("Contact submission failed:", error);
      return NextResponse.json({ error: "Could not submit your message" }, { status: 500 });
    }

    await sendStoreNotification({
      subject: `New contact submission: ${payload.subject}`,
      replyTo: payload.email,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nSubject: ${payload.subject}\nOrder: ${payload.order_reference || "-"}\n\n${payload.message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Could not submit your message" }, { status: 500 });
  }
}
