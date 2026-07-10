import { z } from 'zod';

export const ContentSchema = z.object({
  title: z.string(),
  script: z.string().max(700).refine(s => s.trim().split(/\s+/).length <= 100, 'Script too long (must be under 100 words)'),
  blog_html: z.string(),
  tags: z.array(z.string()),
  image_prompts: z.array(z.string()).length(5),
});

export type Content = z.infer<typeof ContentSchema>;
