import { z } from 'zod';

export const FileContentSchema = z.object({
  name: z.string(),
  path: z.string(),
  content: z.string(),
});

export type FileContent = z.infer<typeof FileContentSchema>;
