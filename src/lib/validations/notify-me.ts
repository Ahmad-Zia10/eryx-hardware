import { z } from "zod";

export const notifyMeSchema = z.object({
  variant_id: z.string().uuid(),
  email: z.string().trim().toLowerCase().email().max(254),
});

export type NotifyMeInput = z.infer<typeof notifyMeSchema>;
