import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { chatMissSchema } from "@/lib/validations/chat";
import { normalise } from "@/lib/chat/matcher";
import { scrubPersonalData } from "@/lib/chat/scrub";
import { clientIp, createRateLimiter } from "@/lib/server/rate-limit";

// Ryx v1.1: logs questions the chat assistant couldn't answer. The
// client fires this and forgets it, so the response carries no detail:
// 204 for anything handled (including invalid input and DB failures),
// 429 when the best-effort per-IP limit trips. The hard flood guard
// lives in the log_chat_query RPC.
const limiter = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });

const noContent = () => new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  if (!limiter.check(clientIp(req))) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return noContent();
  }

  const parsed = chatMissSchema.safeParse(body);
  if (!parsed.success) return noContent();

  const sample = scrubPersonalData(parsed.data.query);
  const normalised = normalise(sample);
  if (!normalised) return noContent();

  const path = parsed.data.page_path?.split(/[?#]/)[0] ?? null;

  try {
    const { data: accepted, error } = await supabaseAdmin.rpc("log_chat_query", {
      p_kind: parsed.data.kind,
      p_normalised: normalised,
      p_sample: sample,
      p_path: path,
    });
    if (error) {
      console.error("[chat/unanswered] log failed:", error.message);
    } else if (accepted === false) {
      console.warn("[chat/unanswered] hourly ceiling reached; new question dropped");
    }
  } catch (error) {
    console.error("[chat/unanswered] log failed:", error);
  }

  return noContent();
}
