import { z } from 'zod';
import { FileNode, FileNodeSchema } from './FileNode';

export const TabDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  fileNode: FileNodeSchema,
  content: z.string(),
  tokenCount: z.number(),
});

export const TabDataArraySchema = z.array(TabDataSchema);

export type TabData = {
  id: string;
  title: string;
  fileNode: FileNode;
  content: string;
  tokenCount: number;
};
export type TabDataArray = TabData[];
