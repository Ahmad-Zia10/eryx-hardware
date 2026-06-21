import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const sampleProducts = [
  {
    item_code: "EGP12-450",
    catalogue_sno: 1,
    name: "Golden Pantry 12x450",
    description: "Full-height pull-out pantry unit with golden finish",
    series: "Golden",
    material: "Metal",
    category: "pantry-units",
    product_line: "kitchen",
    finish: "golden",
    width_mm: 414,
    depth_mm: 500,
    height_mm: 1900,
    mrp: 28600,
    is_featured: true,
    is_active: true,
  },
  {
    item_code: "EGP12-600",
    catalogue_sno: 2,
    name: "Golden Pantry 12x600",
    description: "Full-height pull-out pantry unit, wider variant",
    series: "Golden",
    material: "Metal",
    category: "pantry-units",
    product_line: "kitchen",
    finish: "golden",
    width_mm: 564,
    depth_mm: 500,
    height_mm: 1900,
    mrp: 32150,
    is_featured: false,
    is_active: true,
  },
  {
    item_code: "EWPC12-450",
    catalogue_sno: 3,
    name: "Wooden Pantry Chrome",
    description: "Full-height pull-out pantry unit with chrome accents",
    series: "Wooden",
    material: "Wood",
    category: "pantry-units",
    product_line: "kitchen",
    finish: "chrome",
    width_mm: 414,
    depth_mm: 500,
    height_mm: 1900,
    mrp: 23950,
    is_featured: false,
    is_active: true,
  },
  {
    item_code: "ESCL-001",
    catalogue_sno: 15,
    name: "Golden Swing Corner Left",
    description: "Space-optimizing corner unit, left swing mechanism",
    series: "Golden",
    material: "Metal",
    category: "corner-units",
    product_line: "kitchen",
    finish: "golden",
    width_mm: 864,
    depth_mm: 500,
    height_mm: 720,
    dimension_notes: "Height range 620-720mm",
    mrp: 16800,
    is_featured: true,
    is_active: true,
  },
  {
    item_code: "ESB-202",
    catalogue_sno: 42,
    name: "Slim Box Dark Grey 202mm",
    description: "Slim profile drawer system, dark grey finish",
    series: null,
    material: "Metal",
    category: "slim-box",
    product_line: "hardware",
    finish: "dark-grey",
    width_mm: 450,
    mrp: 3750,
    is_featured: false,
    is_active: true,
  },
  {
    item_code: "EH-3D-001",
    catalogue_sno: 88,
    name: "Black 3D Hinge",
    description: "Adjustable 3D hinge with soft-close mechanism",
    series: null,
    material: "Metal",
    category: "hinges",
    product_line: "hardware",
    finish: "black",
    mrp: 145,
    is_featured: false,
    is_active: true,
  },
  {
    item_code: "EPSTRM-001",
    catalogue_sno: 120,
    name: "Single Trouser Rack Mocha",
    description: "Pull-out trouser rack for wardrobe, mocha finish",
    series: "Mocha",
    material: "Metal",
    category: "wardrobe-accessories-mocha",
    product_line: "wardrobe",
    finish: null,
    width_mm: 450,
    mrp: 1890,
    is_featured: true,
    is_active: true,
  },
  {
    item_code: "EWB-INACTIVE-01",
    catalogue_sno: 200,
    name: "Discontinued Waste Bin",
    description: "Test product to verify inactive filtering",
    category: "waste-bins",
    product_line: "kitchen",
    mrp: 5000,
    is_featured: false,
    is_active: false, // intentionally inactive — tests RLS filtering
  },
];

async function seed() {
  console.log("Seeding products...");

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(sampleProducts)
    .select();

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} products.`);
  process.exit(0);
}

seed();