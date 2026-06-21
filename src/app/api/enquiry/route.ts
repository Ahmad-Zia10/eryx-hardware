import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { enquirySchema } from "@/lib/validations/enquiry";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
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