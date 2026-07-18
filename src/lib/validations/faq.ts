import { z } from "zod";

export const faqCategoryInputSchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80),
  is_visible: z.boolean().default(true),
});

export type FaqCategoryInput = z.infer<typeof faqCategoryInputSchema>;

export const faqInputSchema = z.object({
  category_id: z.string().uuid(),
  question: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters.")
    .max(300),
  answer: z
    .string()
    .trim()
    .min(3, "Answer must be at least 3 characters.")
    .max(3000),
  is_visible: z.boolean().default(true),
});

export type FaqInput = z.infer<typeof faqInputSchema>;
