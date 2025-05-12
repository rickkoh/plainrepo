import { z } from 'zod';

export const FileNodeSelectionSchema = z.object({
  path: z.string(),
  selected: z.boolean(),
});

export const FileNodeExpandSchema = z.object({
  path: z.string(),
  expanded: z.boolean(),
});

export type FileNodeSelectionDto = z.infer<typeof FileNodeSelectionSchema>;
export type FileNodeExpandDto = z.infer<typeof FileNodeExpandSchema>;
