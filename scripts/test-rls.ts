import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Anon client — what your actual frontend will use
const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Admin client — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testRLS() {
  console.log("─── TEST 1: Anon client fetching products ───");
  const { data: anonProducts, error: anonError } = await supabaseAnon
    .from("products")
    .select("item_code, name, is_active");

  if (anonError) {
    console.error("Anon fetch failed:", anonError.message);
  } else {
    console.log(`Anon client sees ${anonProducts.length} products:`);
    anonProducts.forEach((p) => console.log(`  ${p.item_code} — ${p.name} (active: ${p.is_active})`));
  }

  console.log("\n─── TEST 2: Admin client fetching products ───");
  const { data: adminProducts, error: adminError } = await supabaseAdmin
    .from("products")
    .select("item_code, name, is_active");

  if (adminError) {
    console.error("Admin fetch failed:", adminError.message);
  } else {
    console.log(`Admin client sees ${adminProducts.length} products:`);
    adminProducts.forEach((p) => console.log(`  ${p.item_code} — ${p.name} (active: ${p.is_active})`));
  }

  console.log("\n─── TEST 3: Anon client submitting an enquiry ───");
  const { error: insertError } = await supabaseAnon.from("enquiries").insert({
    full_name: "Test User",
    phone: "9999999999",
    email: "test@example.com",
    city: "Mumbai",
    message: "Testing RLS insert",
    enquiry_type: "general",
  });

  if (insertError) {
    console.error("Anon insert failed (unexpected):", insertError.message);
  } else {
    console.log("Anon client successfully submitted an enquiry. ✓");
  }

  console.log("\n─── TEST 4: Anon client trying to READ enquiries (should fail/return empty) ───");
  const { data: enquiryRead, error: readError } = await supabaseAnon
    .from("enquiries")
    .select("*");

  if (readError) {
    console.log("Anon read blocked with error (expected):", readError.message);
  } else {
    console.log(`Anon client sees ${enquiryRead.length} enquiries (should be 0).`);
  }

  process.exit(0);
}

testRLS();