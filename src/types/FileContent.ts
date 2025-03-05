import { z } from 'zod';

export const FileContentSchema = z.object({
  index: z.number(),
  name: z.string(),
  path: z.string(),
  content: z.string(),
});

export type FileContent = z.infer<typeof FileContentSchema>;
