import { z } from 'zod';

export const ContentSchema = z.object({
  title: z.string(),
  script: z.string(),
  blog_html: z.string(),
  tags: z.array(z.string()),
  image_prompts: z.array(z.string()).length(4),
});

export type Content = z.infer<typeof ContentSchema>;
