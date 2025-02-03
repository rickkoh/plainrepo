import { z } from 'zod';

export const BaseFileNodeSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory']),
  selected: z.boolean().optional(),
});

export type BaseFileNode = z.infer<typeof BaseFileNodeSchema>;

export const BaseFileNodesSchema = z.array(BaseFileNodeSchema);

export type BaseFileNodes = z.infer<typeof BaseFileNodesSchema>;

export const FileNodeSchema: z.ZodType<BaseFileNode> =
  BaseFileNodeSchema.extend({
    children: z.lazy(() => z.array(FileNodeSchema)).optional(),
  });

export const BaseFileContentNodeSchema = BaseFileNodeSchema.extend({
  content: z.string().optional(),
});

export type BaseFileContentNode = z.infer<typeof BaseFileContentNodeSchema>;

export const BaseFileContentNodesSchema = z.array(BaseFileContentNodeSchema);

export type BaseFileContentNodes = z.infer<typeof BaseFileContentNodesSchema>;

export const FileNodeContentSchema: z.ZodType<BaseFileContentNode> =
  BaseFileContentNodeSchema.extend({
    children: z.lazy(() => z.array(FileNodeContentSchema)).optional(),
  });

export const FileNodesSchema = z.array(FileNodeSchema);

export const FileNodeContentsSchema = z.array(FileNodeContentSchema);

export type FileNode = {
  name: string; // Name of the file or directory
  path: string; // Path of the file or directory
  type: 'file' | 'directory'; // Type: 'file' or 'directory'
  selected?: boolean; // Optional: Whether the node is selected
  children?: FileNode[]; // Optional: Recursive structure for children
};

// Type inference for an array of file nodes
export type FileNodes = FileNode[];

export type FileContentNode = {
  content?: string; // Content of the file
  children?: FileContentNode[]; // Optional: Recursive structure for children
} & BaseFileNode;

export type FileNodeContents = FileContentNode[];
