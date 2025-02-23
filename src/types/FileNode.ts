import { z } from 'zod';

export const BaseFileNodeSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory']),
  content: z.string().optional(),
  selected: z.boolean().optional(),
});

export type BaseFileNode = z.infer<typeof BaseFileNodeSchema>;

export const BaseFileNodesSchema = z.array(BaseFileNodeSchema);

export type BaseFileNodes = z.infer<typeof BaseFileNodesSchema>;

export const FileNodeSchema: z.ZodType<BaseFileNode> =
  BaseFileNodeSchema.extend({
    children: z.lazy(() => z.array(FileNodeSchema)).optional(),
  });

export const FileNodesSchema = z.array(FileNodeSchema);

export type FileNode = {
  name: string; // Name of the file or directory
  path: string; // Path of the file or directory
  type: 'file' | 'directory'; // Type: 'file' or 'directory'
  selected?: boolean; // Optional: Whether the node is selected
  content?: string; // Optional: Content of the file
  children?: FileNode[]; // Optional: Recursive structure for children
};

// Type inference for an array of file nodes
export type FileNodes = FileNode[];
