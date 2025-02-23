import { z } from 'zod';

export const BaseFileNodeSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory']),
  content: z.string().optional(),
  lastSynced: z.coerce.date().optional(),
  selected: z.boolean().optional(),
});

export type BaseFileNode = z.infer<typeof BaseFileNodeSchema>;

export const FileNodeSchema: z.ZodType<BaseFileNode> =
  BaseFileNodeSchema.extend({
    children: z.lazy(() => z.array(FileNodeSchema)).optional(),
  });

export type FileNode = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  selected?: boolean;
  content?: string;
  lastSynced?: Date;
  children?: FileNode[];
};

// Type inference for an array of file nodes
export type FileNodes = FileNode[];
