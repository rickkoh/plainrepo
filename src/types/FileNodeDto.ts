import { z } from 'zod';

export const FileNodeSelectionSchema = z.object({
  path: z.string(),
  selected: z.boolean(),
});

export const FileNodeExpandSchema = z.object({
  path: z.string(),
  expanded: z.boolean(),
});

export const FileNodeSearchSchema = z.object({
  searchTerm: z.string(),
  includeFiles: z.boolean().optional(),
  includeDirs: z.boolean().optional(),
  maxResults: z.number().optional(),
  caseSensitive: z.boolean().optional(),
});

export type FileNodeSelectionDto = z.infer<typeof FileNodeSelectionSchema>;
export type FileNodeExpandDto = z.infer<typeof FileNodeExpandSchema>;
export type FileNodeSearchDto = z.infer<typeof FileNodeSearchSchema>;
