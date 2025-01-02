import { z } from 'zod';

export const BaseFileNodeSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory']),
  selected: z.boolean().optional(),
  opened: z.boolean().optional(),
});

type BaseFileNode = z.infer<typeof BaseFileNodeSchema>;

export const FileNodeSchema: z.ZodType<BaseFileNode> =
  BaseFileNodeSchema.extend({
    children: z.lazy(() => z.array(FileNodeSchema)).optional(),
  });

export const FileNodesSchema = z.array(FileNodeSchema);

export type FileNode = z.infer<typeof BaseFileNodeSchema> & {
  children?: z.infer<typeof FileNodesSchema>; // Recursive structure for children
};
export type FileNodes = z.infer<typeof FileNodesSchema>;
