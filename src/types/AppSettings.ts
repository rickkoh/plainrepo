import { z } from 'zod';

export const DarkModeSchema = z.boolean().default(false);
export const ExcludeItemSchema = z.string();
export const ExcludeListSchema = z.array(ExcludeItemSchema).default([]);
export const ReplaceItemSchema = z.object({ from: z.string(), to: z.string() });
export const ReplaceListSchema = z.array(ReplaceItemSchema).default([]);
export const ShouldIncludeGitIgnoreSchema = z.boolean().default(true);
export const CopyLimitSchema = z.coerce.number().default(500000);
export const ChunkSizeSchema = z.coerce.number().default(1000);
export const MaxFileSizeSchema = z.coerce
  .number()
  .transform((val) => (val <= 0 ? 1 : val))
  .default(8);

export const AppSettingsSchema = z.object({
  darkMode: DarkModeSchema.optional(),
  exclude: ExcludeListSchema.optional(),
  replace: ReplaceListSchema.optional(),
  shouldIncludeGitIgnore: ShouldIncludeGitIgnoreSchema.optional(),
  copyLimit: CopyLimitSchema.optional(),
  chunkSize: ChunkSizeSchema.optional(),
  maxFileSize: MaxFileSizeSchema.optional(),
});

export type DarkMode = z.infer<typeof DarkModeSchema>;
export type ExcludeItem = z.infer<typeof ExcludeItemSchema>;
export type ExcludeList = z.infer<typeof ExcludeListSchema>;
export type ReplaceItem = z.infer<typeof ReplaceItemSchema>;
export type ReplaceList = z.infer<typeof ReplaceListSchema>;
export type ShouldIncludeGitIgnore = z.infer<
  typeof ShouldIncludeGitIgnoreSchema
>;
export type CopyLimit = z.infer<typeof CopyLimitSchema>;
export type ChunkSize = z.infer<typeof ChunkSizeSchema>;
export type MaxFileSize = z.infer<typeof MaxFileSizeSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
