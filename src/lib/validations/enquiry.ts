import { z } from "zod";

export const enquirySchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  email: z.string().email("Enter a valid email address"),
  city: z.string().min(2).max(50).optional(),
  message: z.string().max(1000).optional(),
  enquiry_type: z.enum(["product", "dealer", "bulk", "general"]),
  product_id: z.string().uuid().optional(),
  product_name: z.string().max(200).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;