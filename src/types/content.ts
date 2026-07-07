import { z } from 'zod';

export const ContentSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type Content = z.infer<typeof ContentSchema>;
