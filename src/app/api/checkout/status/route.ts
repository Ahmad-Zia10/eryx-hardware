import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Deliberately minimal — returns only the status field, nothing else.
// Protected by the same RLS policy as the success page itself
// (auth.uid() = customer_id), so this can't be used to probe whether
// an arbitrary order_id exists or belongs to someone else.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ status: order.status });
}