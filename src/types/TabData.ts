import { z } from 'zod';
import { FileNodeSchema } from './FileNode';

export const TabDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileNode: FileNodeSchema,
  content: z.string(),
  tokenCount: z.number(),
});

export const TabDataArraySchema = z.array(TabDataSchema);

export type TabData = z.infer<typeof TabDataSchema>;
export type TabDataArray = z.infer<typeof TabDataArraySchema>;
