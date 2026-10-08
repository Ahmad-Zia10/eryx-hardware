import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { enquirySchema } from "@/lib/validations/enquiry";
import { apiSuccess, apiError } from "@/lib/api-response";
import { clientIp, createRateLimiter } from "@/lib/server/rate-limit";

// Best-effort per-instance limit (see rate-limit.ts): 5 enquiries per IP per hour.
const limiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });

export async function POST(request: NextRequest) {
  if (!limiter.check(clientIp(request))) {
    return apiError("Too many submissions. Please try again later.", 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return apiError("Invalid request body", 400);
  }

  const result = enquirySchema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return apiError(firstError.message, 400);
  }

  const { data, error } = await supabaseAdmin
    .from("enquiries")
    .insert(result.data)
    .select()
    .single();

  if (error) {
    console.error("Enquiry insert failed:", error.message);
    return apiError("Something went wrong submitting your enquiry. Please try again.", 500);
  }

  return apiSuccess(data, 201);
}